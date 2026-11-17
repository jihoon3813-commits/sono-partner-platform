"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminIcon } from "./AdminIcons";

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
        <div className="space-y-4">
            <div className="adm-section-note">
                <AdminIcon name="shield" />
                <div className="flex items-center justify-between gap-3 flex-wrap w-full">
                    <span>
                        <strong>관리자 계정(admins) 영구 보존:</strong> 전산 초기화 실행 시에도 본사 총괄관리자 로그인 계정은 안전하게 보호됩니다.
                    </span>
                    <span className={`adm-pill ${isDev ? "green" : "red"}`}>
                        {isDev ? "로컬 개발 DB 연결 중" : "운영(실사이트) DB 연결 중"}
                    </span>
                </div>
            </div>

            {resultMessage && (
                <div className="adm-note-card !bg-[#eef5eb] !border-[#cbe0c4] text-[#295e52] flex items-center gap-2.5 text-xs font-bold">
                    <AdminIcon name="check-circle" />
                    <span>{resultMessage}</span>
                </div>
            )}

            {/* 현재 Convex 실시간 데이터 현황 */}
            <section className="adm-panel overflow-hidden">
                <div className="adm-panel-head">
                    <div>
                        <h2 className="adm-panel-title">Convex 데이터베이스 실시간 보관 현황</h2>
                        <p className="adm-panel-sub">
                            실제 운영 엑셀 데이터를 업로드하기 전에 기존 테스트 및 신청 데이터를 확인하고 초기화할 수 있습니다.
                        </p>
                    </div>
                    <span className="adm-pill green">
                        고객/유지율 총 {totalPrimaryCount.toLocaleString()}건
                    </span>
                </div>

                <div className="p-5">
                    {!tableCounts ? (
                        <div className="py-10 text-center text-[#86918a] text-xs font-semibold">
                            Convex 실시간 데이터 건수를 집계하고 있습니다...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">고객 신청 내역 (applications)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#263d36] tabular-nums">
                                        {tableCounts.applications.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">건</span>
                                </div>
                            </div>

                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">유지율 현황 (retentionRecords)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#263d36] tabular-nums">
                                        {tableCounts.retentionRecords.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">건</span>
                                </div>
                            </div>

                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">연체/환수 현황 (retentionRecords2)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#263d36] tabular-nums">
                                        {tableCounts.retentionRecords2.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">건</span>
                                </div>
                            </div>

                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">연체(8월 이후 가입)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#263d36] tabular-nums">
                                        {((tableCounts as any).retentionRecords3 || 0).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">건</span>
                                </div>
                            </div>

                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">상태 변경 이력 (statusHistory)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#263d36] tabular-nums">
                                        {tableCounts.statusHistory.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">건</span>
                                </div>
                            </div>

                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">유지율 메모/이력 (retentionMemos)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#263d36] tabular-nums">
                                        {(tableCounts.retentionMemos + tableCounts.retentionMemos2).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">건</span>
                                </div>
                            </div>

                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">방문자 접속 통계 (analytics)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#263d36] tabular-nums">
                                        {tableCounts.analytics.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">건</span>
                                </div>
                            </div>

                            <div className="adm-note-card flex flex-col justify-between">
                                <span className="text-xs font-semibold text-[#6f7c6c]">등록 파트너사 (partners)</span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#9a7840] tabular-nums">
                                        {tableCounts.partners.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#86918a] font-semibold">개사</span>
                                </div>
                            </div>

                            <div className="adm-note-card !bg-[#eef5eb] !border-[#cbe0c4] flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#295e52]">관리자 계정 (admins)</span>
                                    <span className="adm-pill green">보존됨</span>
                                </div>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-[#295e52] tabular-nums">
                                        {tableCounts.admins.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#295e52] font-semibold">계정 (보호)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 초기화 작업 실행 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="adm-panel p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-[#263d36]">고객 &amp; 유지율 데이터 전체 초기화</h3>
                            <span className="adm-pill red">추천</span>
                        </div>
                        <p className="text-xs text-[#6b7768] leading-relaxed">
                            등록된 <strong>파트너사 계정과 관리자 계정은 그대로 보존</strong>하며, 가입 신청 내역(고객), 상태 이력, 유지율/연체 엑셀 레코드만 깨끗하게 0건으로 비웁니다.
                        </p>
                        <div className="mt-3 text-[11px] text-[#86918a] font-mono">
                            대상: applications, statusHistory, retentionRecords, retentionRecords2, retentionRecords3, retentionMemos, analytics
                        </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#edf0e7] flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleOpenModal("customers_and_retention")}
                            disabled={isPurging}
                            className="adm-btn danger"
                        >
                            <AdminIcon name="trash" />
                            <span>고객/유지율 데이터 초기화</span>
                        </button>
                    </div>
                </section>

                <section className="adm-panel p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-[#263d36]">완전 초기화 (관리자 계정 제외)</h3>
                            <span className="adm-pill gray">전체 리셋</span>
                        </div>
                        <p className="text-xs text-[#6b7768] leading-relaxed">
                            <strong>총괄 관리자 계정을 제외한 모든 데이터(파트너사 계정, 파트너 신청 포함)를 전면 삭제</strong>하여 완전히 새로운 사이트 상태로 만듭니다.
                        </p>
                        <div className="mt-3 text-[11px] text-[#86918a] font-mono">
                            대상: 파트너사 전체 + 고객/유지율/통계 데이터 전체 (admins만 보존)
                        </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#edf0e7] flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleOpenModal("all_except_admin")}
                            disabled={isPurging}
                            className="adm-btn danger"
                        >
                            <AdminIcon name="trash" />
                            <span>파트너 포함 완전 초기화</span>
                        </button>
                    </div>
                </section>
            </div>

            {/* 안전 확인 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#132a25]/45 backdrop-blur-[2px] z-[200] flex items-center justify-center p-4">
                    <div className="adm-panel max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-2.5 mb-2">
                            <span className="adm-pill red">주의</span>
                            <h3 className="text-base font-bold text-[#263d36]">
                                정말 데이터를 초기화하시겠습니까?
                            </h3>
                        </div>
                        <p className="text-xs text-[#6b7768] leading-relaxed">
                            {selectedScope === "customers_and_retention" ? (
                                <>
                                    고객 신청 및 유지율/연체 데이터 전체가 삭제됩니다. (파트너 계정 및 <strong>관리자 계정은 보존</strong>됩니다)
                                </>
                            ) : (
                                <>
                                    파트너 계정을 포함한 전산 데이터 전체가 삭제됩니다. (오직 <strong>관리자 계정만 안전하게 보존</strong>됩니다)
                                </>
                            )}
                        </p>

                        <div className="my-5 adm-note-card !bg-[#fbeef0] !border-[#eccfd2]">
                            <label className="text-xs font-bold text-[#a33d46] block mb-2">
                                확인을 위해 아래 입력창에 <span className="underline">&quot;초기화 실행&quot;</span>을 입력하세요:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="초기화 실행"
                                className="adm-input !bg-white !border-[#e4b9be]"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isPurging}
                                className="adm-btn"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleExecutePurge}
                                disabled={confirmText.trim() !== "초기화 실행" || isPurging}
                                className="adm-btn danger"
                            >
                                {isPurging ? "초기화 중..." : "초기화 확정"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
