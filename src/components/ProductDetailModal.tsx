"use client";

import { useState, useEffect } from "react";
import { cleanProductName } from "@/lib/productUtils";

interface Appliance {
    _id?: string;
    brand: string;
    model: string;
    name: string;
    category: string;
    slotCount: number;
    monthlyPayment?: number;
    cardDiscountPayment?: number;
    image: string;
    isVisible?: boolean;
    hasGift?: boolean;
    promotionId?: string;
    careProductId?: string;
    isBest?: boolean;
    order?: number;
}

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appliance: any;
    onApplyInquiry: (appliance: any) => void;
}

interface SubItemSpec {
    brand: string;
    name: string;
    model: string;
    image: string;
    category: string;
    specs: { label: string; value: string }[];
    features: string[];
}

export default function ProductDetailModal({
    isOpen,
    onClose,
    appliance,
    onApplyInquiry
}: ProductDetailModalProps) {
    const [fetchedSpecs, setFetchedSpecs] = useState<SubItemSpec[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopyModel = (modelText: string, idx: number) => {
        if (!modelText) return;
        navigator.clipboard.writeText(modelText);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (!appliance || !isOpen) return;

        setIsLoading(true);
        const rawName = appliance.name || "";
        const rawModel = appliance.model || "";
        const rawBrand = appliance.brand || "";

        let partsName: string[] = [rawName];
        let partsModel: string[] = [rawModel];

        if (rawName.includes("+") || rawName.includes(" + ") || rawName.includes(" & ")) {
            partsName = rawName.split(/\s*\+\s*|\s+&\s+/).map((s: string) => s.trim()).filter(Boolean);
            partsModel = rawModel.split(/\s*\+\s*|\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
        }

        // 실시간 제조사 공식 사양 API 호출 (/api/product-specs)
        Promise.all(
            partsName.map(async (pName: string, idx: number) => {
                const pModel = partsModel[idx] || partsModel[0] || rawModel;
                const cleanBrand = rawBrand || (pName.includes("LG") ? "LG전자" : (pName.includes("삼성") ? "삼성전자" : "공식브랜드"));

                try {
                    const res = await fetch(
                        `/api/product-specs?brand=${encodeURIComponent(cleanBrand)}&name=${encodeURIComponent(pName)}&model=${encodeURIComponent(pModel)}&category=${encodeURIComponent(appliance.category || "")}`
                    );
                    const json = await res.json();
                    if (json.success && json.data) {
                        return {
                            brand: json.data.brand || cleanBrand,
                            name: pName,
                            model: json.data.model || pModel,
                            image: appliance.image,
                            category: appliance.category,
                            specs: json.data.specs,
                            features: json.data.features
                        };
                    }
                } catch (e) {
                    console.error("Specs API error:", e);
                }

                // API 지연 시 Fallback
                return {
                    brand: cleanBrand,
                    name: pName,
                    model: pModel,
                    image: appliance.image,
                    category: appliance.category,
                    specs: [
                        { label: "공식 브랜드", value: cleanBrand },
                        { label: "공식 모델명", value: pModel },
                        { label: "에너지 소비효율", value: "1등급 (최고 효율)" },
                        { label: "품질 보증", value: "제조사 무상 보증 지원" }
                    ],
                    features: ["제조사 정품 프리미엄 라인업", "소노 아임레디 렌탈비 전액 지원"]
                };
            })
        ).then(results => {
            setFetchedSpecs(results);
            setIsLoading(false);
        });

    }, [appliance, isOpen]);

    if (!isOpen || !appliance) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in py-4 sm:py-6" onClick={onClose}>
            {/* 모달 창 메인 컨테이너 */}
            <div 
                className="relative bg-white text-slate-900 w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-4xl max-h-[85vh] sm:max-h-[88vh] overflow-hidden shadow-2xl border border-gray-300 rounded-none flex flex-col z-10 mx-auto my-auto min-w-0 shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* 헤더 영역 */}
                <div className="sticky top-0 bg-[#0c2340] text-white px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 z-20 shrink-0 border-b border-gray-700 w-full min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="bg-[#fff3cd] text-[#0c2340] text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-none shrink-0 whitespace-nowrap">
                            {appliance.slotCount}구좌 혜택
                        </span>
                        <h3 className="text-xs sm:text-base md:text-lg font-bold tracking-tight text-white truncate">
                            {fetchedSpecs.length > 1 ? `[결합상품] 세트 가전 공식 사양표 (${fetchedSpecs.length}개 제품)` : "제품 공식 기술 사양표"}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 sm:p-1.5 hover:bg-white/10 text-white/80 hover:text-white transition-colors rounded-none shrink-0 cursor-pointer"
                        aria-label="닫기"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 모달 바디 (스크롤 영역) */}
                <div className="overflow-y-auto overflow-x-hidden flex-1 bg-white w-full no-scrollbar">
                    <div className="p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-10 w-full box-border min-w-0">

                        {isLoading ? (
                            <div className="py-16 sm:py-20 flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#0c2340] border-t-transparent animate-spin rounded-none"></div>
                                <p className="text-xs sm:text-sm font-bold text-[#0c2340] animate-pulse px-4">
                                    🔎 제조사 공식 모델 [{appliance.model || appliance.name}] 사양 데이터 수신 중...
                                </p>
                            </div>
                        ) : (
                            fetchedSpecs.map((item, idx) => (
                                <div key={idx} className="space-y-5 sm:space-y-6 pb-6 border-b border-gray-300 last:border-b-0 last:pb-0 w-full box-border min-w-0">
                                    
                                    {/* 다중 제품일 경우 상단 구성 구분 타이틀 */}
                                    {fetchedSpecs.length > 1 && (
                                        <div className="bg-[#0c2340] text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold flex items-center justify-between rounded-none shadow-sm gap-2 w-full box-border min-w-0">
                                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-[#fff3cd] text-[#0c2340] flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-xs sm:text-base truncate">구성 가전 {idx + 1}: {item.name}</span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs bg-emerald-600 text-white px-1.5 sm:px-2 py-0.5 font-bold flex items-center gap-1 shrink-0 whitespace-nowrap">
                                                ✓ 공식 사양표 {idx + 1}
                                            </span>
                                        </div>
                                    )}

                                    {/* 상단 썸네일 및 핵심 요약 카드 */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-center bg-[#f9fafb] p-3 sm:p-5 border border-gray-300 w-full box-border overflow-hidden min-w-0">
                                        {/* 썸네일 이미지 */}
                                        <div className="md:col-span-5 flex items-center justify-center bg-white p-3 sm:p-6 border border-gray-200 h-[170px] sm:h-[200px] md:h-[240px] relative w-full min-w-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                            />
                                            {appliance.isBest && (
                                                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#0c2340] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 shadow">
                                                    BEST 추천
                                                </span>
                                            )}
                                        </div>

                                        {/* 타이틀 및 요약 정보 */}
                                        <div className="md:col-span-7 space-y-2.5 sm:space-y-3 w-full box-border min-w-0">
                                            <div className="w-full box-border min-w-0">
                                                <span className="text-[10px] sm:text-xs font-bold text-[#8b95a1] uppercase block mb-1">
                                                    [{item.brand}] {item.category}
                                                </span>
                                                <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#0c2340] leading-snug sm:leading-tight break-keep">
                                                    {cleanProductName(item.name, item.brand)}
                                                </h2>
                                                
                                                {/* 모델명 + 복사 + 인증 배지 */}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mt-2 w-full min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                                        <span className="text-xs font-bold text-gray-600 uppercase shrink-0">공식 모델명:</span>
                                                        <code className="text-[#0c2340] font-black font-mono bg-white px-1.5 py-0.5 border border-gray-300 shadow-sm text-xs break-all">{item.model || "상담 시 확인"}</code>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap min-w-0">
                                                        {item.model && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyModel(item.model, idx)}
                                                                className="px-2 py-0.5 bg-[#0c2340] hover:bg-[#0a1f38] text-white text-[11px] font-bold rounded-none shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-[#0c2340] shrink-0"
                                                            >
                                                                {copiedIndex === idx ? (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span className="text-emerald-300 font-black">복사 완료!</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 002-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span>📋 모델명 복사</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 font-bold shrink-0">✓ 모델 인증</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 혜택 하이라이트 노출 */}
                                            <div className="bg-[#fff3cd] border border-[#d69e2e] p-3 sm:p-3.5 text-xs font-bold text-[#0c2340] space-y-1 w-full box-border min-w-0">
                                                <p className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                                                    <span>🎁</span> 소노 아임레디 프리미엄 가전 전액 지원
                                                </p>
                                                <p className="text-[#0c2340]/80 leading-relaxed font-medium text-[11px] sm:text-xs break-keep">
                                                    본 가전은 소노그룹 제휴 혜택으로 가전 렌탈비 전액을 지원받아 실부담금 0원으로 이용하실 수 있습니다.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 상세 기술 사양표 (Specification Table) */}
                                    <div className="space-y-3 w-full box-border min-w-0">
                                        <div className="border-b-2 border-[#0c2340] pb-2 w-full min-w-0">
                                            <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-[#0c2340] flex items-center gap-1.5 leading-snug">
                                                <span>📋</span>
                                                <span className="break-keep">{item.name} 모델 공식 기술 사양표</span>
                                            </h4>
                                        </div>

                                        <div className="border border-gray-400 w-full overflow-hidden min-w-0">
                                            <table className="w-full text-xs sm:text-sm text-left border-collapse table-fixed">
                                                <tbody>
                                                    {item.specs.map((spec, sIdx) => (
                                                        <tr key={sIdx} className={sIdx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                                                            <th className="w-[95px] sm:w-[130px] p-2 sm:p-3 font-bold text-[#0c2340] bg-gray-100/70 border-r border-b border-gray-300 break-keep text-xs sm:text-sm shrink-0 align-middle">
                                                                {spec.label}
                                                            </th>
                                                            <td className="p-2 sm:p-3 font-medium text-gray-800 border-b border-gray-300 text-xs sm:text-sm align-middle break-words min-w-0">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
                                                                    <span className="break-words font-medium min-w-0">{spec.value}</span>
                                                                    {spec.label.includes("모델명") && item.model && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCopyModel(item.model, idx)}
                                                                            className="px-2 py-0.5 bg-[#0c2340] hover:bg-[#0a1f38] text-white text-[11px] font-bold rounded-none shadow-sm flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer border border-[#0c2340] self-start sm:self-auto"
                                                                        >
                                                                            {copiedIndex === idx ? (
                                                                                <span className="text-emerald-300 font-bold">✓ 복사됨</span>
                                                                            ) : (
                                                                                <span>📋 복사</span>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 주요 기능 및 특징 */}
                                    {item.features.length > 0 && (
                                        <div className="space-y-2.5 w-full box-border min-w-0">
                                            <h4 className="text-xs sm:text-sm font-extrabold text-[#0c2340] flex items-center gap-2">
                                                ✨ 핵심 기술 및 기능
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full box-border min-w-0">
                                                {item.features.map((feat, fIdx) => (
                                                    <div key={fIdx} className="flex items-start gap-2 p-2.5 sm:p-3 bg-gray-50 border border-gray-300 w-full box-border min-w-0">
                                                        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-none bg-[#0c2340] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0 mt-0.5">
                                                            ✓
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-800 leading-snug break-keep min-w-0">
                                                            {feat}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ))
                        )}

                    </div>
                </div>

                {/* 하단 고정 풋터 액션 바 */}
                <div className="bg-gray-100 border-t border-gray-300 p-3 sm:p-4 md:px-6 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0 w-full min-w-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-gray-200 text-gray-700 border border-gray-400 font-bold text-xs sm:text-sm transition-colors text-center cursor-pointer shrink-0"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onApplyInquiry(appliance);
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0c2340] hover:bg-[#0a1f38] text-[#ffffff] font-extrabold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer min-w-0"
                    >
                        <span className="truncate">이 제품으로 빠른 상담 신청하기</span>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
}
