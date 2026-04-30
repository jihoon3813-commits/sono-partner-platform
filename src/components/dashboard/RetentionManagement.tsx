import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import * as XLSX from "xlsx";
import { Partner } from "@/lib/types";
import { nowKST } from "../../../convex/utils";

// 메모 모달 컴포넌트
function RetentionMemoModal({ 
    customerName, 
    customerKey, 
    onClose 
}: { 
    customerName: string; 
    customerKey: string; 
    onClose: () => void; 
}) {
    const memos = useQuery(api.retention.getRetentionMemos, { customerKey });
    const addMemo = useMutation(api.retention.addRetentionMemo);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await addMemo({
                customerKey,
                content: content.trim(),
                createdBy: "관리자", // 실제로는 로그인 정보를 가져와야 함
            });
            setContent("");
        } catch (error) {
            console.error(error);
            alert("메모 저장 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(true); // Re-render triggers data refresh
            setTimeout(() => setIsSubmitting(false), 500);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-sono-dark tracking-tighter">{customerName}님 상담 이력</h3>
                        <p className="text-xs text-gray-400 font-bold mt-0.5">연체 관리 및 상담 내용을 기록합니다.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {!memos ? (
                        <div className="text-center py-10 text-gray-400 animate-pulse">불러오는 중...</div>
                    ) : memos.length === 0 ? (
                        <div className="text-center py-20 text-gray-300 font-bold italic">기록된 이력이 없습니다. 첫 메모를 남겨보세요.</div>
                    ) : (
                        memos.map((memo, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-black text-sono-primary uppercase tracking-widest">{memo.createdBy}</span>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {memo.createdAt.replace('T', ' ').substring(0, 16)}
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">{memo.content}</div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="상담 내용을 입력하세요..."
                            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-sono-primary/20 outline-none resize-none min-h-[100px] font-medium"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="w-full py-4 bg-sono-primary text-white rounded-2xl font-black text-sm hover:bg-sono-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? "저장 중..." : "기록 저장하기"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

interface RetentionManagementProps {
    isAdmin?: boolean;
    partnerId?: string;
    partners?: Partner[];
}

export default function RetentionManagement({ isAdmin = false, partnerId, partners = [] }: RetentionManagementProps) {
    const records = useQuery(api.retention.getRetentionRecords, { partnerId: isAdmin ? "admin" : partnerId });
    const availableIdNos = useQuery(api.retention.getAllAvailableIdNos);
    const mappings = useQuery(api.retention.getPartnerMappings);
    
    const uploadRecords = useMutation(api.retention.uploadRetentionRecords);
    const updateMapping = useMutation(api.retention.updatePartnerMapping);

    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPartnerForMapping, setSelectedPartnerForMapping] = useState<string | null>(null);
    const [periodFilter, setPeriodFilter] = useState<string>("cumulative"); // cumulative, current, previous, year
    
    // 신규 필터 및 정렬 상태
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [productFilter, setProductFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [methodFilter, setMethodFilter] = useState("");
    const [activeStatFilter, setActiveStatFilter] = useState<string>("all");
    const [selectedCustomerForMemo, setSelectedCustomerForMemo] = useState<{name: string, key: string} | null>(null);

    // 엑셀 업로드 처리
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 헤더 제외한 데이터 파싱
            const rows = json.slice(1).filter(row => row.length > 0);
            
            const formattedRecords = rows.map(row => ({
                certNo: String(row[0] || ""),
                memberNo: String(row[1] || ""),
                joinDate: String(row[2] || ""),
                customerName: String(row[3] || ""),
                birth: String(row[4] || ""),
                phone: String(row[5] || ""),
                productName: String(row[7] || ""),
                joinStatus: String(row[8] || ""),
                b2bCompany: String(row[9] || ""),
                paymentStatus: String(row[10] || ""),
                modelName: String(row[11] || ""),
                transferDate: String(row[12] || ""),
                paymentMethod: String(row[13] || ""),
                cancelStatus: String(row[14] || ""),
                approvalStatus: String(row[15] || ""),
                b2bId: String(row[16] || ""),
                idNo: String(row[17] || ""), // ID_NO (Column R)
                discountCount: Number(row[18] || 0),
                actualPaymentCount: Number(row[19] || 0),
            }));

            await uploadRecords({ records: formattedRecords });
            alert("유지율 데이터가 성공적으로 업로드되었습니다.");
        } catch (error) {
            console.error(error);
            alert("업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    // 가입일자(YYYYMMDD)를 기반으로 기간 필터링
    const periodFilteredRecords = useMemo(() => {
        if (!records) return [];
        const now = new Date();
        const currentYearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');
        
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevYearMonth = prevDate.getFullYear().toString() + (prevDate.getMonth() + 1).toString().padStart(2, '0');

        return records.filter(r => {
            const joinYM = r.joinDate.substring(0, 6);
            if (periodFilter === "current") return joinYM === currentYearMonth;
            if (periodFilter === "previous") return joinYM === prevYearMonth;
            if (periodFilter === "year") {
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                const oneYearAgoYM = oneYearAgo.getFullYear().toString() + (oneYearAgo.getMonth() + 1).toString().padStart(2, '0');
                return joinYM >= oneYearAgoYM;
            }
            return true; // cumulative
        });
    }, [records, periodFilter]);

    // 필터링된 데이터 기반 통계 재계산
    const displayStats = useMemo(() => {
        const filtered = periodFilteredRecords;
        const stats = {
            total: filtered.length,
            normalPayment: filtered.filter(r => {
                const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");
                if (isCancel) return false;
                const isDelinquent = r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
                if (isDelinquent) return false;
                return true; // Everything else (Normal, Normal Payment, Empty) is Normal
            }).length,
            delinquent: filtered.filter(r => {
                const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");
                if (isCancel) return false;
                return r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
            }).length,
            delinquentCounts: {} as Record<string, number>,
            cancelCount: filtered.filter(r => 
                r.joinStatus.includes("해약") || 
                r.joinStatus.includes("철회") ||
                (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-")
            ).length,
            cardCount: filtered.filter(r => r.paymentMethod.includes("카드")).length,
            cmsCount: filtered.filter(r => r.paymentMethod.toUpperCase().includes("CMS") || r.paymentMethod.includes("이체")).length,
        };

        filtered.forEach(r => {
            const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");
            if (!isCancel && (r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납"))) {
                const status = r.paymentStatus || "미납";
                stats.delinquentCounts[status] = (stats.delinquentCounts[status] || 0) + 1;
            }
        });
        return stats;
    }, [periodFilteredRecords]);

    // 필터 옵션 추출
    const filterOptions = useMemo(() => {
        if (!records) return { products: [], statuses: [], methods: [] };
        
        const products = Array.from(new Set(records.map(r => r.productName))).filter(Boolean).sort();
        const statuses = Array.from(new Set(records.map(r => r.joinStatus))).filter(Boolean).sort();
        const methods = Array.from(new Set(records.map(r => r.paymentMethod))).filter(Boolean).sort();
        
        return { products, statuses, methods };
    }, [records]);

    // 검색 및 상세 필터링 + 정렬
    const filteredRecords = useMemo(() => {
        let result = periodFilteredRecords.filter(r => {
            // 검색어 필터
            const matchesSearch = searchTerm === "" || 
                r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                r.certNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                r.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.idNo.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (!matchesSearch) return false;

            // 추가 필터
            if (productFilter && r.productName !== productFilter) return false;
            if (statusFilter && r.joinStatus !== statusFilter) return false;
            if (methodFilter && r.paymentMethod !== methodFilter) return false;

            // 대시보드 토글 필터
            if (activeStatFilter !== "all") {
                const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");
                
                if (activeStatFilter === "normal") {
                    const isDelinquent = r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
                    if (isCancel || isDelinquent) return false;
                } else if (activeStatFilter === "delinquent") {
                    const isDelinquent = r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
                    if (isCancel || !isDelinquent) return false;
                } else if (activeStatFilter === "cancel") {
                    if (!isCancel) return false;
                } else if (activeStatFilter.startsWith("delinquent:")) {
                    const targetStatus = activeStatFilter.replace("delinquent:", "");
                    if (r.paymentStatus !== targetStatus && (targetStatus !== "미납" || r.paymentStatus !== "")) return false;
                }
            }

            return true;
        });

        // 정렬 적용 (고객별 그룹화 우선 후 가입일자)
        return result.sort((a, b) => {
            const keyA_real = `${a.customerName}_${a.birth}_${a.phone}`;
            const keyB_real = `${b.customerName}_${b.birth}_${b.phone}`;
            
            if (keyA_real !== keyB_real) return keyA_real.localeCompare(keyB_real);
            
            const dateA = a.joinDate.replace(/[^0-9]/g, '');
            const dateB = b.joinDate.replace(/[^0-9]/g, '');
            
            if (sortOrder === "asc") return dateA.localeCompare(dateB);
            return dateB.localeCompare(dateA);
        });
    }, [periodFilteredRecords, searchTerm, productFilter, statusFilter, methodFilter, sortOrder, activeStatFilter]);

    // 중복 고객 그룹화 데이터 생성
    const groupedData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredRecords.forEach(r => {
            const key = `${r.customerName}_${r.birth}_${r.phone}`;
            counts[key] = (counts[key] || 0) + 1;
        });
        
        // 색상 구분을 위한 시퀀스 생성
        const groupColors: Record<string, string> = {};
        let colorIdx = 0;
        const colorList = ["bg-blue-50/50", "bg-emerald-50/50", "bg-purple-50/50", "bg-amber-50/50", "bg-rose-50/50"];
        
        Object.keys(counts).forEach(key => {
            if (counts[key] > 1) {
                groupColors[key] = colorList[colorIdx % colorList.length];
                colorIdx++;
            }
        });

        return { counts, groupColors };
    }, [filteredRecords]);

    // 엑셀 다운로드
    const handleDownloadExcel = () => {
        const dataToExport = filteredRecords.map(r => ({
            "회원번호": r.memberNo,
            "가입일자": r.joinDate,
            "고객명": r.customerName,
            "생년월일": r.birth,
            "휴대전화": r.phone,
            "가입상품": r.productName,
            "가입상태": r.joinStatus,
            "납입상태": r.paymentStatus,
            "납입방법": r.paymentMethod,
            "해약처리": r.cancelStatus,
            "실납입회차": r.actualPaymentCount,
            "ID_NO": r.idNo
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "유지율현황");
        
        // 열 너비 설정
        const wscols = [
            { wch: 15 }, // 회원번호
            { wch: 12 }, // 가입일자
            { wch: 10 }, // 고객명
            { wch: 12 }, // 생년월일
            { wch: 15 }, // 휴대전화
            { wch: 20 }, // 가입상품
            { wch: 10 }, // 가입상태
            { wch: 10 }, // 납입상태
            { wch: 10 }, // 납입방법
            { wch: 15 }, // 해약처리
            { wch: 10 }, // 실납입회차
            { wch: 15 }, // ID_NO
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `유지율현황_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (!records) return <div className="p-8 text-center font-bold">데이터를 불러오는 중...</div>;

    return (
        <div className="space-y-6">
            {/* 상단 헤더 & 업로드 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-sono-dark tracking-tighter">유지율 관리</h2>
                    <p className="text-gray-400 text-sm font-bold mt-1">고객의 납입 및 유지 현황을 관리합니다.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {isAdmin && (
                        <label className={`cursor-pointer px-6 py-3 bg-sono-primary text-white rounded-2xl font-black text-sm hover:bg-sono-dark transition-all shadow-lg active:scale-95 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploading ? '업로드 중...' : '엑셀 업로드'}
                            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                        </label>
                    )}
                </div>
            </div>

            {/* 대시보드 현황판 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button 
                    onClick={() => setActiveStatFilter("all")}
                    className={`text-left transition-all bg-white p-5 rounded-[24px] shadow-sm border ${activeStatFilter === "all" ? "border-sono-primary ring-2 ring-sono-primary/20" : "border-gray-100"}`}
                >
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">전체 회원</div>
                    <div className="text-2xl font-black text-sono-dark tracking-tighter">{displayStats.total.toLocaleString()}명</div>
                </button>
                <button 
                    onClick={() => setActiveStatFilter("normal")}
                    className={`text-left transition-all bg-white p-5 rounded-[24px] shadow-sm border ${activeStatFilter === "normal" ? "border-emerald-100 ring-2 ring-emerald-500/20" : "border-gray-100"} bg-emerald-50/10`}
                >
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">정상 납입</div>
                    <div className="text-2xl font-black text-emerald-600 tracking-tighter">{displayStats.normalPayment.toLocaleString()}명</div>
                </button>
                <button 
                    onClick={() => setActiveStatFilter("delinquent")}
                    className={`text-left transition-all bg-white p-5 rounded-[24px] shadow-sm border ${activeStatFilter === "delinquent" ? "border-red-100 ring-2 ring-red-500/20" : "border-gray-100"} bg-red-50/10`}
                >
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">연체 회원</div>
                    <div className="text-2xl font-black text-red-600 tracking-tighter">{displayStats.delinquent.toLocaleString()}명</div>
                </button>
                <button 
                    onClick={() => setActiveStatFilter("cancel")}
                    className={`text-left transition-all bg-white p-5 rounded-[24px] shadow-sm border ${activeStatFilter === "cancel" ? "border-orange-100 ring-2 ring-orange-500/20" : "border-gray-100"} bg-orange-50/10`}
                >
                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">해약/철회</div>
                    <div className="text-2xl font-black text-orange-600 tracking-tighter">{displayStats.cancelCount.toLocaleString()}건</div>
                </button>
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-sono-primary/10 bg-sono-primary/5">
                    <div className="text-[10px] font-black text-sono-primary uppercase tracking-widest mb-1">납입 방법</div>
                    <div className="text-sm font-black text-sono-dark">
                        카드 {displayStats.cardCount} / CMS {displayStats.cmsCount}
                    </div>
                </div>
            </div>

            {/* 연체 상세 현황 */}
            {Object.keys(displayStats.delinquentCounts).length > 0 && (
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-sono-dark mb-4">연체 회차별 상세</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(displayStats.delinquentCounts)
                            .sort(([a], [b]) => {
                                const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
                                const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
                                if (numA !== numB) return numA - numB;
                                return a.localeCompare(b);
                            })
                            .map(([status, count]) => (
                            <button 
                                key={status} 
                                onClick={() => setActiveStatFilter(`delinquent:${status}`)}
                                className={`px-4 py-2 rounded-xl border transition-all ${
                                    activeStatFilter === `delinquent:${status}`
                                    ? "bg-red-50 border-red-200 ring-1 ring-red-500/20"
                                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                                }`}
                            >
                                <span className="text-xs font-bold text-gray-500 mr-2">{status}</span>
                                <span className="text-sm font-black text-sono-dark">{count}명</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {/* 파트너 매핑 설정 (Admin 전용) - 가로 확장 위해 상단으로 이동하거나 더 넓게 배치 */}
                {isAdmin && (
                    <div className="w-full animate-slide-up">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-sono-dark tracking-tighter mb-4 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-sono-primary rounded-full"></div>
                                        파트너 권한 설정
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {partners.map(p => {
                                            const mapping = mappings?.find(m => m.partnerId === p.partnerId);
                                            const isSelected = selectedPartnerForMapping === p.partnerId;
                                            
                                            return (
                                                <div 
                                                    key={p.partnerId} 
                                                    onClick={() => setSelectedPartnerForMapping(p.partnerId)}
                                                    className={`px-4 py-3 rounded-2xl border transition-all cursor-pointer min-w-[150px] ${
                                                        isSelected 
                                                        ? "border-sono-primary bg-sono-primary/5 ring-1 ring-sono-primary" 
                                                        : "border-gray-100 bg-white hover:border-sono-primary/30"
                                                    }`}
                                                >
                                                    <div className="text-sm font-black text-sono-dark">{p.companyName}</div>
                                                    <div className="text-[10px] text-gray-400 mt-1">
                                                        ID_NO: {mapping?.idNos.length ? mapping.idNos.join(', ') : '없음'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedPartnerForMapping && (
                                    <div className="flex-1 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 animate-slide-right">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                                {partners.find(p => p.partnerId === selectedPartnerForMapping)?.companyName} 매핑 선택
                                            </h4>
                                            <button 
                                                onClick={() => setSelectedPartnerForMapping(null)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="max-h-[150px] overflow-y-auto pr-2 flex flex-wrap gap-2 custom-scrollbar">
                                            {availableIdNos?.map(idNo => {
                                                const currentMapping = mappings?.find(m => m.partnerId === selectedPartnerForMapping);
                                                const isMapped = currentMapping?.idNos.includes(idNo);
                                                
                                                return (
                                                    <label key={idNo} className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100 min-w-[120px]">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!isMapped}
                                                            onChange={async (e) => {
                                                                const newIdNos = isMapped 
                                                                    ? currentMapping!.idNos.filter(n => n !== idNo)
                                                                    : [...(currentMapping?.idNos || []), idNo];
                                                                
                                                                await updateMapping({
                                                                    partnerId: selectedPartnerForMapping,
                                                                    idNos: newIdNos
                                                                });
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-sono-primary focus:ring-sono-primary"
                                                        />
                                                        <span className="text-sm font-bold text-sono-dark">{idNo}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 데이터 테이블 */}
                <div className="w-full">
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex flex-col gap-4 bg-white">
                             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative flex-1 max-w-md w-full">
                                    <input
                                        type="text"
                                        placeholder="고객명, 증권번호, 회원번호, ID_NO 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sono-primary/20 transition-all font-bold"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button
                                    onClick={handleDownloadExcel}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    엑셀 다운로드
                                </button>
                            </div>

                            {/* 추가 필터 선택 영역 */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex bg-gray-100 p-1 rounded-xl mr-2">
                                        {[
                                            { id: "current", label: "당월" },
                                            { id: "previous", label: "전월" },
                                            { id: "year", label: "1년" },
                                            { id: "cumulative", label: "누적" },
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setPeriodFilter(p.id)}
                                                className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all ${
                                                    periodFilter === p.id 
                                                    ? "bg-white text-sono-primary shadow-sm" 
                                                    : "text-gray-400 hover:text-gray-600"
                                                }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                                    <select 
                                        value={productFilter} 
                                        onChange={(e) => setProductFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">가입상품 전체</option>
                                        {filterOptions.products.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <select 
                                        value={statusFilter} 
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">가입상태 전체</option>
                                        {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select 
                                        value={methodFilter} 
                                        onChange={(e) => setMethodFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">납입방법 전체</option>
                                        {filterOptions.methods.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select 
                                        value={sortOrder} 
                                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="asc">가입일자 오래된순</option>
                                        <option value="desc">가입일자 최신순</option>
                                    </select>
                                    {(productFilter || statusFilter || methodFilter || activeStatFilter !== "all") && (
                                        <button 
                                            onClick={() => { 
                                                setProductFilter(""); 
                                                setStatusFilter(""); 
                                                setMethodFilter(""); 
                                                setActiveStatFilter("all");
                                            }}
                                            className="text-[10px] font-bold text-sono-primary hover:underline"
                                        >
                                            필터 초기화
                                        </button>
                                    )}
                                </div>

                                {records && records.length > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">엑셀 업데이트</span>
                                        <span className="text-[11px] font-bold text-gray-600">
                                            {records[0].uploadedAt?.substring(0, 10) || "-"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">회원번호</th>
                                        <th 
                                            className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                가입일자
                                                {sortOrder === "asc" ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">고객명</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">생년월일</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">휴대전화</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">가입상품</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">가입상태</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">납입상태</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">납입방법</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">해약처리</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">실납입회차</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">ID_NO</th>
                                        <th className="px-3 py-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter border-b border-gray-100">이력</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} className="px-4 py-20 text-center text-gray-400 font-bold italic">조회된 데이터가 없습니다.</td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((r, i) => {
                                            const customerKey = `${r.customerName}_${r.birth}_${r.phone}`;
                                            const groupBg = groupedData.groupColors[customerKey] || "";
                                            const groupCount = groupedData.counts[customerKey];
                                            const isDuplicate = groupCount > 1;

                                            // 그룹 내에서의 순서 파악
                                            let isFirstInGroup = false;
                                            let isLastInGroup = false;
                                            let groupIdxInFiltered = -1;

                                            if (isDuplicate) {
                                                const prevRecord = i > 0 ? filteredRecords[i-1] : null;
                                                const prevKey = prevRecord ? `${prevRecord.customerName}_${prevRecord.birth}_${prevRecord.phone}` : null;
                                                isFirstInGroup = prevKey !== customerKey;

                                                const nextRecord = i < filteredRecords.length - 1 ? filteredRecords[i+1] : null;
                                                const nextKey = nextRecord ? `${nextRecord.customerName}_${nextRecord.birth}_${nextRecord.phone}` : null;
                                                isLastInGroup = nextKey !== customerKey;
                                            }

                                            return (
                                                <tr key={i} className={`hover:bg-gray-100/80 transition-colors group ${groupBg}`}>
                                                    <td className="px-3 py-4 text-[11px] font-mono text-gray-500 text-center border-b border-gray-50 relative">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {isDuplicate && (
                                                                <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center">
                                                                    <div className={`w-[2px] bg-sono-primary/40 h-full relative
                                                                        ${isFirstInGroup ? "mt-4 h-[calc(100%-1rem)] rounded-t-full" : ""}
                                                                        ${isLastInGroup ? "mb-4 h-[calc(100%-1rem)] rounded-b-full" : ""}
                                                                    `}>
                                                                        {isFirstInGroup && <div className="absolute top-0 left-0 w-2 h-[2px] bg-sono-primary/40"></div>}
                                                                        {isLastInGroup && <div className="absolute bottom-0 left-0 w-2 h-[2px] bg-sono-primary/40"></div>}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <span className={isDuplicate ? "ml-4" : ""}>{r.memberNo}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-[11px] text-gray-500 text-center border-b border-gray-50">{r.joinDate}</td>
                                                    <td className="px-3 py-4 text-sm font-black text-sono-dark text-center border-b border-gray-50">{r.customerName}</td>
                                                    <td className="px-3 py-4 text-[11px] text-gray-400 text-center border-b border-gray-50">{r.birth}</td>
                                                    <td className="px-3 py-4 text-[11px] text-gray-400 text-center border-b border-gray-50">{r.phone}</td>
                                                    <td className="px-3 py-4 text-[11px] font-bold text-sono-primary text-center border-b border-gray-50">{r.productName}</td>
                                                    <td className="px-3 py-4 text-center border-b border-gray-50">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm ${
                                                            r.joinStatus.includes("정상") 
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                                            : r.joinStatus.includes("해약") || r.joinStatus.includes("철회")
                                                            ? "bg-gray-100 text-gray-500 border border-gray-200"
                                                            : "bg-blue-50 text-blue-600 border border-blue-100"
                                                        }`}>
                                                            {r.joinStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4 text-center border-b border-gray-50">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm ${
                                                            r.paymentStatus.includes("정상") 
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                                            : r.paymentStatus.includes("연체")
                                                            ? "bg-red-50 text-red-600 border border-red-100"
                                                            : "bg-gray-50 text-gray-500 border border-gray-200"
                                                        }`}>
                                                            {r.paymentStatus || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4 text-[11px] font-bold text-gray-500 text-center border-b border-gray-50">{r.paymentMethod}</td>
                                                    <td className="px-3 py-4 text-[11px] text-red-400 text-center border-b border-gray-50">{r.cancelStatus}</td>
                                                    <td className="px-3 py-4 text-xs font-black text-sono-dark text-center border-b border-gray-50">{r.actualPaymentCount}회</td>
                                                    <td className="px-3 py-4 text-[11px] font-bold text-gray-400 text-center border-b border-gray-50 group-hover:text-sono-primary transition-colors">{r.idNo}</td>
                                                    {isDuplicate ? (
                                                        isFirstInGroup ? (
                                                            <td rowSpan={groupCount} className="px-3 py-4 text-center border-b border-l border-gray-50 bg-white/50 backdrop-blur-sm">
                                                                <button 
                                                                    onClick={() => setSelectedCustomerForMemo({ name: r.customerName, key: customerKey })}
                                                                    className="p-3 bg-white hover:bg-sono-primary hover:text-white rounded-2xl transition-all text-gray-400 shadow-md border border-gray-100 hover:border-sono-primary active:scale-95"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                            </td>
                                                        ) : null
                                                    ) : (
                                                        <td className="px-3 py-4 text-center border-b border-gray-50">
                                                            <button 
                                                                onClick={() => setSelectedCustomerForMemo({ name: r.customerName, key: customerKey })}
                                                                className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-sono-primary shadow-sm border border-transparent hover:border-gray-100"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메모 모달 */}
            {selectedCustomerForMemo && (
                <RetentionMemoModal
                    customerName={selectedCustomerForMemo.name}
                    customerKey={selectedCustomerForMemo.key}
                    onClose={() => setSelectedCustomerForMemo(null)}
                />
            )}
        </div>
    );
}
