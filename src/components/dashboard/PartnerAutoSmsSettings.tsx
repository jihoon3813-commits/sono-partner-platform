"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminIcon } from "./AdminIcons";
import {
    DEFAULT_AUTO_APPLY_MESSAGE,
    DEFAULT_AUTO_APPLY_TITLE,
} from "@/constants/smsTemplates";

interface ProductSmsConfig {
    enabled: boolean;
    title: string;
    message: string;
}

const PRODUCT_SMS_ITEMS = [
    { key: "maeum", label: "마음든든 (기본)", defaultEnabled: true, badge: "마음든든" },
    { key: "maeum-ad", label: "마음든든 (광고)", defaultEnabled: true, badge: "마음든든" },
    { key: "maeum-new", label: "마음든든 (new)", defaultEnabled: true, badge: "마음든든" },
    { key: "maeum-mili", label: "마음든든 (밀리)", defaultEnabled: true, badge: "마음든든" },
    { key: "smartcare", label: "스마트케어", defaultEnabled: false, badge: "결합상품" },
    { key: "smartcare-ad", label: "스마트케어 (광고)", defaultEnabled: false, badge: "결합상품" },
    { key: "happy450", label: "더 해피 450 ONE", defaultEnabled: false, badge: "일반상조" },
] as const;

const VARIABLES = ["{고객명}", "{상품명}", "{사은품}", "{구좌}", "{접수번호}"];

interface PartnerAutoSmsSettingsProps {
    partnerId: string;
}

export default function PartnerAutoSmsSettings({ partnerId }: PartnerAutoSmsSettingsProps) {
    const remoteSettings = useQuery(
        api.partners.getPartnerAutoSmsSettings,
        partnerId ? { partnerId } : ("skip" as any)
    );
    const globalSmsSettings = useQuery(api.sms.getSmsSettings);
    const savePartnerAutoSms = useMutation(api.partners.savePartnerAutoSmsSettings);

    const initializedRef = useRef(false);
    const [selectedProductKey, setSelectedProductKey] = useState<string>("maeum");
    const [productsConfig, setProductsConfig] = useState<Record<string, ProductSmsConfig>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [savedToast, setSavedToast] = useState(false);

    const globalDefaultTitle =
        (globalSmsSettings?.sms?.autoApplyTitle || "").trim() || DEFAULT_AUTO_APPLY_TITLE;
    const rawDefaultMessage =
        (globalSmsSettings?.sms?.autoApplyMessage || "").trim() || DEFAULT_AUTO_APPLY_MESSAGE;
    const partnerPhone = (remoteSettings as any)?.partnerPhone || "";
    const globalDefaultMessage = partnerPhone
        ? rawDefaultMessage.replaceAll("010-2666-0883", partnerPhone)
        : rawDefaultMessage;

    useEffect(() => {
        if (!remoteSettings || initializedRef.current) return;
        const remoteProducts = (remoteSettings.products || {}) as Record<string, any>;
        const next: Record<string, ProductSmsConfig> = {};
        for (const item of PRODUCT_SMS_ITEMS) {
            const saved = remoteProducts[item.key];
            next[item.key] = {
                enabled: saved?.enabled !== undefined ? Boolean(saved.enabled) : item.defaultEnabled,
                title: typeof saved?.title === "string" ? saved.title : "",
                message: typeof saved?.message === "string" ? saved.message : "",
            };
        }
        setProductsConfig(next);
        initializedRef.current = true;
    }, [remoteSettings]);

    const currentItem =
        PRODUCT_SMS_ITEMS.find((p) => p.key === selectedProductKey) || PRODUCT_SMS_ITEMS[0];
    const currentConfig: ProductSmsConfig = productsConfig[selectedProductKey] || {
        enabled: currentItem.defaultEnabled,
        title: "",
        message: "",
    };

    const updateCurrent = (patch: Partial<ProductSmsConfig>) => {
        setProductsConfig((prev) => ({
            ...prev,
            [selectedProductKey]: {
                ...currentConfig,
                ...patch,
            },
        }));
    };

    const handleSave = async () => {
        if (!partnerId) return;
        setIsSaving(true);
        setSavedToast(false);
        try {
            await savePartnerAutoSms({
                partnerId,
                autoSmsSettings: {
                    products: productsConfig,
                },
            });
            setSavedToast(true);
            setTimeout(() => setSavedToast(false), 2500);
        } catch (err: any) {
            alert(err?.message || "저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetToDefault = () => {
        updateCurrent({
            title: globalDefaultTitle,
            message: globalDefaultMessage,
        });
    };

    const handleAppendVariable = (variable: string) => {
        const base = currentConfig.message || "";
        updateCurrent({
            message: base ? `${base}${base.endsWith(" ") || base.endsWith("\n") ? "" : " "}${variable}` : variable,
        });
    };

    return (
        <div className="space-y-5">
            <div className="adm-panel p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eaeff7]">
                    <div>
                        <h2 className="text-base font-bold text-[#162438]">
                            상품별 접수 안내 문자 자동 발송 설정
                        </h2>
                        <p className="text-xs text-[#68778c] mt-1">
                            고객이 상담을 접수할 때 자동으로 발송되는 안내 문자를 상품별로 켜거나 끄고, 파트너 맞춤 문구를 설정할 수 있습니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {savedToast && (
                            <span className="adm-pill green">저장되었습니다!</span>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="adm-btn primary"
                        >
                            <AdminIcon name="check" />
                            <span>{isSaving ? "저장 중..." : "설정 저장"}</span>
                        </button>
                    </div>
                </div>

                {/* 상품 선택 탭 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
                    {PRODUCT_SMS_ITEMS.map((item) => {
                        const cfg = productsConfig[item.key];
                        const isEnabled = cfg ? cfg.enabled : item.defaultEnabled;
                        const isSelected = selectedProductKey === item.key;
                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setSelectedProductKey(item.key)}
                                className={`p-2.5 rounded-[10px] border text-left transition-all ${
                                    isSelected
                                        ? "bg-[#f2f6fc] border-[#163a6b] ring-1 ring-[#163a6b]"
                                        : "bg-white border-[#e1e7f0] hover:border-[#9cb2cf]"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-[10px] font-semibold text-[#788699]">
                                        {item.badge}
                                    </span>
                                    <span
                                        className={`adm-pill !py-0 !px-1.5 !text-[9.5px] ${
                                            isEnabled ? "green" : "gray"
                                        }`}
                                    >
                                        {isEnabled ? "ON" : "OFF"}
                                    </span>
                                </div>
                                <div className="text-xs font-bold text-[#162438] truncate">
                                    {item.label}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* 선택된 상품 상세 설정 */}
                <div className="mt-5 p-4 sm:p-5 rounded-[12px] bg-[#f8fafd] border border-[#e1e7f0] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-[#162438]">
                                    {currentItem.label} 접수 안내 문자
                                </h3>
                                <span className={`adm-pill ${currentConfig.enabled ? "green" : "red"}`}>
                                    {currentConfig.enabled ? "자동 발송 사용" : "발송 안함"}
                                </span>
                            </div>
                            <p className="text-xs text-[#68778c] mt-0.5">
                                {currentConfig.enabled
                                    ? "이 상품으로 상담이 접수되면 아래 설정한 문구로 자동 안내 문자가 발송됩니다."
                                    : "이 상품으로 상담이 접수되어도 고객에게 자동 안내 문자를 보내지 않습니다."}
                            </p>
                        </div>

                        <div className="inline-flex rounded-[9px] border border-[#d6e0ee] bg-white p-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => updateCurrent({ enabled: true })}
                                className={`px-3 py-1.5 rounded-[7px] text-xs font-bold transition-all ${
                                    currentConfig.enabled
                                        ? "bg-[#163a6b] text-white"
                                        : "text-[#68778c] hover:text-[#162438]"
                                }`}
                            >
                                문자 발송
                            </button>
                            <button
                                type="button"
                                onClick={() => updateCurrent({ enabled: false })}
                                className={`px-3 py-1.5 rounded-[7px] text-xs font-bold transition-all ${
                                    !currentConfig.enabled
                                        ? "bg-[#dc2626] text-white"
                                        : "text-[#68778c] hover:text-[#162438]"
                                }`}
                            >
                                발송 안함
                            </button>
                        </div>
                    </div>

                    {currentConfig.enabled && (
                        <div className="space-y-3.5 pt-3 border-t border-[#e1e7f0]">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-[#162438]">
                                        문자 제목 (LMS)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleResetToDefault}
                                        className="text-[11px] font-semibold text-[#163a6b] hover:underline"
                                    >
                                        본사 기본 문구 불러오기
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="adm-input w-full"
                                    placeholder={`비워두면 본사 기본 제목 사용 (${globalDefaultTitle})`}
                                    value={currentConfig.title}
                                    onChange={(e) => updateCurrent({ title: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                    <label className="text-xs font-bold text-[#162438]">
                                        문자 내용
                                    </label>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-[11px] text-[#788699] mr-1">변수 삽입:</span>
                                        {VARIABLES.map((v) => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => handleAppendVariable(v)}
                                                className="px-2 py-0.5 rounded bg-white border border-[#d6e0ee] text-[11px] font-semibold text-[#163a6b] hover:bg-[#edf2fa]"
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    rows={8}
                                    className="adm-input w-full !h-auto py-2.5 leading-relaxed font-sans text-xs"
                                    placeholder={`비워두면 본사 기본 문구가 발송됩니다.\n\n[기본 문구 예시]\n${globalDefaultMessage}`}
                                    value={currentConfig.message}
                                    onChange={(e) => updateCurrent({ message: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
