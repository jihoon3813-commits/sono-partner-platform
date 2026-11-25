"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminIcon } from "./AdminIcons";
import {
    DEFAULT_AUTO_APPLY_MESSAGE,
    DEFAULT_AUTO_APPLY_TITLE,
    DEFAULT_SMS_TEMPLATES,
    SmsTemplate,
} from "@/constants/smsTemplates";

export default function SmsManagement() {
    const smsSettingsData = useQuery(api.sms.getSmsSettings);
    const recentLogs = useQuery(api.sms.listRecentLogs, { limit: 100 });
    const saveSmsSettings = useMutation(api.sms.saveSmsSettings);
    const sendTestSmsAction = useAction(api.sms.sendTestSms);
    const getRemainCountAction = useAction(api.sms.getRemainCount);
    const retrySmsLogAction = useAction(api.sms.retrySmsLog);

    const initializedRef = useRef(false);
    const [subSection, setSubSection] = useState<
        "connection" | "auto" | "templates" | "contacts" | "logs"
    >("connection");

    const [localSms, setLocalSms] = useState<any>({
        provider: "phone_bridge",
        apiKey: "",
        userId: "",
        sender: "010-2666-0883",
        bridgeSecret: "",
        autoFallbackAligo: true,
        fallbackDelaySeconds: 25,
        autoSendOnApply: true,
        autoApplyTitle: DEFAULT_AUTO_APPLY_TITLE,
        autoApplyMessage: DEFAULT_AUTO_APPLY_MESSAGE,
    });
    const [localGoogleClientId, setLocalGoogleClientId] = useState("");
    const [localTemplates, setLocalTemplates] = useState<SmsTemplate[]>(DEFAULT_SMS_TEMPLATES);

    const [isSaving, setIsSaving] = useState(false);
    const [savedToast, setSavedToast] = useState(false);

    const [testPhone, setTestPhone] = useState("");
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [aligoRemain, setAligoRemain] = useState<any>(null);
    const [isCheckingRemain, setIsCheckingRemain] = useState(false);

    const [logSearch, setLogSearch] = useState("");
    const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

    useEffect(() => {
        if (!smsSettingsData || initializedRef.current) return;
        const remoteSms = smsSettingsData.sms || {};
        setLocalSms({
            provider: remoteSms.provider || "phone_bridge",
            apiKey: remoteSms.apiKey || "",
            userId: remoteSms.userId || "",
            sender: remoteSms.sender || "010-2666-0883",
            bridgeSecret: remoteSms.bridgeSecret || "",
            autoFallbackAligo: remoteSms.autoFallbackAligo !== false,
            fallbackDelaySeconds: remoteSms.fallbackDelaySeconds || 25,
            autoSendOnApply: remoteSms.autoSendOnApply !== false,
            autoApplyTitle: remoteSms.autoApplyTitle || DEFAULT_AUTO_APPLY_TITLE,
            autoApplyMessage: remoteSms.autoApplyMessage || DEFAULT_AUTO_APPLY_MESSAGE,
        });
        if (smsSettingsData.googleContacts?.clientId) {
            setLocalGoogleClientId(smsSettingsData.googleContacts.clientId);
        }
        if (Array.isArray(smsSettingsData.templates) && smsSettingsData.templates.length > 0) {
            setLocalTemplates(smsSettingsData.templates);
        }
        initializedRef.current = true;
    }, [smsSettingsData]);

    const remoteSms = smsSettingsData?.sms || {};
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
    const convexSiteUrl =
        process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
        (convexUrl
            ? convexUrl.replace(".convex.cloud", ".convex.site")
            : "https://<CONVEX_DEPLOYMENT>.convex.site");

    const lastSeenAt = remoteSms.bridgeLastSeenAt || 0;
    const isBridgeOnline = lastSeenAt > 0 && Date.now() - lastSeenAt < 65_000;
    const activeProvider = localSms.provider || "phone_bridge";

    const generateRandomSecret = () => {
        const chars = "abcdefghjkmnpqrstuvwxyz23456789";
        let token = "sono-";
        for (let i = 0; i < 16; i += 1) {
            token += chars[Math.floor(Math.random() * chars.length)];
        }
        setLocalSms((prev: any) => ({ ...prev, bridgeSecret: token }));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSavedToast(false);
        try {
            await saveSmsSettings({
                sms: {
                    provider: activeProvider === "aligo" ? "aligo" : "phone_bridge",
                    apiKey: localSms.apiKey || "",
                    userId: localSms.userId || "",
                    sender: localSms.sender || "",
                    bridgeSecret: localSms.bridgeSecret || "",
                    autoFallbackAligo: localSms.autoFallbackAligo !== false,
                    fallbackDelaySeconds: Math.max(
                        10,
                        Math.min(120, Number(localSms.fallbackDelaySeconds) || 25)
                    ),
                    autoSendOnApply: localSms.autoSendOnApply !== false,
                    autoApplyTitle: localSms.autoApplyTitle || DEFAULT_AUTO_APPLY_TITLE,
                    autoApplyMessage: localSms.autoApplyMessage || DEFAULT_AUTO_APPLY_MESSAGE,
                },
                templates: localTemplates,
                googleContacts: {
                    clientId: localGoogleClientId.trim(),
                },
            });
            setSavedToast(true);
            setTimeout(() => setSavedToast(false), 3000);
        } catch (err: any) {
            alert(`문자 설정 저장 중 오류가 발생했습니다: ${err?.message || "알 수 없는 오류"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestSms = async () => {
        if (!testPhone.trim()) {
            alert("테스트 수신 번호를 입력해주세요.");
            return;
        }
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await sendTestSmsAction({ phone: testPhone.trim() });
            setTestResult(res);
        } catch (err: any) {
            setTestResult({ success: false, message: err?.message || "테스트 발송 실패" });
        } finally {
            setIsTesting(false);
        }
    };

    const handleCheckRemain = async () => {
        setIsCheckingRemain(true);
        try {
            const res = await getRemainCountAction({});
            setAligoRemain(res);
        } catch (err: any) {
            setAligoRemain({ success: false, message: err?.message || "조회 실패" });
        } finally {
            setIsCheckingRemain(false);
        }
    };

    const filteredLogs = (recentLogs || []).filter((log: any) => {
        if (!logSearch.trim()) return true;
        const q = logSearch.trim().toLowerCase();
        return (
            (log.customerName || "").toLowerCase().includes(q) ||
            (log.customerPhone || "").includes(q) ||
            (log.message || "").toLowerCase().includes(q) ||
            (log.smsType || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-5">
            {/* 상단 헤더 + 저장 버튼 */}
            <div className="adm-panel p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#edf0e7]">
                    <div>
                        <h3 className="text-[16px] font-bold text-[#142033]">
                            문자(SMS) 발송 · 양방향 수신 · 주소록 관리
                        </h3>
                        <p className="text-[12px] text-[#788292] mt-1">
                            총괄 어드민 전용 기능입니다. 회사 안드로이드폰 양방향 연동, 상담 접수 자동 안내, 문자 발송 예시, 구글 주소록 연동을 한 곳에서 관리합니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {savedToast && (
                            <span className="adm-pill green !py-1.5 !px-3">
                                <AdminIcon name="check-circle" className="!w-3.5 !h-3.5" />
                                <span>저장되었습니다!</span>
                            </span>
                        )}
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={handleSaveAll}
                            className="adm-btn primary"
                        >
                            <AdminIcon name="check" />
                            <span>{isSaving ? "저장 중..." : savedToast ? "저장 완료!" : "문자 설정 저장하기"}</span>
                        </button>
                    </div>
                </div>

                {/* 세부 탭 */}
                <div className="adm-segmented flex-wrap">
                    <button
                        type="button"
                        onClick={() => setSubSection("connection")}
                        className={subSection === "connection" ? "active" : ""}
                    >
                        📱 발송 · 폰 브릿지 연동
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubSection("auto")}
                        className={subSection === "auto" ? "active" : ""}
                    >
                        ⚡ 상담접수 자동문자
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubSection("templates")}
                        className={subSection === "templates" ? "active" : ""}
                    >
                        ✏️ 문자 발송 예시 ({localTemplates.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubSection("contacts")}
                        className={subSection === "contacts" ? "active" : ""}
                    >
                        👤 구글 주소록 자동등록
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubSection("logs")}
                        className={subSection === "logs" ? "active" : ""}
                    >
                        📋 전체 수발신 내역 ({recentLogs?.length || 0})
                    </button>
                </div>

                {/* 1. 발송 · 폰 브릿지 연동 */}
                {subSection === "connection" && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!localSms.bridgeSecret) generateRandomSecret();
                                    setLocalSms((prev: any) => ({ ...prev, provider: "phone_bridge" }));
                                }}
                                className={`text-left p-4 rounded-[12px] border-2 transition-all ${
                                    activeProvider === "phone_bridge"
                                        ? "border-[#163a6b] bg-[#f4f7fc]"
                                        : "border-[#e5e8eb] bg-white hover:bg-[#f9fafb]"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[14px] font-bold text-[#142033]">
                                        📱 회사폰 직접 연동 (양방향 · 추천)
                                    </span>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#163a6b] text-white">
                                        실시간 동기화
                                    </span>
                                </div>
                                <p className="text-[12px] text-[#5a6b82] leading-relaxed">
                                    웹 어드민에서 보낸 문자가 회사폰 유심으로 발송되어 휴대폰에서도 바로 확인 가능하며, 고객 답장·휴대폰 직접 발신도 웹에 실시간 기록됩니다.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setLocalSms((prev: any) => ({ ...prev, provider: "aligo" }))}
                                className={`text-left p-4 rounded-[12px] border-2 transition-all ${
                                    activeProvider === "aligo"
                                        ? "border-[#163a6b] bg-[#f4f7fc]"
                                        : "border-[#e5e8eb] bg-white hover:bg-[#f9fafb]"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[14px] font-bold text-[#142033]">
                                        ☁️ 알리고 웹 발송 (클라우드)
                                    </span>
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f2f4f6] text-[#4e5968]">
                                        단방향 API
                                    </span>
                                </div>
                                <p className="text-[12px] text-[#5a6b82] leading-relaxed">
                                    알리고 API 서버를 통해 즉시 발송합니다. 회사폰이 꺼져 있거나 대량 발송 시 사용하세요.
                                </p>
                            </button>
                        </div>

                        {activeProvider === "phone_bridge" && (
                            <div className="space-y-4">
                                <div
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[12px] border ${
                                        isBridgeOnline
                                            ? "bg-emerald-50/70 border-emerald-200"
                                            : "bg-amber-50/70 border-amber-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full ${
                                                isBridgeOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                                            }`}
                                        />
                                        <div>
                                            <div className="text-[13px] font-bold text-[#142033] flex items-center gap-2 flex-wrap">
                                                <span>
                                                    {isBridgeOnline
                                                        ? `회사폰 실시간 연결됨 (${remoteSms.bridgeDeviceName || "Android"})`
                                                        : "회사폰 연결 대기 중 (미연결 시 알리고 자동 백업)"}
                                                </span>
                                                {remoteSms.bridgeAppVersion && (
                                                    <span className="adm-pill green !py-0.5 !px-2 !text-[10.5px]">
                                                        앱 v{remoteSms.bridgeAppVersion}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11.5px] text-[#5a6b82] mt-0.5">
                                                {lastSeenAt > 0
                                                    ? `최근 통신: ${new Date(lastSeenAt).toLocaleString("ko-KR")}`
                                                    : "아직 회사폰 브릿지 앱과 연결된 기록이 없습니다. 아래 서버 주소와 보안키를 앱에 입력해주세요."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="adm-field">
                                        <label>앱에 입력할 서버 주소 (Convex Site URL)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={convexSiteUrl}
                                                className="adm-input font-mono bg-[#f9fafb]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(convexSiteUrl);
                                                    alert("서버 주소가 복사되었습니다.");
                                                }}
                                                className="adm-btn shrink-0"
                                            >
                                                <AdminIcon name="copy" />
                                                <span>복사</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="adm-field">
                                        <label>앱 연동 보안키 *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={localSms.bridgeSecret || ""}
                                                onChange={(e) =>
                                                    setLocalSms({
                                                        ...localSms,
                                                        bridgeSecret: e.target.value.trim(),
                                                    })
                                                }
                                                placeholder="예: sono-a1b2c3d4..."
                                                className="adm-input font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={generateRandomSecret}
                                                className="adm-btn shrink-0"
                                            >
                                                <AdminIcon name="refresh" />
                                                <span>생성</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!localSms.bridgeSecret) return;
                                                    navigator.clipboard.writeText(localSms.bridgeSecret);
                                                    alert(
                                                        "보안키가 복사되었습니다. 상단 [문자 설정 저장하기]도 꼭 눌러주세요!"
                                                    );
                                                }}
                                                className="adm-btn shrink-0"
                                            >
                                                <AdminIcon name="copy" />
                                                <span>복사</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[13px] font-bold text-[#142033]">
                                                🛡️ 무중단 알리고 자동 백업 발송
                                            </div>
                                            <p className="text-[11.5px] text-[#5a6b82] mt-0.5">
                                                회사폰이 절전·방전·오프라인 상태여서 지정 시간 내 발송 응답이 없으면 알리고 API로 자동 우회 발송합니다.
                                            </p>
                                        </div>
                                        <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={localSms.autoFallbackAligo !== false}
                                                onChange={(e) =>
                                                    setLocalSms({
                                                        ...localSms,
                                                        autoFallbackAligo: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 accent-[#163a6b]"
                                            />
                                            <span className="text-[12.5px] font-bold text-[#163a6b]">
                                                사용함
                                            </span>
                                        </label>
                                    </div>
                                    {localSms.autoFallbackAligo !== false && (
                                        <div className="flex items-center gap-2 text-[12px] text-[#475569]">
                                            <span>회사폰 미응답 대기 시간:</span>
                                            <input
                                                type="number"
                                                min={10}
                                                max={120}
                                                value={localSms.fallbackDelaySeconds || 25}
                                                onChange={(e) =>
                                                    setLocalSms({
                                                        ...localSms,
                                                        fallbackDelaySeconds: Number(e.target.value),
                                                    })
                                                }
                                                className="adm-input !w-[80px] text-center"
                                            />
                                            <span>초 (초과 시 알리고 클라우드로 자동 전환)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 알리고 API 설정 (단방향 발송 또는 자동 백업용) */}
                        <div className="p-4 rounded-[12px] bg-[#f9fafb] border border-[#e5e8eb] space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <div className="text-[13.5px] font-bold text-[#142033]">
                                        알리고(Aligo) SMS API 연동 정보 {activeProvider === "phone_bridge" ? "(자동 백업 및 재발송용)" : "(주 발송용)"}
                                    </div>
                                    <p className="text-[11.5px] text-[#788292]">
                                        발신번호는 사전 등록된 번호(예: 010-2666-0883)를 입력해주세요.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCheckRemain}
                                    disabled={isCheckingRemain}
                                    className="adm-btn small shrink-0"
                                >
                                    <span>{isCheckingRemain ? "조회 중..." : "잔여 건수 조회"}</span>
                                </button>
                            </div>

                            {aligoRemain && (
                                <div
                                    className={`text-[12px] px-3 py-2 rounded-[8px] ${
                                        aligoRemain.success
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                >
                                    {aligoRemain.success
                                        ? `잔여 발송 가능 건수 — SMS: ${aligoRemain.remain.sms}건 / LMS: ${aligoRemain.remain.lms}건 / MMS: ${aligoRemain.remain.mms}건`
                                        : aligoRemain.message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="adm-field">
                                    <label>알리고 API Key</label>
                                    <input
                                        type="text"
                                        value={localSms.apiKey || ""}
                                        onChange={(e) =>
                                            setLocalSms({ ...localSms, apiKey: e.target.value })
                                        }
                                        placeholder="Aligo API Key"
                                        className="adm-input font-mono"
                                    />
                                </div>
                                <div className="adm-field">
                                    <label>알리고 User ID</label>
                                    <input
                                        type="text"
                                        value={localSms.userId || ""}
                                        onChange={(e) =>
                                            setLocalSms({ ...localSms, userId: e.target.value })
                                        }
                                        placeholder="Aligo User ID"
                                        className="adm-input font-mono"
                                    />
                                </div>
                                <div className="adm-field">
                                    <label>발신번호</label>
                                    <input
                                        type="text"
                                        value={localSms.sender || ""}
                                        onChange={(e) =>
                                            setLocalSms({ ...localSms, sender: e.target.value })
                                        }
                                        placeholder="010-2666-0883"
                                        className="adm-input font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 테스트 발송 */}
                        <div className="p-4 rounded-[12px] bg-white border border-[#e5e8eb] space-y-3">
                            <div className="text-[13px] font-bold text-[#142033]">연동 테스트 발송</div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    placeholder="테스트 수신 휴대폰 번호 (예: 010-1234-5678)"
                                    className="adm-input flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={handleTestSms}
                                    disabled={isTesting}
                                    className="adm-btn primary shrink-0"
                                >
                                    <span>{isTesting ? "발송 중..." : "테스트 문자 보내기"}</span>
                                </button>
                            </div>
                            {testResult && (
                                <div
                                    className={`text-[12px] px-3 py-2 rounded-[8px] ${
                                        testResult.success
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                >
                                    {testResult.message}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. 상담접수 자동문자 */}
                {subSection === "auto" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#f4f7fc] border border-[#dce4f0]">
                            <div>
                                <div className="text-[14px] font-bold text-[#142033]">
                                    고객 상담 접수 시 즉시 자동 안내 문자 발송
                                </div>
                                <p className="text-[12px] text-[#5a6b82] mt-0.5">
                                    랜딩페이지에서 고객이 상담을 접수하면 곧바로 정상접수 완료, 사은품 내역, 010-2666-0883 전화 안내 문자가 자동 발송됩니다.
                                </p>
                            </div>
                            <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={localSms.autoSendOnApply !== false}
                                    onChange={(e) =>
                                        setLocalSms({
                                            ...localSms,
                                            autoSendOnApply: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 accent-[#163a6b]"
                                />
                                <span className="text-[13px] font-bold text-[#163a6b]">
                                    {localSms.autoSendOnApply !== false ? "자동발송 ON" : "자동발송 OFF"}
                                </span>
                            </label>
                        </div>

                        <div className="adm-field">
                            <label>자동 발송 문자 제목 (LMS)</label>
                            <input
                                type="text"
                                value={localSms.autoApplyTitle || ""}
                                onChange={(e) =>
                                    setLocalSms({ ...localSms, autoApplyTitle: e.target.value })
                                }
                                placeholder={DEFAULT_AUTO_APPLY_TITLE}
                                className="adm-input font-bold"
                            />
                        </div>

                        <div className="adm-field">
                            <div className="flex items-center justify-between mb-1">
                                <label>자동 발송 문자 본문</label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocalSms({
                                            ...localSms,
                                            autoApplyTitle: DEFAULT_AUTO_APPLY_TITLE,
                                            autoApplyMessage: DEFAULT_AUTO_APPLY_MESSAGE,
                                        })
                                    }
                                    className="text-[11.5px] font-bold text-[#163a6b] hover:underline"
                                >
                                    기본 문구로 복원
                                </button>
                            </div>
                            <textarea
                                rows={10}
                                value={localSms.autoApplyMessage || ""}
                                onChange={(e) =>
                                    setLocalSms({ ...localSms, autoApplyMessage: e.target.value })
                                }
                                className="adm-textarea"
                            />
                            <p className="text-[11.5px] text-[#788292] mt-1.5">
                                지원 치환자:{" "}
                                <strong className="text-[#163a6b]">
                                    {"{고객명}"}, {"{상품명}"}, {"{사은품}"}, {"{구좌}"}, {"{접수번호}"}
                                </strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. 문자 발송 예시 템플릿 */}
                {subSection === "templates" && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <p className="text-[12px] text-[#5a6b82]">
                                고객 상세 대화창 및 일괄 문자 발송에서 바로 선택해 사용할 수 있는 소노아임레디 문자 발송 예시입니다.{" "}
                                <strong className="text-[#163a6b]">
                                    {"{고객명}"}, {"{상품명}"}, {"{사은품}"}, {"{구좌}"}
                                </strong>{" "}
                                치환자를 지원합니다.
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm("문자 발송 예시를 기본 추천 문구로 초기화하시겠습니까?")) {
                                            setLocalTemplates(DEFAULT_SMS_TEMPLATES);
                                        }
                                    }}
                                    className="adm-btn small"
                                >
                                    기본 예시 초기화
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocalTemplates((prev) => [
                                            ...prev,
                                            {
                                                id: `tpl_${Date.now()}`,
                                                title: `새 문자 예시 ${prev.length + 1}`,
                                                content: `[소노아임레디] {고객명}님 안내드립니다.\n\n문의: 010-2666-0883`,
                                            },
                                        ])
                                    }
                                    className="adm-btn small primary"
                                >
                                    + 예시 추가
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {localTemplates.map((tpl, idx) => (
                                <div
                                    key={tpl.id || idx}
                                    className="p-4 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            type="text"
                                            value={tpl.title}
                                            onChange={(e) => {
                                                const next = [...localTemplates];
                                                next[idx] = { ...tpl, title: e.target.value };
                                                setLocalTemplates(next);
                                            }}
                                            className="adm-input font-bold flex-1"
                                            placeholder="예시 제목"
                                        />
                                        {localTemplates.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setLocalTemplates((prev) =>
                                                        prev.filter((_, i) => i !== idx)
                                                    )
                                                }
                                                className="adm-btn small danger shrink-0"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        rows={6}
                                        value={tpl.content}
                                        onChange={(e) => {
                                            const next = [...localTemplates];
                                            next[idx] = { ...tpl, content: e.target.value };
                                            setLocalTemplates(next);
                                        }}
                                        className="adm-textarea"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. 구글 주소록 자동 등록 연동 */}
                {subSection === "contacts" && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-[12px] bg-[#f4f7fc] border border-[#dce4f0] space-y-2">
                            <div className="text-[14px] font-bold text-[#142033]">
                                👤 구글 주소록(Google Contacts) 자동 등록 연동
                            </div>
                            <p className="text-[12px] text-[#5a6b82] leading-relaxed">
                                고객관리에서 [구글 주소록 일괄 등록] 또는 고객 상세창 [주소록 저장]을 누르면 Google 계정의 주소록에{" "}
                                <strong>홍길동(소노)</strong> 형식으로 자동 저장됩니다. 회사폰에 같은 Google 계정이 로그인되어 있으면 고객 전화가 올 때 휴대폰 화면에 고객명이 바로 표시됩니다.
                            </p>
                        </div>

                        <div className="adm-field">
                            <label>Google OAuth 클라이언트 ID (Web Application)</label>
                            <input
                                type="text"
                                value={localGoogleClientId}
                                onChange={(e) => setLocalGoogleClientId(e.target.value)}
                                placeholder="예: 1234567890-abcdefg.apps.googleusercontent.com"
                                className="adm-input font-mono"
                            />
                            <p className="text-[11.5px] text-[#788292] mt-1.5">
                                Google Cloud Console &gt; API 및 서비스 &gt; 사용자 인증 정보에서 OAuth 2.0 클라이언트 ID(웹 애플리케이션)를 생성하고 승인된 자바스크립트 원본에 현재 어드민 도메인을 추가해주세요. (People API 사용 설정 필요)
                            </p>
                        </div>
                    </div>
                )}

                {/* 5. 전체 수발신 내역 */}
                {subSection === "logs" && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="adm-search-field flex-1">
                                <AdminIcon name="search" />
                                <input
                                    type="text"
                                    value={logSearch}
                                    onChange={(e) => setLogSearch(e.target.value)}
                                    placeholder="고객명, 전화번호, 문자 내용 검색..."
                                />
                            </div>
                            <span className="text-[12px] text-[#788292] shrink-0">
                                최근 {filteredLogs.length}건 표시
                            </span>
                        </div>

                        <div className="adm-table-scroll max-h-[520px] overflow-y-auto">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th className="w-[125px]">일시</th>
                                        <th className="w-[70px] text-center">구분</th>
                                        <th className="w-[90px]">고객명</th>
                                        <th className="w-[115px]">연락처</th>
                                        <th className="w-[90px]">유형</th>
                                        <th>내용</th>
                                        <th className="w-[110px] text-center">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length > 0 ? (
                                        filteredLogs.map((log: any) => {
                                            const isInbound = log.direction === "inbound";
                                            const kst = new Date(log.createdAt + 9 * 60 * 60 * 1000);
                                            const timeStr = `${String(kst.getUTCMonth() + 1).padStart(2, "0")}.${String(
                                                kst.getUTCDate()
                                            ).padStart(2, "0")} ${String(kst.getUTCHours()).padStart(2, "0")}:${String(
                                                kst.getUTCMinutes()
                                            ).padStart(2, "0")}`;

                                            return (
                                                <tr key={log._id}>
                                                    <td className="font-mono text-[11.5px] text-[#64748b]">
                                                        {timeStr}
                                                    </td>
                                                    <td className="text-center">
                                                        <span
                                                            className={`adm-pill ${
                                                                isInbound ? "teal" : "green"
                                                            }`}
                                                        >
                                                            {isInbound ? "수신" : "발신"}
                                                        </span>
                                                    </td>
                                                    <td className="font-semibold text-[12px]">
                                                        {log.customerName || "미등록"}
                                                    </td>
                                                    <td className="font-mono text-[12px]">
                                                        {log.customerPhone}
                                                    </td>
                                                    <td className="text-[11.5px] text-[#475569]">
                                                        {log.smsType}
                                                    </td>
                                                    <td
                                                        className="text-[12px] max-w-[320px] truncate"
                                                        title={log.message}
                                                    >
                                                        {log.message}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="inline-flex items-center gap-1">
                                                            <span
                                                                className={`adm-pill ${
                                                                    log.status === "성공" ||
                                                                    log.status === "수신"
                                                                        ? "green"
                                                                        : log.status === "발송대기"
                                                                          ? "orange"
                                                                          : "red"
                                                                }`}
                                                            >
                                                                {log.status}
                                                            </span>
                                                            {!isInbound &&
                                                                (log.status === "실패" ||
                                                                    log.status === "발송대기") && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            retryingLogId === log._id
                                                                        }
                                                                        onClick={async () => {
                                                                            setRetryingLogId(log._id);
                                                                            try {
                                                                                const res =
                                                                                    await retrySmsLogAction(
                                                                                        {
                                                                                            smsLogId:
                                                                                                log._id,
                                                                                        }
                                                                                    );
                                                                                alert(res.message);
                                                                            } catch (err: any) {
                                                                                alert(
                                                                                    err?.message ||
                                                                                        "재발송 실패"
                                                                                );
                                                                            } finally {
                                                                                setRetryingLogId(
                                                                                    null
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="px-1.5 py-0.5 rounded bg-[#163a6b] text-white text-[10px] font-bold"
                                                                    >
                                                                        {retryingLogId === log._id
                                                                            ? "..."
                                                                            : "재발송"}
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center py-8 text-[#94a3b8] text-[13px]"
                                            >
                                                문자 수발신 내역이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
