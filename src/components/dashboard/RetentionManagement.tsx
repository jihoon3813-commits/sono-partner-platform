import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import * as XLSX from "xlsx";
import { Partner } from "@/lib/types";

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
            normalPayment: filtered.filter(r => r.paymentStatus === "정상").length,
            delinquent: filtered.filter(r => r.paymentStatus.includes("연체")).length,
            delinquentCounts: {} as Record<string, number>,
            cancelCount: filtered.filter(r => r.cancelStatus && r.cancelStatus !== "").length,
            cardCount: filtered.filter(r => r.paymentMethod === "카드").length,
            cmsCount: filtered.filter(r => r.paymentMethod === "CMS").length,
        };

        filtered.forEach(r => {
            if (r.paymentStatus.includes("연체")) {
                stats.delinquentCounts[r.paymentStatus] = (stats.delinquentCounts[r.paymentStatus] || 0) + 1;
            }
        });
        return stats;
    }, [periodFilteredRecords]);

    // 검색 필터링
    const filteredRecords = useMemo(() => {
        return periodFilteredRecords.filter(r => 
            r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.certNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.idNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [periodFilteredRecords, searchTerm]);

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
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {[
                            { id: "current", label: "당월" },
                            { id: "previous", label: "전월" },
                            { id: "year", label: "1년" },
                            { id: "cumulative", label: "누적" },
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setPeriodFilter(p.id)}
                                className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                                    periodFilter === p.id 
                                    ? "bg-white text-sono-primary shadow-sm" 
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
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
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">전체 회원</div>
                    <div className="text-2xl font-black text-sono-dark tracking-tighter">{displayStats.total.toLocaleString()}명</div>
                </div>
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-emerald-100 bg-emerald-50/10">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">정상 납입</div>
                    <div className="text-2xl font-black text-emerald-600 tracking-tighter">{displayStats.normalPayment.toLocaleString()}명</div>
                </div>
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-red-100 bg-red-50/10">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">연체 회원</div>
                    <div className="text-2xl font-black text-red-600 tracking-tighter">{displayStats.delinquent.toLocaleString()}명</div>
                </div>
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-orange-100 bg-orange-50/10">
                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">해약/철회</div>
                    <div className="text-2xl font-black text-orange-600 tracking-tighter">{displayStats.cancelCount.toLocaleString()}건</div>
                </div>
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
                        {Object.entries(displayStats.delinquentCounts).sort().map(([status, count]) => (
                            <div key={status} className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 mr-2">{status}</span>
                                <span className="text-sm font-black text-sono-dark">{count}명</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 파트너 매핑 설정 (Admin 전용) */}
                {isAdmin && (
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 h-full">
                            <h3 className="text-lg font-black text-sono-dark tracking-tighter mb-4">파트너 권한 설정</h3>
                            <div className="space-y-3">
                                {partners.map(p => {
                                    const mapping = mappings?.find(m => m.partnerId === p.partnerId);
                                    const isSelected = selectedPartnerForMapping === p.partnerId;
                                    
                                    return (
                                        <div 
                                            key={p.partnerId} 
                                            onClick={() => setSelectedPartnerForMapping(p.partnerId)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
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

                            {selectedPartnerForMapping && (
                                <div className="mt-8 pt-8 border-t border-gray-100 animate-slide-up">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                                        {partners.find(p => p.partnerId === selectedPartnerForMapping)?.companyName} 매핑 선택
                                    </h4>
                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                        {availableIdNos?.map(idNo => {
                                            const currentMapping = mappings?.find(m => m.partnerId === selectedPartnerForMapping);
                                            const isMapped = currentMapping?.idNos.includes(idNo);
                                            
                                            return (
                                                <label key={idNo} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isMapped}
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
                )}

                {/* 데이터 테이블 */}
                <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="고객명, 증권번호, ID_NO 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sono-primary/20 transition-all font-bold"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-400 text-center uppercase tracking-widest border-b border-gray-100">증권번호</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-400 text-center uppercase tracking-widest border-b border-gray-100">고객명</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-400 text-center uppercase tracking-widest border-b border-gray-100">가입상품</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-400 text-center uppercase tracking-widest border-b border-gray-100">납입상태</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-400 text-center uppercase tracking-widest border-b border-gray-100">납입방법</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-400 text-center uppercase tracking-widest border-b border-gray-100">회차</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-400 text-center uppercase tracking-widest border-b border-gray-100">ID_NO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-20 text-center text-gray-400 font-bold italic">조회된 데이터가 없습니다.</td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((r, i) => (
                                            <tr key={i} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 py-4 text-xs font-mono text-gray-500 text-center border-b border-gray-50">{r.certNo}</td>
                                                <td className="px-4 py-4 text-sm font-black text-sono-dark text-center border-b border-gray-50">{r.customerName}</td>
                                                <td className="px-4 py-4 text-xs font-bold text-sono-primary text-center border-b border-gray-50">{r.productName}</td>
                                                <td className="px-4 py-4 text-center border-b border-gray-50">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black shadow-sm ${
                                                        r.paymentStatus === "정상" 
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                                        : "bg-red-50 text-red-600 border border-red-100"
                                                    }`}>
                                                        {r.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-xs font-bold text-gray-500 text-center border-b border-gray-50">{r.paymentMethod}</td>
                                                <td className="px-4 py-4 text-xs font-black text-sono-dark text-center border-b border-gray-50">{r.actualPaymentCount}회</td>
                                                <td className="px-4 py-4 text-xs font-bold text-gray-400 text-center border-b border-gray-50 group-hover:text-sono-primary transition-colors">{r.idNo}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
