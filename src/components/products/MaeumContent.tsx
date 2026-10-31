"use client";

import React, { useState } from "react";
import "./maeum.css";

interface MaeumContentProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    partnerPhone?: string;
}

const serviceData = {
    3: {
        helpers: 3,
        clothes: 3,
        distance: 200,
        transfer: "미포함",
        flowers: "생화 제단 미포함",
        dishes: "미포함",
        car: "둘 중 1종 선택 · 왕복 200km"
    },
    4: {
        helpers: 4,
        clothes: 5,
        distance: 200,
        transfer: "관내(시·군내)",
        flowers: "제단 25만 원 상당",
        dishes: "150인분",
        car: "왕복 200km 기준으로 표기된 구성입니다."
    },
    5: {
        helpers: 6,
        clothes: 5,
        distance: 300,
        transfer: "관내(시·군내)",
        flowers: "제단 35만 원 상당",
        dishes: "300인분",
        car: "왕복 300km 기준으로 표기된 구성입니다."
    }
};

export default function MaeumContent({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    partnerPhone = ""
}: MaeumContentProps) {
    // 1. 가입 대상 (부모님 / 본인)
    const [target, setTarget] = useState<"부모님" | "본인">("부모님");

    // 2. 잔금 보장 계산기
    const [calcPlan, setCalcPlan] = useState<number>(43000);
    const [calcMonths, setCalcMonths] = useState<number>(36);

    // 3. 후기 필터
    const [reviewFilter, setReviewFilter] = useState<"all" | "brand" | "personal">("all");

    // 4. 의전서비스 상품 탭
    const [servicePlan, setServicePlan] = useState<3 | 4 | 5>(4);

    // 5. 하단 상담/조건확인 폼
    const [chosenPlan, setChosenPlan] = useState<"3" | "4" | "5">("4");
    const [showSummary, setShowSummary] = useState(false);

    // 금액 포맷터
    const money = (n: number) => n.toLocaleString("ko-KR");

    // 계산기 값
    const totalAmount = calcPlan * 96;
    const paidAmount = calcPlan * calcMonths;
    const balanceAmount = calcPlan * (96 - calcMonths);
    const paidPercent = (calcMonths / 96) * 100;
    const balancePercent = ((96 - calcMonths) / 96) * 100;

    // 플랜 선택 시 스크롤
    const handlePickPlan = (plan: "3" | "4" | "5") => {
        setChosenPlan(plan);
        setShowSummary(false);
        const element = document.getElementById("consult");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const currentService = serviceData[servicePlan];
    const planPrices: Record<string, number> = { "3": 32000, "4": 43000, "5": 54000 };

    return (
        <div className="maeum-wrapper">
            

            {/* Header */}
            <header>
                <div className="wrap nav">
                    <a className="brand" href="#">
                        <img
                            src="https://res.cloudinary.com/lyjyvy54/image/upload/v1793254036/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_BI_3_ly3rxa.png"
                            alt="소노아임레디"
                            className="brand-logo"
                        />
                        <strong>마음든든</strong>
                    </a>
                    <nav className="navlinks" aria-label="메인 메뉴">
                        {/* <a href="#reviews">이용 사례</a> */}
                        <a href="#benefit">잔금 보장 혜택</a>
                        <a href="#structure">2·5·1 안내</a>
                        <a href="#ceremony">의전서비스</a>
                        <a href="#plans">상품 비교</a>
                        <a href="#membership">멤버십</a>
                        <a href="#consult" className="button">
                            가입 조건 확인 <span>↗</span>
                        </a>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <div className="hero">
                    <div className="wrap">
                        <div className="herogrid">
                            <div>
                                <div className="eyebrow">가족을 위한 준비, 마음든든</div>
                                <h1>부모님을 위한 마음,<br /><em>잔금 부담까지</em><br />미리 준비하세요.</h1>
                                <p className="lead">
                                    아직 납입이 끝나지 않았어도.<br />
                                    정해진 기간, 지정한 가족의 상조 납입 잔금을 보장합니다.
                                </p>
                                <a className="button" href="#audience">
                                    누구를 위해 준비하시나요? <span>→</span>
                                </a>
                                <p className="price">월 32,000원부터 · 96회 납입 · 총 3,072,000원부터</p>
                                {/* <a className="reviewlink" href="#reviews">
                                    공개된 장례서비스 이용 사례 읽어보기 ↗
                                </a> */}
                            </div>

                            <figure className="hero-photo">
                                <img
                                    src="/images/maeum/family-moment.png"
                                    alt="밝은 집에서 손을 맞잡고 대화하는 어머니와 딸의 연출 이미지"
                                    width={1536}
                                    height={1024}
                                />
                                <div className="photo-seal">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 53-21-22C-4 11 22-3 32 16 42-3 68 11 53 31Z" />
                                        <path d="M17 31h9l4-8 6 16 5-8h7" />
                                    </svg>
                                    <span>가족을 생각하는 마음에<br /><strong>든든한 준비를 더합니다.</strong></span>
                                </div>
                                <figcaption>브랜드 연출 이미지 · 실제 이용 고객이 아닙니다</figcaption>
                            </figure>
                        </div>

                        {/* 2-5-1 Plan Ribbon */}
                        <div className="plan-ribbon">
                            <div className="ribbon-label">
                                <small>A SIMPLE PLAN</small>
                                <strong>기억하세요,<br />마음든든 2·5·1</strong>
                            </div>
                            <div className="ribbon-steps">
                                <div className="ribbon-step">
                                    <div className="step-num">
                                        <b>2</b><span className="unit">년</span>
                                    </div>
                                    <div className="step-info">
                                        <strong>준비</strong>
                                        <small>1~24회차 · 보장 제외</small>
                                    </div>
                                </div>
                                <div className="ribbon-step highlighted">
                                    <div className="step-num">
                                        <b>5</b><span className="unit">년</span>
                                    </div>
                                    <div className="step-info">
                                        <strong>잔금 보장</strong>
                                        <small>25~84회차 · 지정 1인</small>
                                    </div>
                                </div>
                                <div className="ribbon-step">
                                    <div className="step-num">
                                        <b>1</b><span className="unit">년</span>
                                    </div>
                                    <div className="step-info">
                                        <strong>납입 마무리</strong>
                                        <small>85~96회차 · 보장 제외</small>
                                    </div>
                                </div>
                            </div>
                            <div className="ribbon-bottom">
                                <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="11" y="14" width="42" height="40" rx="5" />
                                    <path d="M21 8v12M43 8v12M11 27h42m-31 11 7 7 14-14" />
                                </svg>
                                <span>세 구간 모두 월 납입 · <strong>총 8년 / 96회</strong></span>
                            </div>
                        </div>

                        <div className="heronote">
                            잔금 보장은 25~84회차에 사전 지정한 1인(80세 이하)의 상조서비스 이용 시 조건에 따라 적용됩니다. 1~24회차 및 85~96회차는 보장 제외입니다.<br />
                            장례식장 이용료·음식료 등 상품 외 비용은 별도입니다. 마음든든 3 기준 월 32,000원 × 96회.
                        </div>
                    </div>
                </div>

                {/* Trust Strip */}
                <div className="wrap">
                    <div className="truststrip">
                        <div>
                            <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="19" cy="18" r="6" />
                                <circle cx="45" cy="18" r="6" />
                                <path d="M7 47v-7a12 12 0 0 1 21-8M57 47v-7a12 12 0 0 0-21-8" />
                                <path d="m24 39 8 8 8-8a5 5 0 0 0-8-6 5 5 0 0 0-8 6Z" />
                            </svg>
                            지정한 가족 <b>1인</b>
                            <small>본인 또는 가족을 위해</small>
                        </div>
                        <div>
                            <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                <path d="m23 30 6 6 13-14" />
                            </svg>
                            약정 잔금 <b>전액 보장</b>
                            <small>25~84회차 · 적용 조건 충족 시</small>
                        </div>
                        <div>
                            <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="11" y="14" width="42" height="40" rx="5" />
                                <path d="M21 8v12M43 8v12M11 27h42m-31 11 7 7 14-14" />
                            </svg>
                            납입은 <b>96회로 완료</b>
                            <small>만기 환급 시점은 별도</small>
                        </div>
                    </div>
                </div>

                {/* Reviews (임시 숨김 처리) */}
                {false && (
                <section className="reviews" id="reviews">
                    <div className="wrap">
                        <div className="reviewheading">
                            <div>
                                <div className="eyebrow chapter">공개 이용 사례</div>
                                <h2>가족을 모셨던 시간,<br />그 경험을 먼저 읽어보세요.</h2>
                            </div>
                            <p>브랜드 채널에 소개된 사연과 개인이 남긴 이용기.<br />출처와 맥락을 함께 확인할 수 있도록 모았습니다.</p>
                        </div>

                        <div className="reviewintro">
                            <strong>아래 4건은 소노아임레디·구 대명아임레디의 일반 장례서비스 관련 공개 사례입니다.</strong><br />
                            마음든든 가입 후기나 잔금 보장 실적이 아닙니다. 브랜드가 실제 후기를 각색해 게시한 사례 3건과 개인 블로그 이용기 1건을 요약했으며, 이용 사실을 별도로 인증한 후기는 아닙니다.
                        </div>

                        <div className="reviewfilters" role="group" aria-label="이용 사례 분류">
                            <button
                                className={`reviewfilter ${reviewFilter === "all" ? "active" : ""}`}
                                onClick={() => setReviewFilter("all")}
                            >
                                전체 사례 4
                            </button>
                            <button
                                className={`reviewfilter ${reviewFilter === "brand" ? "active" : ""}`}
                                onClick={() => setReviewFilter("brand")}
                            >
                                브랜드 소개 사례 3
                            </button>
                            <button
                                className={`reviewfilter ${reviewFilter === "personal" ? "active" : ""}`}
                                onClick={() => setReviewFilter("personal")}
                            >
                                개인 이용기 1
                            </button>
                        </div>

                        <div className="reviewgrid">
                            {(reviewFilter === "all" || reviewFilter === "brand") && (
                                <article className="reviewcard">
                                    <div className="reviewmeta">
                                        <span className="reviewbadge">브랜드 게시 · 실제 후기 각색</span>
                                        <span>어머니 장례 사연</span>
                                    </div>
                                    <div className="review-art">
                                        <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M52 31c0 12-9 20-22 20h-8l-12 6 3-13a21 21 0 0 1-7-16C6 16 17 7 30 7s22 10 22 24Z" />
                                            <path d="M18 24h21M18 34h14" />
                                        </svg>
                                        <span>01 / 안내와 위로</span>
                                    </div>
                                    <h3>처음 치르는 장례에<br />차분한 설명이 필요했던 순간.</h3>
                                    <p>어머니를 떠나보내며 경황이 없던 가족이 장례지도사의 절차 안내와 세심한 준비에서 도움과 위안을 받았다는 사연입니다.</p>
                                    <div className="reviewbottom">
                                        <span>소노아임레디 카카오톡 채널<br />상담고객 후기 각색 게시물 · 내용 요약</span>
                                        <a href="https://pf.kakao.com/_dxbdxgd/113559585" target="_blank" rel="noopener noreferrer">게시 원문 보기 ↗</a>
                                    </div>
                                </article>
                            )}

                            {(reviewFilter === "all" || reviewFilter === "brand") && (
                                <article className="reviewcard">
                                    <div className="reviewmeta">
                                        <span className="reviewbadge">브랜드 게시 · 실제 후기 각색</span>
                                        <span>아버지 장례 사연</span>
                                    </div>
                                    <div className="review-art">
                                        <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M32 17C21 9 9 12 9 12v37s13-3 23 5c10-8 23-5 23-5V12s-12-3-23 5Zm0 0v37M17 24l8 2m-8 9 8 2m14-11 8-2m-8 13 8-2" />
                                        </svg>
                                        <span>02 / 절차의 이해</span>
                                    </div>
                                    <h3>해외에서 전해진 소식,<br />낯선 절차를 함께 정리하며.</h3>
                                    <p>해외에서 아버지가 돌아가신 뒤, 생소한 장례 절차와 용어를 안내받아 장례를 마무리했다는 이야기입니다. 입관 과정의 정성에 대한 감사도 담겨 있습니다.</p>
                                    <div className="reviewbottom">
                                        <span>소노아임레디 카카오톡 채널 · 2024.11.20<br />이용고객 후기 각색 게시물 · 내용 요약</span>
                                        <a href="https://pf.kakao.com/_dxbdxgd/107510404" target="_blank" rel="noopener noreferrer">게시 원문 보기 ↗</a>
                                    </div>
                                </article>
                            )}

                            {(reviewFilter === "all" || reviewFilter === "brand") && (
                                <article className="reviewcard">
                                    <div className="reviewmeta">
                                        <span className="reviewbadge">브랜드 게시 · 실제 후기 각색</span>
                                        <span>할아버지 장례 사연</span>
                                    </div>
                                    <div className="review-art">
                                        <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="m32 53-21-22C-4 11 22-3 32 16 42-3 68 11 53 31Z" />
                                            <path d="M17 31h9l4-8 6 16 5-8h7" />
                                        </svg>
                                        <span>03 / 가족을 향한 배려</span>
                                    </div>
                                    <h3>고인을 모시는 정성,<br />남은 가족을 살피는 배려.</h3>
                                    <p>할아버지의 마지막 길을 정성껏 모시고, 곁에 있던 부모님과 가족까지 챙긴 장례지도사에게 감사를 전하는 사연입니다.</p>
                                    <div className="reviewbottom">
                                        <span>소노아임레디 카카오톡 채널<br />이용고객 후기 각색 게시물 · 내용 요약</span>
                                        <a href="https://pf.kakao.com/_dxbdxgd/107510385" target="_blank" rel="noopener noreferrer">게시 원문 보기 ↗</a>
                                    </div>
                                </article>
                            )}

                            {(reviewFilter === "all" || reviewFilter === "personal") && (
                                <article className="reviewcard">
                                    <div className="reviewmeta">
                                        <span className="reviewbadge">개인 블로그 · 이용기 요약</span>
                                        <span>장례이행보증 300 이용</span>
                                    </div>
                                    <div className="review-art">
                                        <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M39 8H15v48h34V18L39 8Zm0 0v12h10M23 29h18m-18 8h18m-18 8h11" />
                                        </svg>
                                        <span>04 / 구체적인 이용 기록</span>
                                    </div>
                                    <h3>3일간의 진행과 비용을<br />구체적으로 남긴 기록.</h3>
                                    <p>작성자는 장례 일정 안내와 의전 인력의 도움에 만족했다고 기록했습니다. 화장·봉안 비용은 별도였으며, 지인의 후속 경험에서는 담당자에 따라 만족도가 달랐다는 점도 함께 전합니다.</p>
                                    <div className="reviewbottom">
                                        <span>티스토리 ‘사주탓금지’ · 2025.03.29<br />마음든든과 다른 상품 · 개인 경험</span>
                                        <a href="https://toudy.tistory.com/entry/대명아임레디-상조-이용-후기-내상조그대로-제도부터-장례까지" target="_blank" rel="noopener noreferrer">게시 원문 보기 ↗</a>
                                    </div>
                                </article>
                            )}
                        </div>

                        <div className="reviewpolicy">
                            <strong>출처를 함께 읽어주세요.</strong>
                            <span>각 카드의 제목과 본문은 공개 게시물의 요약이며 고객의 직접 인용문이 아닙니다. 별점·만족도·고객 수를 임의로 부여하지 않았습니다. 개별 사례의 지원 내용은 마음든든의 약정 서비스나 동일한 이용 경험을 보장하지 않습니다.</span>
                        </div>
                    </div>
                </section>
                )}

                {/* 01. Audience */}
                <section id="audience">
                    <div className="wrap">
                        <div className="eyebrow chapter"><span className="chapter-no">01</span>누구를 위한 준비인가요</div>
                        <h2>소중한 누구를 위한<br />준비인가요?</h2>
                        <p className="sectiondesc">준비하는 마음에 맞춰, 가입 조건을 확인해보세요.</p>
                        
                        <div className="audience">
                            <button
                                className={`audcard ${target === "부모님" ? "active" : ""}`}
                                onClick={() => { setTarget("부모님"); setShowSummary(false); }}
                            >
                                <span className="aud-art">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="19" cy="18" r="6" />
                                        <circle cx="45" cy="18" r="6" />
                                        <path d="M7 47v-7a12 12 0 0 1 21-8M57 47v-7a12 12 0 0 0-21-8" />
                                        <path d="m24 39 8 8 8-8a5 5 0 0 0-8-6 5 5 0 0 0-8 6Z" />
                                    </svg>
                                </span>
                                <span className="tag">자녀가 준비하는 상조</span>
                                <h3>부모님을 위해 준비해요</h3>
                                <p>아버지 또는 어머니 1인을 지정해<br />장례에 생길 수 있는 잔금 부담을 준비하고 싶어요.</p>
                                <span className="arrow">{target === "부모님" ? "부모님 기준으로 선택됨 ✓" : "부모님 기준으로 알아보기 →"}</span>
                            </button>

                            <button
                                className={`audcard ${target === "본인" ? "active" : ""}`}
                                onClick={() => { setTarget("본인"); setShowSummary(false); }}
                            >
                                <span className="aud-art">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="32" cy="18" r="8" />
                                        <path d="M14 52v-8a18 18 0 0 1 36 0v8" />
                                        <path d="m27 42 5 5 5-5a3.5 3.5 0 0 0-5-5 3.5 3.5 0 0 0-5 5Z" />
                                    </svg>
                                </span>
                                <span className="tag">내가 준비하는 상조</span>
                                <h3>나를 위해 준비해요</h3>
                                <p>내 장례를 미리 준비해<br />가족에게 남을 갑작스러운 부담을 덜어주고 싶어요.</p>
                                <span className="arrow">{target === "본인" ? "본인 기준으로 선택됨 ✓" : "본인 기준으로 알아보기 →"}</span>
                            </button>
                        </div>
                        <p className="smallnote">잔금 보장 대상은 지정 1인입니다. 부모님 두 분이 자동으로 보장되는 상품이 아닙니다. 연령 기준일과 가족 범위는 계약 기준 확인이 필요합니다.</p>
                    </div>
                </section>

                {/* 02. Benefit & Calculator */}
                <section className="benefit" id="benefit">
                    <div className="wrap split">
                        <div>
                            <div className="eyebrow chapter"><span className="chapter-no">02</span>잔금 보장 혜택</div>
                            <h2>다 내지 못한 납입금,<br />가족의 부담으로<br />남지 않도록.</h2>
                            <p className="sectiondesc">
                                보장기간 안에 지정인의 상조서비스를 이용하면,<br />
                                조건에 따라 약정 상품의 미납 잔금을 전액 보장합니다.
                            </p>
                            <p className="smallnote">
                                계산기로 납입 회차별 잔금을 확인해보세요.<br />
                                실제 보장 여부는 계약 조건과 이용 시점에 따라 달라집니다.
                            </p>
                        </div>

                        <div className="calc">
                            <div className="calc-icon">
                                <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                    <path d="m23 30 6 6 13-14" />
                                </svg>
                                <span>남은 납입금, 한눈에 확인하세요</span>
                            </div>
                            <label htmlFor="calcplan">잔금 보장 계산 예시</label>
                            <select
                                id="calcplan"
                                value={calcPlan}
                                onChange={(e) => setCalcPlan(Number(e.target.value))}
                            >
                                <option value={32000}>마음든든 3</option>
                                <option value={43000}>마음든든 4</option>
                                <option value={54000}>마음든든 5</option>
                            </select>

                            <div className="rangehead">
                                <span>납입 완료 회차</span>
                                <b>{calcMonths}회</b>
                            </div>
                            <input
                                aria-label="납입 완료 회차"
                                type="range"
                                min={25}
                                max={84}
                                value={calcMonths}
                                onChange={(e) => setCalcMonths(Number(e.target.value))}
                            />

                            <div className="row">
                                <span>총 상품금액</span>
                                <b>{money(totalAmount)}원</b>
                            </div>
                            <div className="row">
                                <span>이미 납입한 금액</span>
                                <b>{money(paidAmount)}원</b>
                            </div>

                            <div className="balance-viz" aria-hidden="true">
                                <div id="paid-bar" style={{ width: `${paidPercent}%` }} />
                                <div id="balance-bar" style={{ width: `${balancePercent}%` }} />
                            </div>

                            <div className="bar-key">
                                <span><i></i>납입 완료</span>
                                <span><i></i>보장 대상 잔금</span>
                            </div>

                            <div className="result">
                                <small>조건 충족 시 보장되는 남은 납입금</small>
                                <div className="amount">
                                    <b>{money(balanceAmount)}</b>
                                    <span>원</span>
                                </div>
                            </div>
                            <p className="smallnote">선택 회차 납입 직후 이용 가정. 현금 지급이 아닌 약정 상품의 잔금 보장 예시입니다. 상품 외 비용과 추가 이용 비용은 별도입니다.</p>
                        </div>
                    </div>
                </section>

                {/* 03. Structure (2-5-1) */}
                <section id="structure">
                    <div className="wrap">
                        <div className="center">
                            <div className="eyebrow chapter"><span className="chapter-no">03</span>2·5·1 구조 안내</div>
                            <h2>복잡한 회차 대신,<br />2·5·1로 이해하세요.</h2>
                            <p className="sectiondesc">준비부터 납입 완료까지. 혜택이 적용되는 시점을 투명하게 안내합니다.</p>
                        </div>

                        <div className="year-map">
                            <div className="year-map-title">
                                <span>가입부터 납입 완료까지</span>
                                <strong>8년의 흐름을 한눈에</strong>
                            </div>
                            <div className="year-track" role="img" aria-label="1~2년은 면책기간, 3~7년은 잔금 보장기간, 8년은 보장 종료 후 납입 마무리. 전 기간 월 납입.">
                                <div className="year-cell waiting">
                                    <span>1년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="11" y="14" width="42" height="40" rx="5" />
                                        <path d="M21 8v12M43 8v12M11 27h42m-31 11 7 7 14-14" />
                                    </svg>
                                </div>
                                <div className="year-cell waiting">
                                    <span>2년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="11" y="14" width="42" height="40" rx="5" />
                                        <path d="M21 8v12M43 8v12M11 27h42m-31 11 7 7 14-14" />
                                    </svg>
                                </div>
                                <div className="year-cell covered">
                                    <span>3년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                        <path d="m23 30 6 6 13-14" />
                                    </svg>
                                </div>
                                <div className="year-cell covered">
                                    <span>4년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                        <path d="m23 30 6 6 13-14" />
                                    </svg>
                                </div>
                                <div className="year-cell covered">
                                    <span>5년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                        <path d="m23 30 6 6 13-14" />
                                    </svg>
                                </div>
                                <div className="year-cell covered">
                                    <span>6년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                        <path d="m23 30 6 6 13-14" />
                                    </svg>
                                </div>
                                <div className="year-cell covered">
                                    <span>7년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                        <path d="m23 30 6 6 13-14" />
                                    </svg>
                                </div>
                                <div className="year-cell finishing">
                                    <span>8년</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="32" cy="32" r="23" />
                                        <path d="m20 32 8 8 17-18" />
                                    </svg>
                                </div>
                            </div>
                            <div className="year-key">
                                <span className="yk-wait">2년 준비</span>
                                <span className="yk-covered">5년 잔금 보장</span>
                                <span className="yk-finish">1년 마무리</span>
                            </div>
                            <p>가입 후 회차 기준 · 보장기간에도 월 납입이 계속됩니다.</p>
                        </div>

                        <div className="timeline">
                            <article className="time">
                                <div className="num">2<span>년</span></div>
                                <span className="pill">1~24회차</span>
                                <h3>미리 준비하는 시간</h3>
                                <p>월 납입을 시작합니다.<br />이 기간에 이용하면 남은 상품대금은 고객이 부담합니다.</p>
                            </article>
                            <article className="time highlight">
                                <div className="num">5<span>년</span></div>
                                <span className="pill">25~84회차 · 잔금 보장</span>
                                <h3>잔금 보장과 함께</h3>
                                <p>월 납입은 계속됩니다.<br />지정 1인의 상조서비스 이용 시 조건에 따라 미납 잔금을 전액 보장합니다.</p>
                            </article>
                            <article className="time">
                                <div className="num">1<span>년</span></div>
                                <span className="pill">85~96회차</span>
                                <h3>납입을 마무리</h3>
                                <p>서비스 이용 없이 유지했다면 1년 더 납입하고 완납합니다.<br />이 기간은 잔금 보장 제외입니다.</p>
                            </article>
                        </div>

                        <div className="paymentline">
                            2년 + 5년 + 1년, <strong>전 구간 월 납입 · 총 96회</strong>
                        </div>
                        <div className="notice">
                            <strong>납입 완료와 전액 환급 시점은 다릅니다.</strong><br />
                            96회 납입 완료 후 97~180회차에는 추가 납입 없이 유지합니다. 이 기간 해약환급률은 85%이며, 100% 환급은 181회차 이후 만기 해약 기준입니다.
                        </div>
                    </div>
                </section>

                {/* 04. Ceremony */}
                <section className="ceremony" id="ceremony">
                    <div className="wrap">
                        <div className="ceremony-head">
                            <div>
                                <div className="eyebrow chapter"><span className="chapter-no">04</span>마음든든 의전서비스</div>
                                <h2>마지막 인사를 위한,<br />빈틈없는 준비.</h2>
                            </div>
                            <p className="sectiondesc">
                                장례지도사와 의전 도우미, 차량과 장례용품까지.<br />
                                마음든든의 약정 의전서비스를 구성별로 살펴보세요.
                            </p>
                        </div>

                        <div className="ceremony-visual">
                            <img
                                loading="lazy"
                                src="/images/maeum/white-flowers.png"
                                alt="아이보리 공간에 놓인 흰 국화와 녹색 잎의 연출 이미지"
                                width={1536}
                                height={1024}
                            />
                            <div className="ceremony-overlay">
                                <span>WITH DIGNITY & CARE</span>
                                <p>사람의 온기부터<br />작은 용품 하나까지.</p>
                                <small>분위기 연출 이미지 · 실제 제공 제단·화환과 다릅니다</small>
                            </div>
                        </div>

                        <div className="ceremony-tabs" role="group" aria-label="의전서비스 상품 선택">
                            <button
                                className={`ceremony-tab ${servicePlan === 3 ? "active" : ""}`}
                                onClick={() => setServicePlan(3)}
                            >
                                마음든든 3
                            </button>
                            <button
                                className={`ceremony-tab ${servicePlan === 4 ? "active" : ""}`}
                                onClick={() => setServicePlan(4)}
                            >
                                마음든든 4
                            </button>
                            <button
                                className={`ceremony-tab ${servicePlan === 5 ? "active" : ""}`}
                                onClick={() => setServicePlan(5)}
                            >
                                마음든든 5
                            </button>
                        </div>

                        <div id="service-panel" aria-live="polite">
                            <div className="ceremony-grid">
                                <article className="ceremony-card">
                                    <span className="service-no">01 / PEOPLE</span>
                                    <div className="service-icon">
                                        <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <circle cx="32" cy="16" r="8" />
                                            <path d="M12 55V43a20 20 0 0 1 40 0v12M22 30l10 13 10-13M32 43v12M19 45h5m16 0h5" />
                                        </svg>
                                    </div>
                                    <h3>곁을 지키는 의전 인력</h3>
                                    <p>장례지도사 1명 · 입관지원 1명<br />약정한 장례의전 도우미 인력을 지원합니다.</p>
                                    <div className="service-stat">도우미 <b>{currentService.helpers}</b><small>명</small></div>
                                    <ul className="service-facts">
                                        <li><span>남성 의전복</span><b>{currentService.clothes}벌</b></li>
                                        <li><span>여성 의전복</span><b>{currentService.clothes}벌</b></li>
                                    </ul>
                                </article>

                                <article className="ceremony-card">
                                    <span className="service-no">02 / JOURNEY</span>
                                    <div className="service-icon">
                                        <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M7 39V28l7-4 5-11h26l8 13 5 4v14h-7M17 44h23M19 13l-3 15h37M32 15v12M7 35h8m34 0h8" />
                                            <circle cx="17" cy="44" r="6" />
                                            <circle cx="45" cy="44" r="6" />
                                        </svg>
                                    </div>
                                    <h3>마지막 길의 이동 지원</h3>
                                    <p>고인전용 리무진 · 유족전용 버스<br /><span>{currentService.car}</span></p>
                                    <div className="service-stat">왕복 <b>{currentService.distance}</b><small>km</small></div>
                                    <ul className="service-facts">
                                        <li><span>운구이송차량</span><b>{currentService.transfer}</b></li>
                                        <li><span>거리 초과 시</span><b>2,000원 / km</b></li>
                                    </ul>
                                </article>

                                <article className="ceremony-card">
                                    <span className="service-no">03 / REMEMBRANCE</span>
                                    <div className="service-icon">
                                        <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <circle cx="32" cy="23" r="5" />
                                            <path d="M27 19c-12-12 9-22 10-8 13-5 18 15 4 17 4 14-15 19-17 5-14 3-17-16-3-17M32 38v19m0-8c-12 1-16-11-16-11 12-1 16 11 16 11Zm0 3c12 1 17-10 17-10-11-2-17 10-17 10Z" />
                                        </svg>
                                    </div>
                                    <h3>정성을 담은 추모 공간</h3>
                                    <p>헌화용 국화 30송이 · 꽃바구니 2개<br />상품에 따른 제단장식과 식기 구성을 제공합니다.</p>
                                    <div className="service-stat">{currentService.flowers}</div>
                                    <ul className="service-facts">
                                        <li><span>일회용 식기세트</span><b>{currentService.dishes}</b></li>
                                        <li><span>편의용품</span><b>1세트</b></li>
                                    </ul>
                                </article>
                            </div>
                        </div>

                        <div className="ceremony-common">
                            <div>
                                <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M32 17C21 9 9 12 9 12v37s13-3 23 5c10-8 23-5 23-5V12s-12-3-23 5Zm0 0v37M17 24l8 2m-8 9 8 2m14-11 8-2m-8 13 8-2" />
                                </svg>
                                <strong>세 상품 공통 · 관과 수의</strong>
                                <p>매장 시 오동나무 45mm, 화장 시 오동나무 18mm와 유골함, 탈관 시 오동나무 18mm와 횡대. 수의는 대마 100% 기계직입니다.</p>
                            </div>
                            <div>
                                <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M39 8H15v48h34V18L39 8Zm0 0v12h10M23 29h18m-18 8h18m-18 8h11" />
                                </svg>
                                <strong>빈소에 필요한 기본 용품</strong>
                                <p>향·양초·부의록·축문·위패, 완장·상장·운구장갑은 필요량 제공. 향로·촛대·잔대는 대여합니다.</p>
                            </div>
                            <div>
                                <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="32" cy="32" r="23" />
                                    <path d="m20 32 8 8 17-18" />
                                </svg>
                                <strong>수의를 이미 준비하셨다면</strong>
                                <p>수의 준비 고객에게는 꽃관보 또는 장례의전 도우미 1명을 제공합니다. 입관·수시용품 상세 구성은 아래 표에서 확인하세요.</p>
                            </div>
                        </div>

                        <div className="ceremony-flower">
                            <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="32" cy="23" r="5" />
                                <path d="M27 19c-12-12 9-22 10-8 13-5 18 15 4 17 4 14-15 19-17 5-14 3-17-16-3-17M32 38v19m0-8c-12 1-16-11-16-11 12-1 16 11 16 11Zm0 3c12 1 17-10 17-10-11-2-17 10-17 10Z" />
                            </svg>
                            <strong>마음을 전하는 3단 화환</strong>
                            <span>세 상품 모두 소노 아임레디 명의로 제공하며, 상주 요청 시 명의 변경이 가능합니다.</span>
                        </div>

                        {/* Detailed Spec Comparison */}
                        <details className="spec-details">
                            <summary>의전서비스 전체 구성 비교하기</summary>
                            <div className="spec-scroll" role="region" aria-label="상품별 의전서비스 상세 비교표" tabIndex={0}>
                                <table className="spec-table">
                                    <caption>제공해주신 마음든든 상품 스펙 기준 · 세 상품 전체 구성 비교</caption>
                                    <thead>
                                        <tr>
                                            <th scope="col">서비스 항목</th>
                                            <th scope="col">마음든든 3</th>
                                            <th scope="col">마음든든 4</th>
                                            <th scope="col">마음든든 5</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="spec-group"><th colSpan={4}>인력 지원</th></tr>
                                        <tr><th scope="row">장례지도사</th><td>1명 (입관지원 1명)</td><td>1명 (입관지원 1명)</td><td>1명 (입관지원 1명)</td></tr>
                                        <tr><th scope="row">장례의전 도우미</th><td>3명</td><td>4명</td><td>6명</td></tr>
                                        
                                        <tr className="spec-group"><th colSpan={4}>고인용품 · 수시용품</th></tr>
                                        <tr><th scope="row">관 · 매장 시</th><td>오동나무 45mm</td><td>오동나무 45mm</td><td>오동나무 45mm</td></tr>
                                        <tr><th scope="row">관 · 화장 시</th><td>오동나무 18mm, 유골함</td><td>오동나무 18mm, 유골함</td><td>오동나무 18mm, 유골함</td></tr>
                                        <tr><th scope="row">관 · 탈관 시</th><td>오동나무 18mm, 횡대</td><td>오동나무 18mm, 횡대</td><td>오동나무 18mm, 횡대</td></tr>
                                        <tr><th scope="row">수의</th><td>대마 100% 기계직</td><td>대마 100% 기계직</td><td>대마 100% 기계직</td></tr>
                                        <tr><th scope="row">수의 준비 고객</th><td>꽃관보 또는 장례의전 도우미 1명</td><td>꽃관보 또는 장례의전 도우미 1명</td><td>꽃관보 또는 장례의전 도우미 1명</td></tr>
                                        <tr><th scope="row">도포·원삼·천금·지금</th><td>수의 제품과 동일제품 제공</td><td>수의 제품과 동일제품 제공</td><td>수의 제품과 동일제품 제공</td></tr>
                                        <tr><th scope="row">명정 · 관보</th><td>규격품 제공</td><td>규격품 제공</td><td>규격품 제공</td></tr>
                                        <tr><th scope="row">베개·습신·수시포·한지 등</th><td>규격품 제공</td><td>규격품 제공</td><td>규격품 제공</td></tr>

                                        <tr className="spec-group"><th colSpan={4}>빈소 · 기타용품</th></tr>
                                        <tr><th scope="row">향·양초·부의록·축문·위패</th><td>필요량 일체 제공</td><td>필요량 일체 제공</td><td>필요량 일체 제공</td></tr>
                                        <tr><th scope="row">향로·촛대·잔대</th><td>대여품</td><td>대여품</td><td>대여품</td></tr>
                                        <tr><th scope="row">완장·상장·운구장갑</th><td>필요량 일체 제공</td><td>필요량 일체 제공</td><td>필요량 일체 제공</td></tr>

                                        <tr className="spec-group"><th colSpan={4}>의전복 · 꽃장식</th></tr>
                                        <tr><th scope="row">현대식 의전복 · 남성</th><td>3벌</td><td>5벌</td><td>5벌</td></tr>
                                        <tr><th scope="row">현대식 의전복 · 여성</th><td>3벌</td><td>5벌</td><td>5벌</td></tr>
                                        <tr><th scope="row">생화꽃 제단장식</th><td>미포함</td><td>25만 원 상당</td><td>35만 원 상당</td></tr>
                                        <tr><th scope="row">헌화용 국화</th><td>30송이</td><td>30송이</td><td>30송이</td></tr>
                                        <tr><th scope="row">꽃바구니</th><td>2개</td><td>2개</td><td>2개</td></tr>

                                        <tr className="spec-group"><th colSpan={4}>차량 지원</th></tr>
                                        <tr><th scope="row">운구이송차량</th><td>미포함</td><td>관내(시·군내) 제공</td><td>관내(시·군내) 제공</td></tr>
                                        <tr><th scope="row">고인전용 리무진 · 유족전용 버스</th><td>둘 중 택1 · 왕복 200km</td><td>왕복 200km (리무진·버스 항목 공통 표기)</td><td>왕복 300km (리무진·버스 항목 공통 표기)</td></tr>
                                        <tr><th scope="row">거리 초과 비용</th><td>1km당 2,000원</td><td>1km당 2,000원</td><td>1km당 2,000원</td></tr>
                                        <tr><th scope="row">리무진 운행 범위</th><td>1차 장지까지만 제공</td><td>1차 장지까지만 제공</td><td>1차 장지까지만 제공</td></tr>

                                        <tr className="spec-group"><th colSpan={4}>편의용품 · 특별 서비스</th></tr>
                                        <tr><th scope="row">일회용 식기세트</th><td>미포함</td><td>150인분</td><td>300인분</td></tr>
                                        <tr><th scope="row">편의용품</th><td>1세트</td><td>1세트</td><td>1세트</td></tr>
                                        <tr><th scope="row">3단 화환</th><td>소노 아임레디 명의 제공 · 상주 요청 시 명의 변경 가능</td><td>소노 아임레디 명의 제공 · 상주 요청 시 명의 변경 가능</td><td>소노 아임레디 명의 제공 · 상주 요청 시 명의 변경 가능</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </details>

                        <p className="service-footnote">
                            ※ 리무진은 1차 장지까지만 제공합니다. 마음든든 3은 리무진·버스 중 택1입니다. 4·5의 차량 동시 제공 여부와 거리 산정 기준은 계약명세 확인이 필요합니다.<br />
                            ※ 일회용 식기는 음식 제공을 뜻하지 않습니다. 지원 시간, 추가·초과 이용 비용과 상세 적용 조건은 계약 기준에 따르며, 장례식장 이용료·음식료 등 상품 외 비용은 별도입니다.
                        </p>
                        <a className="service-link" href="#plans">월 납입금과 상품 비교하기 →</a>
                    </div>
                </section>

                {/* 05. Plans */}
                <section className="planssection" id="plans">
                    <div className="wrap">
                        <div className="eyebrow chapter"><span className="chapter-no">05</span>상품별 구성 비교</div>
                        <h2>우리 가족에게 맞는 준비.</h2>
                        <p className="sectiondesc">세 상품 모두 같은 2·5·1 구조. 필요한 인력과 용품 구성으로 선택하세요.</p>

                        <div className="plans-slide-hint"><span>👈 좌우로 넘겨서 3가지 플랜 비교 👉</span></div>
                        <div className="plans">
                            <article className="plan">
                                <div className="plan-icon">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="32" cy="18" r="8" />
                                        <path d="M14 52v-8a18 18 0 0 1 36 0v8" />
                                        <path d="m27 42 5 5 5-5a3.5 3.5 0 0 0-5-5 3.5 3.5 0 0 0-5 5Z" />
                                    </svg>
                                </div>
                                <span className="overline">월 부담을 낮춰 준비</span>
                                <h3>마음든든 3</h3>
                                <div className="cost"><small>월</small> 32,000<small>원</small></div>
                                <div className="total">96회 납입 · 총 3,072,000원</div>
                                <ul>
                                    <li><span>장례의전 도우미</span><b>3명</b></li>
                                    <li><span>생화 제단장식</span><b>미포함</b></li>
                                    <li><span>일회용 식기</span><b>미포함</b></li>
                                    <li><span>남성·여성 의전복</span><b>각 3벌</b></li>
                                </ul>
                                <button className="button light planpick" onClick={() => handlePickPlan("3")}>
                                    이 구성 선택하기 →
                                </button>
                                <div className="plan-period-summary">2년 면책 · 5년 잔금면제 · 만기 100% 환급</div>
                            </article>

                            <article className="plan featured">
                                <span className="planbadge">인력과 용품을 더한 구성</span>
                                <div className="plan-icon">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="19" cy="18" r="6" />
                                        <circle cx="45" cy="18" r="6" />
                                        <path d="M7 47v-7a12 12 0 0 1 21-8M57 47v-7a12 12 0 0 0-21-8" />
                                        <path d="m24 39 8 8 8-8a5 5 0 0 0-8-6 5 5 0 0 0-8 6Z" />
                                    </svg>
                                </div>
                                <span className="overline">필요한 지원을 더해 준비</span>
                                <h3>마음든든 4</h3>
                                <div className="cost"><small>월</small> 43,000<small>원</small></div>
                                <div className="total">96회 납입 · 총 4,128,000원</div>
                                <ul>
                                    <li><span>장례의전 도우미</span><b>4명</b></li>
                                    <li><span>생화 제단장식</span><b>25만 원 상당</b></li>
                                    <li><span>일회용 식기</span><b>150인분</b></li>
                                    <li><span>남성·여성 의전복</span><b>각 5벌</b></li>
                                </ul>
                                <button className="button planpick" onClick={() => handlePickPlan("4")}>
                                    이 구성 선택하기 →
                                </button>
                                <div className="plan-period-summary">2년 면책 · 5년 잔금면제 · 만기 100% 환급</div>
                            </article>

                            <article className="plan">
                                <div className="plan-icon">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 7 19 8v15c0 13-19 24-19 24S13 43 13 30V15Z" />
                                        <path d="m23 30 6 6 13-14" />
                                    </svg>
                                </div>
                                <span className="overline">인력 지원을 넉넉하게 준비</span>
                                <h3>마음든든 5</h3>
                                <div className="cost"><small>월</small> 54,000<small>원</small></div>
                                <div className="total">96회 납입 · 총 5,184,000원</div>
                                <ul>
                                    <li><span>장례의전 도우미</span><b>6명</b></li>
                                    <li><span>생화 제단장식</span><b>35만 원 상당</b></li>
                                    <li><span>일회용 식기</span><b>300인분</b></li>
                                    <li><span>남성·여성 의전복</span><b>각 5벌</b></li>
                                </ul>
                                <button className="button light planpick" onClick={() => handlePickPlan("5")}>
                                    이 구성 선택하기 →
                                </button>
                                <div className="plan-period-summary">2년 면책 · 5년 잔금면제 · 만기 100% 환급</div>
                            </article>
                        </div>

                        {/* 05-1. 상품 구성 금액 및 납입 구조 표 (제공 자료 연동) */}
                        <div className="plan-pricing-table-wrap">
                            <div className="pricing-table-header">
                                <div className="table-badge">회차별 납입 구조 · 해약환급금 기준</div>
                                <h3>상품 구성 금액 및 회차별 납입 안내</h3>
                                <p>24개월 이후 상조서비스 이용 시 상조 납입 잔금을 보장하는 마음든든 상품의 구간별 금액과 만기 환급 기준입니다.</p>
                            </div>

                            <div className="spec-scroll" role="region" aria-label="상품 구성 금액 및 회차별 납입 비교표" tabIndex={0}>
                                <table className="price-structure-table">
                                    <thead>
                                        <tr className="table-super-header">
                                            <th colSpan={6}>상품 구성 금액</th>
                                        </tr>
                                        <tr className="table-col-header">
                                            <th scope="col" style={{ width: '13%' }}>구분</th>
                                            <th scope="col" style={{ width: '23%' }}>상세 구간</th>
                                            <th scope="col" style={{ width: '16%' }}>마음든든 3</th>
                                            <th scope="col" className="col-featured" style={{ width: '16%' }}>마음든든 4</th>
                                            <th scope="col" style={{ width: '16%' }}>마음든든 5</th>
                                            <th scope="col" style={{ width: '16%' }}>비고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* 총 상품 금액 */}
                                        <tr className="row-total-price">
                                            <th scope="row" colSpan={2} className="row-title">총 상품 금액</th>
                                            <td className="amount-cell"><strong>3,072,000원</strong></td>
                                            <td className="amount-cell col-featured"><strong>4,128,000원</strong></td>
                                            <td className="amount-cell"><strong>5,184,000원</strong></td>
                                            <td className="note-cell text-muted">-</td>
                                        </tr>

                                        {/* 월 납입금액 그룹 */}
                                        <tr>
                                            <th scope="row" rowSpan={5} className="group-header-cell">월 납입금액</th>
                                            <th scope="row" className="sub-term-cell">
                                                면책기간 <small>(1 - 24회)</small>
                                            </th>
                                            <td className="amount-cell">32,000원</td>
                                            <td className="amount-cell col-featured">43,000원</td>
                                            <td className="amount-cell">54,000원</td>
                                            <td className="note-cell badge-cell">
                                                <span className="badge-gray">잔금 고객 부담</span>
                                            </td>
                                        </tr>
                                        <tr className="row-highlight-benefit">
                                            <th scope="row" className="sub-term-cell">
                                                혜택기간 <small>(25 - 84회)</small>
                                            </th>
                                            <td className="amount-cell">32,000원</td>
                                            <td className="amount-cell col-featured">43,000원</td>
                                            <td className="amount-cell">54,000원</td>
                                            <td className="note-cell badge-cell">
                                                <span className="badge-teal">★ 잔금 면제 구간</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row" className="sub-term-cell">
                                                실상조납입기간 <small>(85 - 96회)</small>
                                            </th>
                                            <td className="amount-cell">32,000원</td>
                                            <td className="amount-cell col-featured">43,000원</td>
                                            <td className="amount-cell">54,000원</td>
                                            <td rowSpan={2} className="note-cell highlight-note">
                                                레디캐시, 전환 서비스,<br />양도·양수 가능
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row" className="sub-term-cell">
                                                유지기간 <small>(97 - 180회)</small>
                                            </th>
                                            <td colSpan={3} className="span-info-cell">
                                                <strong>비용 납입 없는 유지기간</strong><br />
                                                <small>(제한사항없이 누구에게나 양도·양수 가능)</small>
                                            </td>
                                        </tr>
                                        <tr className="row-maturity">
                                            <th scope="row" className="sub-term-cell">
                                                181회 -
                                            </th>
                                            <td colSpan={3} className="span-info-cell maturity-cell">
                                                <strong style={{ color: 'var(--teal)', fontSize: '13px' }}>100% 환급</strong>
                                            </td>
                                            <td className="note-cell badge-cell">
                                                <span className="badge-navy">만기</span>
                                            </td>
                                        </tr>

                                        {/* 해약환급금액 그룹 */}
                                        <tr>
                                            <th scope="row" rowSpan={3} className="group-header-cell refund-group">해약환급금액</th>
                                            <th scope="row" className="sub-term-cell">
                                                납입기간 중도 해약 <small>(1 - 96회차)</small>
                                            </th>
                                            <td colSpan={3} className="span-info-cell">
                                                해약산식 의거 <strong>0~85%</strong> 환급
                                            </td>
                                            <td className="note-cell text-muted">-</td>
                                        </tr>
                                        <tr>
                                            <th scope="row" className="sub-term-cell">
                                                유지기간 중도 해약 <small>(97 - 180회차)</small>
                                            </th>
                                            <td colSpan={3} className="span-info-cell">
                                                <strong>85% 고정 환급</strong>
                                            </td>
                                            <td className="note-cell text-muted">-</td>
                                        </tr>
                                        <tr className="row-maturity">
                                            <th scope="row" className="sub-term-cell">
                                                만기 해약 <small>(181회차 - )</small>
                                            </th>
                                            <td colSpan={3} className="span-info-cell maturity-cell">
                                                <strong style={{ color: 'var(--teal)', fontSize: '13px' }}>100% 환급</strong>
                                            </td>
                                            <td className="note-cell text-muted">-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="pricing-quick-guide">
                                <div className="guide-item">
                                    <span className="dot dot-gray"></span>
                                    <div><strong>1~24회 (면책)</strong>: 월 납입 진행, 이 기간 장례 발생 시 잔금은 고객 부담입니다.</div>
                                </div>
                                <div className="guide-item">
                                    <span className="dot dot-teal"></span>
                                    <div><strong>25~84회 (보장)</strong>: 사전 지정인 상조 이용 시 남은 약정 잔금이 전액 면제(보장)됩니다.</div>
                                </div>
                                <div className="guide-item">
                                    <span className="dot dot-blue"></span>
                                    <div><strong>97~180회 (유지)</strong>: 추가 납입금 0원, 전환서비스·양도양수 자유 이용 및 85% 환급 보장.</div>
                                </div>
                                <div className="guide-item">
                                    <span className="dot dot-gold"></span>
                                    <div><strong>181회~ (만기)</strong>: 서비스 미이용 시 납입하신 원금 100% 전액 환급.</div>
                                </div>
                            </div>
                        </div>

                        <p className="smallnote">주요 구성 비교입니다. 관·수의·장례지도사 기본 사양은 공통이며, 상세 품목과 지원 시간·추가 비용은 계약명세에 따릅니다. 일회용 식기에는 음식이 포함되지 않습니다.</p>
                    </div>
                </section>

                {/* 06. Membership */}
                <section id="membership" className="membership-section">
                    <div className="wrap">
                        <div className="membership-title">
                            <div>
                                <div className="eyebrow chapter"><span className="chapter-no">06</span>일상의 멤버십 혜택</div>
                                <h2>준비하는 마음에,<br />일상의 여유를 더합니다.</h2>
                            </div>
                            <div>
                                <span className="member-status">기존 멤버십 · 계속 유지</span>
                                <p className="sectiondesc">여행과 건강관리, 함께 떠나는 나들이까지.<br />회원에게 제공되는 혜택과 이용 조건을 확인하세요.</p>
                            </div>
                        </div>

                        <div className="stay-grid">
                            <figure className="resort-figure">
                                <img
                                    src="https://res.cloudinary.com/lyjyvy54/image/upload/v1793256041/benefit_list_bg01_r80zvj.jpg"
                                    alt="소노호텔앤리조트"
                                    className="resort-photo"
                                />
                                <figcaption>소노호텔앤리조트 제휴 혜택</figcaption>
                                <div className="resort-label">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M12 56V15h30v41M42 28h11v28M6 56h52M20 24h4m8 0h3m-15 9h4m8 0h3m-15 9h4m8 0h3M24 56V47h10v9" />
                                    </svg>
                                    <span>준비하는 동안에도<br /><strong>일상은 더 여유롭게</strong></span>
                                </div>
                            </figure>

                            <div className="stay-content">
                                <div className="stay-brand">
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M12 56V15h30v41M42 28h11v28M6 56h52M20 24h4m8 0h3m-15 9h4m8 0h3m-15 9h4m8 0h3M24 56V47h10v9" />
                                    </svg>
                                    <span>SONO HOTELS & RESORTS</span>
                                </div>
                                <h3>소노호텔앤리조트</h3>
                                <p className="stay-sub">비수기 주중, 회원 적용 요금으로 쉬어가는 시간.</p>
                                <div className="stay-prices">
                                    <div><span>일요일 ~ 목요일</span><strong>무기명 회원가 <em>+ 1만 원</em></strong></div>
                                    <div><span>금요일</span><strong>무기명 회원가 <em>+ 2만 원</em></strong></div>
                                </div>
                                <p className="stay-price-note">무기명 회원가 기준 추가금입니다. 1만 원·2만 원이 전체 숙박요금이 아니며, 무료 숙박 혜택이 아닙니다.</p>
                                <div className="stay-mini">
                                    <div><strong>연 10박</strong><span>회원 본인 이용</span></div>
                                    <div><strong>90일 전</strong><span>주중·주말 예약 안내</span></div>
                                </div>
                                <div className="room-types">
                                    <div><span>호텔 객실</span><b>패밀리 / 슈페리어</b></div>
                                    <div><span>리조트 객실</span><b>패밀리 / 스위트</b></div>
                                </div>
                                <details className="stay-terms">
                                    <summary>숙박 제공기간과 이용 조건 확인</summary>
                                    <p>회원 정상 유지기간 내 제공됩니다. 장례 및 전환서비스 이용 시에는 가입일로부터 5년간 제공하는 것으로 안내돼 있습니다.<br /><br />회원 본인(가입자)이 연 10박까지 이용할 수 있으며, 예약 기준은 주중·주말 90일 전 시스템 및 고객 안내입니다. 이용 가능 객실과 날짜는 예약 시 확인해야 하며, 예약 확보를 보장하는 혜택이 아닙니다.</p>
                                </details>
                            </div>
                        </div>

                        <div className="partner-grid">
                            <article className="partner-card">
                                <div className="partner-art wellness has-img">
                                    <img
                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1793256078/fileView_xua4sd.png"
                                        alt="쥬비스 다이어트"
                                        className="partner-img"
                                    />
                                </div>
                                <div>
                                    <span className="partner-label">건강한 일상을 위한 관리 혜택</span>
                                    <h3>쥬비스 다이어트</h3>
                                    <p><strong>10%</strong> 추가 관리 제공</p>
                                    <small>가격 할인과는 다른 추가 관리 혜택입니다.<br />세부 적용 기준은 제휴 서비스 이용 시 확인하세요.</small>
                                </div>
                            </article>

                            <article className="partner-card">
                                <div className="partner-art nature has-img">
                                    <img
                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1793256080/fileView_bfmhkn.jpg"
                                        alt="삼양라운드힐"
                                        className="partner-img"
                                    />
                                </div>
                                <div>
                                    <span className="partner-label">자연과 함께하는 나들이</span>
                                    <h3>삼양라운드힐</h3>
                                    <p>입장권 <strong>2,000원</strong> 할인</p>
                                    <small>적용 대상과 이용 절차 등 상세 조건은<br />제휴 서비스 이용 시 확인하세요.</small>
                                </div>
                            </article>
                        </div>

                        {/* 신규 멤버십 오픈 전 비활성화 */}
                        {/*
                        <div className="member-next">
                            <span>건강부터 교통까지, 멤버십의 영역이 더 넓어집니다.</span>
                            <a href="#new-membership">신규 5개 분야 살펴보기 ↓</a>
                        </div>
                        */}
                    </div>
                </section>

                {/* 07. New Membership (오픈 전 비활성화 - 추후 오픈 시 주석 해제) */}
                {/*
                <section id="new-membership" className="new-membership">
                    <div className="wrap">
                        <div className="new-member-heading">
                            <div>
                                <div className="eyebrow chapter"><span className="chapter-no">07</span>신규 멤버십 서비스</div>
                                <h2>더 넓어진 혜택,<br />더 가까워질 일상.</h2>
                                <p className="sectiondesc">건강·문화·생활·배움·이동.<br />다섯 가지 분야로 확대될 멤버십 서비스를 소개합니다.</p>
                            </div>
                            <div className="launch-card">
                                <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="11" y="14" width="42" height="40" rx="5" />
                                    <path d="M21 8v12M43 8v12M11 27h42m-31 11 7 7 14-14" />
                                </svg>
                                <span>서비스 확대 예정</span>
                                <strong>2026.11.23</strong>
                                <small>제공 자료에 안내된 예정일 기준</small>
                            </div>
                        </div>

                        <div className="new-member-grid">
                            <article className="new-member-card">
                                <div className="new-member-art art-health">
                                    <span className="category-no">01</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m32 53-21-22C-4 11 22-3 32 16 42-3 68 11 53 31Z" />
                                        <path d="M17 31h9l4-8 6 16 5-8h7" />
                                    </svg>
                                </div>
                                <div className="new-member-body">
                                    <h3>헬스케어</h3>
                                    <p>건강을 챙기는 일상</p>
                                    <ul>
                                        <li>건강케어</li>
                                        <li>개인 맞춤형 건강관리</li>
                                        <li>병원 진료 예약</li>
                                        <li>종합건강검진</li>
                                    </ul>
                                </div>
                            </article>

                            <article className="new-member-card">
                                <div className="new-member-art art-culture">
                                    <span className="category-no">02</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M8 19h48v9a6 6 0 0 0 0 12v9H8v-9a6 6 0 0 0 0-12Zm33 0v5m0 7v4m0 7v7" />
                                        <path d="m25 26 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />
                                    </svg>
                                </div>
                                <div className="new-member-body">
                                    <h3>문화·공연</h3>
                                    <p>즐거움을 만나는 시간</p>
                                    <ul>
                                        <li>티켓·입장권</li>
                                        <li>영화·공연 예매권</li>
                                        <li>공연·레저 예매</li>
                                        <li>스포츠 예매권</li>
                                    </ul>
                                </div>
                            </article>

                            <article className="new-member-card">
                                <div className="new-member-art art-home">
                                    <span className="category-no">03</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m7 29 25-21 25 21M13 26v30h38V26M25 56V39h14v17" />
                                        <path d="m23 27 5 5 12-12" />
                                    </svg>
                                </div>
                                <div className="new-member-body">
                                    <h3>생활·편의</h3>
                                    <p>생활에 필요한 도움</p>
                                    <ul>
                                        <li>홈케어</li>
                                        <li>법무상담</li>
                                        <li>타이어 교체 서비스</li>
                                        <li>부모 안심 케어</li>
                                    </ul>
                                </div>
                            </article>

                            <article className="new-member-card">
                                <div className="new-member-art art-book">
                                    <span className="category-no">04</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M32 17C21 9 9 12 9 12v37s13-3 23 5c10-8 23-5 23-5V12s-12-3-23 5Zm0 0v37M17 24l8 2m-8 9 8 2m14-11 8-2m-8 13 8-2" />
                                    </svg>
                                </div>
                                <div className="new-member-body">
                                    <h3>자기계발·추모</h3>
                                    <p>배움과 추억을 함께</p>
                                    <ul>
                                        <li>Ebook</li>
                                        <li>제휴서점</li>
                                        <li>사진촬영·복원</li>
                                    </ul>
                                </div>
                            </article>

                            <article className="new-member-card">
                                <div className="new-member-art art-rail">
                                    <span className="category-no">05</span>
                                    <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="15" y="6" width="34" height="44" rx="10" />
                                        <path d="M15 29h34M32 11v18M21 56l5-6m17 6-5-6M22 16h20" />
                                        <circle cx="24" cy="39" r="3" />
                                        <circle cx="40" cy="39" r="3" />
                                    </svg>
                                </div>
                                <div className="new-member-body">
                                    <h3>교통</h3>
                                    <p>이동을 준비하는 편의</p>
                                    <ul>
                                        <li>기차 예약</li>
                                        <li>렌터카</li>
                                    </ul>
                                </div>
                            </article>
                        </div>

                        <div className="new-member-note">
                            <strong>신규 서비스는 확대 예정 항목입니다.</strong>
                            <p>2026년 10월 28일 기준, 제공 자료에 안내된 11월 23일 확대 예정 내용을 반영했습니다. 무료 제공 여부, 할인율, 이용 횟수, 추가 비용과 상세 이용 조건은 아직 이 자료에 명시돼 있지 않습니다. 실제 이용 가능 여부와 제공 조건은 운영 안내 확인 후 적용됩니다.</p>
                        </div>
                    </div>
                </section>
                */}

                {/* 07. FAQ */}
                <section id="faq">
                    <div className="wrap">
                        <div className="center">
                            <div className="eyebrow chapter"><span className="chapter-no">07</span>가입 전 확인사항</div>
                            <h2>가입 전, 꼭 알아두세요.</h2>
                        </div>
                        <div className="faq">
                            <details>
                                <summary>2년만 납입하면 되는 상품인가요?</summary>
                                <p>아닙니다. 2년 준비, 5년 보장, 1년 마무리 구간 모두 월 납입이 이어지는 총 96회 납입 상품입니다. 다만 보장기간에 지정인의 상조서비스를 이용해 보장 조건을 충족하면 남은 약정 납입금이 보장됩니다.</p>
                            </details>
                            <details>
                                <summary>가입하면 바로 잔금 보장을 받을 수 있나요?</summary>
                                <p>첫 24회차는 면책기간입니다. 잔금 보장은 25~84회차에 지정인의 상조서비스 이용 시 조건에 따라 적용되며, 1~24회차 및 85~96회차에는 적용되지 않습니다.</p>
                            </details>
                            <details>
                                <summary>부모님 두 분 모두 보장되나요?</summary>
                                <p>사전에 지정한 1인만 잔금 보장 대상입니다. 자료상 본인 또는 가족, 80세 이하 조건이 있으며 정확한 연령 기준일과 가족 범위, 지정인 변경 가능 여부는 계약 기준 확인이 필요합니다.</p>
                            </details>
                            <details>
                                <summary>장례식장 비용과 음식값도 포함되나요?</summary>
                                <p>잔금 보장은 약정 상조상품의 미납 금액에 대한 혜택입니다. 장례식장 이용료·접객 음식료 등 상품 외 비용과 추가 선택·초과 이용 비용은 별도입니다.</p>
                            </details>
                            <details>
                                <summary>8년 납입이 끝나면 전액 환급되나요?</summary>
                                <p>납입 완료와 전액 환급은 시점이 다릅니다. 납입기간 중에는 해약산식에 따라 0~85%, 97~180회차에는 85%, 181회차 이후 만기 해약 시 100% 환급으로 안내돼 있습니다. 서비스 이용 후 환급까지 중복 제공되는 의미가 아닙니다.</p>
                            </details>
                            <details>
                                <summary>호텔·리조트는 무료로 이용하나요?</summary>
                                <p>무료 숙박이 아닌 회원 적용 요금 혜택입니다. 이용 날짜·객실·예약 가능 여부에 따라 달라집니다. 장례 및 전환서비스 이용 시 멤버십은 가입일로부터 5년간 제공한다는 조건이 있으므로 상세 적용 기준을 확인해야 합니다.</p>
                            </details>
                        </div>
                    </div>
                </section>

                {/* 09. Consult / Condition Summary */}
                <section className="consult" id="consult">
                    {false && (
                    <div className="wrap">
                        <div className="reviewanchor">
                            <span>이용 경험도 살펴보셨나요? 장례서비스 공개 사례를 출처와 함께 확인하세요.</span>
                            <a href="#reviews">이용 사례 4건 읽기 ↑</a>
                        </div>
                    </div>
                    )}

                    <div className="wrap consultgrid">
                        <div>
                            <div className="eyebrow chapter"><span className="chapter-no">08</span>나에게 맞는 준비</div>
                            <h2>소중한 사람을 위한 준비,<br />내 조건부터 확인하세요.</h2>
                            <p className="sectiondesc">
                                누구를 위한 준비인지, 어떤 구성이 필요한지.<br />
                                선택한 내용을 한눈에 정리해드립니다.
                            </p>
                            <ul className="checks">
                                <li>부모님 또는 본인 1인을 위한 준비</li>
                                <li>첫 2년 면책, 이후 5년 잔금 보장</li>
                                <li>총 8년 납입과 장기 유지 조건 확인</li>
                            </ul>
                            <p className="smallnote">
                                가입 직후 보장이나 단기간 내 전액 환급이 필요한 경우,<br />
                                상품 조건을 먼저 확인하세요.
                            </p>
                            {partnerMode && partnerPhone && (
                                <div style={{ marginTop: '20px', padding: '16px 20px', background: '#eaf0e6', borderRadius: '8px', border: '1px solid #ceddc6' }}>
                                    <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>파트너 직통 문의처</strong>
                                    <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--teal)' }}>
                                        📞 {partnerPhone} ({partnerName})
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="formbox">
                            <div className="form-title">
                                <svg className="ui-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M39 8H15v48h34V18L39 8Zm0 0v12h10M23 29h18m-18 8h18m-18 8h11" />
                                </svg>
                                <div>
                                    <strong>나의 준비 살펴보기</strong>
                                    <small>대상과 상품을 선택해주세요</small>
                                </div>
                            </div>

                            <label>누구를 위한 준비인가요?</label>
                            <div className="choices">
                                <button
                                    className={`choice ${target === "부모님" ? "active" : ""}`}
                                    onClick={() => { setTarget("부모님"); setShowSummary(false); }}
                                >
                                    부모님
                                </button>
                                <button
                                    className={`choice ${target === "본인" ? "active" : ""}`}
                                    onClick={() => { setTarget("본인"); setShowSummary(false); }}
                                >
                                    본인
                                </button>
                            </div>

                            <label htmlFor="chosenplan">관심 있는 상품</label>
                            <select
                                id="chosenplan"
                                value={chosenPlan}
                                onChange={(e) => {
                                    setChosenPlan(e.target.value as "3" | "4" | "5");
                                    setShowSummary(false);
                                }}
                            >
                                <option value="3">마음든든 3 · 월 32,000원</option>
                                <option value="4">마음든든 4 · 월 43,000원</option>
                                <option value="5">마음든든 5 · 월 54,000원</option>
                            </select>

                            <button
                                className="button"
                                onClick={() => setShowSummary(true)}
                            >
                                선택한 가입 조건 확인하기 <span>→</span>
                            </button>

                            {showSummary && (
                                <div className="summarybox" role="status">
                                    <strong>{target}을 위한 마음든든 {chosenPlan}</strong><br />
                                    월 {money(planPrices[chosenPlan])}원 × 96회 · 총 {money(planPrices[chosenPlan] * 96)}원<br />
                                    지정 1인 · 25~84회차 잔금 보장<br />
                                    확인할 조건: 지정인 연령 기준·가족 범위·보장 제외 사유<br />
                                    <small style={{ color: "var(--muted)", display: "block", marginTop: "6px" }}>
                                        조건 정리만 완료되었습니다. 실제 상담은 접수되지 않습니다.
                                    </small>
                                </div>
                            )}

                            <p className="demo">현재는 디자인 검토용 페이지입니다. 개인정보를 수집하거나 실제 상담을 접수하지 않습니다. 정식 상담 연결은 운영 정보 확정 후 제공됩니다.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer>
                <div className="wrap">
                    <div className="footrow">
                        <strong>마음든든</strong>
                        <span>가족을 위한 준비, 2·5·1</span>
                    </div>
                    <div>소노아임레디 마음든든 상품 안내 · 공식 상품 대표 안내 페이지</div>
                    <div style={{ marginTop: '8px' }}>
                        2026.10.26 제공 자료 기준. 본 페이지는 계약서 또는 최종 약관을 대체하지 않습니다.<br />
                        실제 가입 가능 여부, 보장 제외 사항, 회차별 환급금과 서비스 구성은 최종 계약 기준 확인이 필요합니다.
                    </div>
                </div>
            </footer>

            {/* Floating Mobile Bar */}
            <div className="mobilebar">
                <span>가족을 위한 2·5·1<strong>마음든든</strong></span>
                <a href="#consult" className="button">내 가입 조건 확인 →</a>
            </div>
        </div>
    );
}
