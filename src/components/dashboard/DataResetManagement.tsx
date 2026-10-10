"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function DataResetManagement() {
    const tableCounts = useQuery(api.dataManagement.getTableCounts);
    const purgeData = useMutation(api.dataManagement.purgeData);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScope, setSelectedScope] = useState<"customers_and_retention" | "all_except_admin">("customers_and_retention");
    const [confirmText, setConfirmText] = useState("");
    const [isPurging, setIsPurging] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    const isDev = typeof window !== "undefined" && (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local")
    );

    const handleOpenModal = (scope: "customers_and_retention" | "all_except_admin") => {
        setSelectedScope(scope);
        setConfirmText("");
        setResultMessage(null);
        setIsModalOpen(true);
    };

    const handleExecutePurge = async () => {
        if (confirmText.trim() !== "초기화 실행") {
            alert("확인 문구 '초기화 실행'을 정확하게 입력해주세요.");
            return;
        }

        setIsPurging(true);
        setResultMessage(null);

        try {
            // 배치 삭제 진행 (남은 데이터가 있으면 반복 호출)
            let totalDeleted = 0;
            let iteration = 0;
            const maxIterations = 20;

            while (iteration < maxIterations) {
                iteration++;
                const res = await purgeData({ scope: selectedScope });
                totalDeleted += res.deletedCount;

                // 더 이상 삭제할 레코드가 없으면 종료
                if (res.deletedCount === 0) {
                    break;
                }
            }

            setResultMessage(`성공적으로 초기화되었습니다! (총 ${totalDeleted.toLocaleString()}건 삭제 완료)`);
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Data purge error:", error);
            alert(`초기화 중 오류가 발생했습니다: ${error.message || error}`);
        } finally {
            setIsPurging(false);
        }
    };

    const totalPrimaryCount = tableCounts
        ? (tableCounts.applications +
           tableCounts.statusHistory +
           tableCounts.retentionRecords +
           tableCounts.retentionRecords2 +
           ((tableCounts as any).retentionRecords3 || 0) +
           tableCounts.retentionMemos +
           tableCounts.retentionMemos2 +
           tableCounts.analytics +
           tableCounts.customers)
        : 0;

    return (
        <div className="space-y-6">
            {/* 상단 안내 & 환경 배지 */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-sono-dark tracking-tight">전산 데이터 초기화</h2>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                                isDev 
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                    : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                                {isDev ? "🛠️ 로컬 개발 DB 연결 중" : "🚀 운영(실사이트) DB 연결 중"}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm font-medium mt-1">
                            실제 엑셀 데이터를 업로드하기 전에 기존 테스트 및 신청 데이터를 깨끗하게 초기화합니다.
                        </p>
                    </div>

                    {/* 안전 보장 배지 */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
                        <span className="text-base">🔒</span>
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 block">관리자 계정(admins) 영구 보존</span>
                            <span className="text-slate-400 text-[11px]">초기화 시에도 관리자 로그인은 절대 유지됩니다</span>
                        </div>
                    </div>
                </div>

                {/* 성공 메시지 알림 */}
                {resultMessage && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-fade-in">
                        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-bold text-sm">{resultMessage}</span>
                    </div>
                )}

                {/* 현재 Convex 실시간 데이터 현황 */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-gray-700 flex items-center gap-2">
                            <span>📊 현재 Convex 데이터베이스 실시간 보관 현황</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </h3>
                        <span className="text-xs font-bold text-sono-primary">
                            고객/유지율 총 {totalPrimaryCount.toLocaleString()}건
                        </span>
                    </div>

                    {!tableCounts ? (
                        <div className="py-8 text-center text-gray-400 text-sm font-medium animate-pulse">
                            Convex 실시간 데이터 건수를 집계하고 있습니다...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {/* 고객 신청 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">고객 신청 내역 (applications)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className={`text-2xl font-black ${tableCounts.applications > 0 ? "text-sono-primary" : "text-gray-400"}`}>
                                        {tableCounts.applications.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">건</span>
                                </div>
                            </div>

                            {/* 유지율 1 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">유지율 현황 (retentionRecords)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className={`text-2xl font-black ${tableCounts.retentionRecords > 0 ? "text-indigo-600" : "text-gray-400"}`}>
                                        {tableCounts.retentionRecords.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">건</span>
                                </div>
                            </div>

                            {/* 유지율 2 (연체/환수) */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">연체/환수 현황 (retentionRecords2)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className={`text-2xl font-black ${tableCounts.retentionRecords2 > 0 ? "text-indigo-600" : "text-gray-400"}`}>
                                        {tableCounts.retentionRecords2.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">건</span>
                                </div>
                            </div>

                            {/* 유지율 3 (8월 이후 가입) */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">연체(8월 이후 가입) (retentionRecords3)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className={`text-2xl font-black ${((tableCounts as any).retentionRecords3 || 0) > 0 ? "text-indigo-600" : "text-gray-400"}`}>
                                        {((tableCounts as any).retentionRecords3 || 0).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">건</span>
                                </div>
                            </div>

                            {/* 상태 이력 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">상태 변경 이력 (statusHistory)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className={`text-2xl font-black ${tableCounts.statusHistory > 0 ? "text-slate-700" : "text-gray-400"}`}>
                                        {tableCounts.statusHistory.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">건</span>
                                </div>
                            </div>

                            {/* 유지율 메모 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">유지율 메모/이력 (retentionMemos)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className={`text-2xl font-black ${tableCounts.retentionMemos + tableCounts.retentionMemos2 > 0 ? "text-slate-700" : "text-gray-400"}`}>
                                        {(tableCounts.retentionMemos + tableCounts.retentionMemos2).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">건</span>
                                </div>
                            </div>

                            {/* 방문 통계 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">방문자 접속 통계 (analytics)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className={`text-2xl font-black ${tableCounts.analytics > 0 ? "text-slate-700" : "text-gray-400"}`}>
                                        {tableCounts.analytics.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">건</span>
                                </div>
                            </div>

                            {/* 파트너사 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                <span className="text-xs font-bold text-gray-500">등록 파트너사 (partners)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-2xl font-black text-amber-600">
                                        {tableCounts.partners.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold">개사</span>
                                </div>
                            </div>

                            {/* 총괄 관리자 (보존) */}
                            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-800">관리자 계정 (admins)</span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">보존됨</span>
                                </div>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-2xl font-black text-emerald-700">
                                        {tableCounts.admins.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-emerald-600 font-bold">계정 (보호)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 초기화 작업 실행 카드 */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-base font-black text-sono-dark mb-4">초기화 작업 선택</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. 고객 및 유지율 데이터만 초기화 */}
                        <div className="p-6 rounded-3xl border-2 border-red-100 bg-red-50/20 flex flex-col justify-between hover:border-red-300 transition-all">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🧹</span>
                                    <h4 className="text-base font-black text-red-900">고객 & 유지율 데이터 전체 초기화</h4>
                                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">추천</span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    등록된 <strong>파트너사 계정과 관리자 계정은 그대로 보존</strong>하며, 가입 신청 내역(고객), 상태 이력, 유지율/연체 엑셀 레코드만 깨끗하게 0건으로 비웁니다.
                                </p>
                                <div className="mt-3 text-[11px] text-gray-400 font-medium">
                                    삭제 대상: applications, statusHistory, retentionRecords, retentionRecords2, retentionRecords3, retentionMemos, analytics
                                </div>
                            </div>
                            <button
                                onClick={() => handleOpenModal("customers_and_retention")}
                                disabled={isPurging}
                                className="mt-6 w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-md shadow-red-600/20 active:scale-98 disabled:opacity-50"
                            >
                                고객/유지율 데이터 초기화하기
                            </button>
                        </div>

                        {/* 2. 관리자 제외 완전 초기화 */}
                        <div className="p-6 rounded-3xl border border-gray-200 bg-gray-50/40 flex flex-col justify-between hover:border-gray-300 transition-all">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">⚠️</span>
                                    <h4 className="text-base font-black text-gray-800">완전 초기화 (관리자 계정 제외)</h4>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    <strong>총괄 관리자 계정을 제외한 모든 데이터(파트너사 계정, 파트너 신청 포함)를 전면 삭제</strong>하여 완전히 새로운 사이트 상태로 만듭니다.
                                </p>
                                <div className="mt-3 text-[11px] text-gray-400 font-medium">
                                    삭제 대상: 파트너사 전체 + 고객/유지율/통계 데이터 전체 (admins만 보존)
                                </div>
                            </div>
                            <button
                                onClick={() => handleOpenModal("all_except_admin")}
                                disabled={isPurging}
                                className="mt-6 w-full py-3.5 bg-slate-800 hover:bg-black text-white rounded-2xl font-black text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
                            >
                                파트너 포함 완전 초기화하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 안전 확인 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] max-w-md w-full p-6 md:p-8 shadow-2xl border border-red-100 animate-scale-up">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                            🚨
                        </div>
                        <h3 className="text-xl font-black text-center text-sono-dark">
                            정말 데이터를 초기화하시겠습니까?
                        </h3>
                        <p className="text-xs text-center text-gray-500 mt-2 leading-relaxed">
                            {selectedScope === "customers_and_retention" ? (
                                <>
                                    고객 신청 및 유지율/연체 데이터 전체가 삭제됩니다.<br />
                                    (파트너 계정 및 <strong>관리자 계정은 보존</strong>됩니다)
                                </>
                            ) : (
                                <>
                                    파트너 계정을 포함한 전산 데이터 전체가 삭제됩니다.<br />
                                    (오직 <strong>관리자 계정만 안전하게 보존</strong>됩니다)
                                </>
                            )}
                        </p>

                        <div className="my-6 p-4 bg-red-50 rounded-2xl border border-red-200">
                            <label className="text-xs font-bold text-red-900 block mb-2">
                                확인을 위해 아래 입력창에 <span className="underline font-black">&quot;초기화 실행&quot;</span>을 입력하세요:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="초기화 실행"
                                className="w-full px-4 py-2.5 bg-white border border-red-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isPurging}
                                className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleExecutePurge}
                                disabled={confirmText.trim() !== "초기화 실행" || isPurging}
                                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm transition-all shadow-md shadow-red-600/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPurging ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>초기화 중...</span>
                                    </>
                                ) : (
                                    <span>초기화 확정</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
