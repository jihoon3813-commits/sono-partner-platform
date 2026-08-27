"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import InquiryModal from "@/components/InquiryModal";
import ProductDetailModal from "@/components/ProductDetailModal";
import ImportantNotice from "@/components/common/ImportantNotice";
import { cleanProductName } from "@/lib/productUtils";
import AffiliateCardBenefit from "@/components/products/AffiliateCardBenefit";

interface HybridItem {
    name: string;
    desc: string;
    price: string;
    period: string;
    tags: string[];
    status?: string;
    img?: string;
    link?: string;
}

interface HybridServiceDetail {
    title: string;
    subtitle: string;
    desc: string;
    img: string;
    highlights: string[];
    guide: {
        available: string;
        conditions: string;
        fees: string;
        method: string;
    };
    notes?: string;
    items?: HybridItem[];
}

interface Appliance {
    _id: string;
    brand: string;
    model: string;
    name: string;
    category: string;
    slotCount: number;
    monthlyPayment: number;
    cardDiscountPayment: number;
    image: string;
    isVisible: boolean;
    hasGift: boolean;
    promotionId?: string;
    careProductId?: string;
    isBest?: boolean;
    order?: number;
}

const hybridDetails: Record<string, HybridServiceDetail> = {
    "여행": {
        title: "여유롭고 편안한 세계 여행",
        subtitle: "전 세계 휴양지와 관광지를 내 멤버십 혜택으로 스마트하게 전환",
        desc: "원하시는 전 세계 패키지 여행부터 맞춤 투어, 호텔 숙박 및 제주 렌터카까지 다양한 혜택으로 가치 있게 전환 가능합니다.",
        img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product01.jpg",
        highlights: [
            "글로벌 1위 여행 브랜드 연계 혜택",
            "회원 전용 국내외 숙박 최대 우대 가격",
            "내 납입금 한도 내 실시간 전환"
        ],
        guide: {
            available: "더해피450 ONE (1구좌 이상)",
            conditions: "출발 최소 2개월 전 신청 필수",
            fees: "성수기 할증료 및 유류세 본인 부담",
            method: "소노아임레디 고객센터 1588-5811 접수"
        },
        notes: "항공 스케줄 및 현지 리조트 사정에 따라 추가 요금이 발생할 수 있습니다.",
        items: [
            { name: "[플러스앤] 회원전용 국내숙박", desc: "아임레디 회원전용으로 만나볼 수 있는 국내숙박!", price: "100,000원~", period: "2026-01-01 ~ 2027-12-31", tags: ["신규","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/04/25/143b0bde-e209-46e2-ba48-38901ce30cfe", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=56&prdctCd=%EC%97%AC%ED%96%89" },
            { name: "[호주] 시드니 블루마운틴&포트스테판 6일 패키지", desc: "최소출발 2명, 와이너리부터 오페라하우스까지", price: "5,940,000원~", period: "2026-07-09 ~ 2026-12-31", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/09/aed7aa1c-3a7e-4a86-9615-e0f039ce9f5e", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=96&prdctCd=%EC%97%AC%ED%96%89" },
            { name: "[일본] 회원 전용 프라이빗 맞춤여행 서비스", desc: "내 납입금으로 완성하는 나만의 여행 일정", price: "2,970,000원~", period: "2026-07-27 ~ 2026-12-31", tags: ["전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/27/e60bd27c-9e97-4cc2-87d6-05470786fd1b", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=99&prdctCd=%EC%97%AC%ED%96%89" },
            { name: "[제주굿렌터카] 제주도 렌터카", desc: "제주도 여행갈땐? 레디캐시로 제주렌터카!", price: "100,000원~", period: "2026-01-01 ~ 2027-12-31", tags: ["신규","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/07/279d6d83-418f-4aa5-87a6-6a0238eed7d1", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=57&prdctCd=%EC%97%AC%ED%96%89" },
            { name: "[일본] 큐슈 온천&소도시 4일 패키지", desc: "최소출발 2명, 편하게 떠나는 힐링 일본 여행", price: "3,990,000원~", period: "2026-06-16 ~ 2026-12-31", tags: ["신규","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/16/474fe0bf-9a4c-41a2-add3-66eee3d26a82", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=90&prdctCd=%EC%97%AC%ED%96%89" },
            { name: "[하나투어] 해외여행 패키지&호텔", desc: "대한민국을 대표하는 1등 여행 브랜드", price: "100,000원~", period: "2026-01-01 ~ 2027-12-31", tags: ["신규","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/dcf0fe19-459b-4f4a-a970-1c288a07087f", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=46&prdctCd=%EC%97%AC%ED%96%89" }
        ]
    },
    "크루즈": {
        title: "프리미엄 럭셔리 크루즈 여행",
        subtitle: "지중해, 아시아, 알래스카 5성급 럭셔리 크루즈 혜택",
        desc: "평생 기억에 남을 최고급 크루즈 여행으로 전환하여 호화로운 선상 연회와 환상적인 휴양지를 즐기실 수 있습니다.",
        img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product09.jpg",
        highlights: [
            "5성급 대형 크루즈 전용 객실 지원",
            "전문 한국인 가이드 전담 동행",
            "선상 뷔페, 공연, 부대시설 풀패키지 포함"
        ],
        guide: {
            available: "더해피450 ONE (2구좌 이상)",
            conditions: "출발 최소 3개월 전 전환 신청 및 여권 보유 필수",
            fees: "선실 단독 사용료, 기항지 관광 비용 및 유류세 본인 부담",
            method: "소노아임레디 고객센터 1588-5811 접수"
        },
        notes: "선실 등급 및 항공 노선에 따라 추가 비용이 발생할 수 있습니다.",
        items: [
            { name: "[MSC 월드유로파] 서부지중해 4국 11일", desc: "10월 출발, 21만톤 최대 규모 지중해 크루즈!", price: "7,190,000원~", period: "2025-11-27 ~ 2026-11-22", tags: ["신규","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/27/f48e8faf-a3b6-4ad4-aa64-d9a522840733", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=80&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
            { name: "[MSC 그란디오사] 서부지중해 3국 11일", desc: "10월 출발, 핵심 서유럽 100배 즐기기!", price: "6,590,000원~", period: "2025-11-27 ~ 2026-10-13", tags: ["신규","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/27/66a27e84-52a2-44de-b4f0-0ca571ce5270", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=81&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
            { name: "[MSC 디비나] 동부지중해 3국 11일", desc: "10월 출발, 진짜 지중해를 만나볼 시간", price: "6,890,000원~", period: "2025-11-27 ~ 2026-10-08", tags: ["신규","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/27/cb688d36-47b1-42ce-b470-736820646576", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=79&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
            { name: "[MSC 벨리시마] 추석연휴 한중일 3국 7일", desc: "9월 추석연휴, 백화점상품권 받고 크루즈 떠나자!", price: "4,990,000원~", period: "2026-07-20 ~ 2026-08-14", tags: ["전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/20/fab6621b-8882-4448-8b3c-a70d0160c2d3", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=97&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
            { name: "[코스타 세레나] 국내출발 한중일 3국 6일", desc: "9월 부산출발, 이탈리아 크루즈를 경험하세요.", price: "4,990,000원~", period: "2026-05-18 ~ 2026-08-31", tags: ["이벤트","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/05/18/b44c85c3-6995-47c6-8097-e6b127135476", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=87&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
            { name: "[팬스타 미라클] 부산출발 원나잇 크루즈", desc: "매주 토요일 출발, 다이나믹 부산을 경험하고 싶다면!", price: "900,000원~", period: "2026-01-01 ~ 2026-12-31", tags: ["신규","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/29/aa848c02-cace-4b46-8875-3a5e492d94af", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=54&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
            { name: "[로얄캐리비안 네비게이터] 동남아 3국 7일", desc: "26.10-27.3월 출발, 아임레디 크루즈 베스트셀러", price: "7,290,000원~", period: "2026-07-01 ~ 2027-02-05", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/30/fe6646e9-adb9-4eda-a92e-800b0d41e44f", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=37&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
            { name: "[카니발 어드벤처] 호주 시드니/브리즈번 7일", desc: "~12월 출발, 부담없이 떠날 수 있는 호주 크루즈", price: "3,990,000원~", period: "2025-04-01 ~ 2026-12-13", tags: ["신규","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/01/31e4e5ec-2135-49f7-8851-01f348752829", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=52&prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" }
        ]
    },
    "골프": {
        title: "VIP 골프 라운딩 투어",
        subtitle: "국내외 명문 골프장 특별 라운딩 전환",
        desc: "명문 골프 클럽에서의 특별한 라운딩과 최고급 리조트 숙박이 연계된 프리미엄 골프 투어 서비스입니다.",
        img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product02.jpg",
        highlights: [
            "제휴 명문 골프장 그린피 우대 지원",
            "명문 해외 골프장 맞춤형 투어 패키지",
            "동반자 우대 혜택 및 예약 지원"
        ],
        guide: {
            available: "더해피450 ONE (1구좌 이상)",
            conditions: "예약 최소 1개월 전 신청 필수",
            fees: "캐디피 및 개인 경비 본인 부담",
            method: "고객센터 1588-5811 접수"
        },
        notes: "시즌별 골프장 예약 상황에 따라 일정이 변경될 수 있습니다.",
        items: [
            { name: "[골프투어] 태국 아티타야 칸차나부리 CC 5일", desc: "#태국골프 #해외골프 #상시출발가능 #항공별도", price: "510,000원~", period: "2025-04-01 ~ 2025-06-30", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/ba0b27be-519f-4a4f-939b-79eeea196c9e", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=60&prdctCd=%EA%B3%A8%ED%94%84" },
            { name: "[골프투어] 일본 하코다테 홋카이도 CC 4일~8일", desc: "#일본골프 #6월~10월 출발 #여름철 시원한 골프여행", price: "1,270,000원~", period: "2025-05-13 ~ 2025-10-31", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/fcb7344f-9c5f-4050-af8f-63eb48fcc9a0", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=61&prdctCd=%EA%B3%A8%ED%94%84" },
            { name: "[골프투어] 베트남 소노펠리체 하이퐁 CC 3일", desc: "#베트남골프 #해외골프 #상시출발 #항공별도", price: "480,000원~", period: "상시", tags: ["추천","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/04/03/257cb989-9049-4569-9fde-46c6c6826a7a", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=53&prdctCd=%EA%B3%A8%ED%94%84" },
            { name: "[골프투어] 일본 사츠마 CC 벚꽃 라운딩", desc: "일본 가고시마로 떠나는 벚꽃 라운딩 투어!", price: "1,650,000원~", period: "2025-03-31 ~ 2025-04-23", tags: ["이벤트","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/31/0781fb69-aadc-4c74-a1ca-fb4320cfbdcb", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=49&prdctCd=%EA%B3%A8%ED%94%84" },
            { name: "[골프투어] 괌 소노펠리체 CC 3색 골프 3박 4일", desc: "#괌 골프 #해외골프 #3색골프 #소노펠리체 괌", price: "830,000원~", period: "2025-06-01 ~ 2025-10-31", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/06/23/c4d886a0-720d-4776-a826-085398af29ee", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=64&prdctCd=%EA%B3%A8%ED%94%84" }
        ]
    },
    "교육/어학연수": {
        title: "어학연수 & 교육",
        subtitle: "자녀 및 손자녀를 위한 해외 프리미엄 어학연수 전환",
        desc: "원어민 1:1 멘토링과 안전한 해외 전용 기숙 캠프 프로그램으로 최고의 교육 기회를 선물합니다.",
        img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product04.jpg",
        highlights: [
            "해외 명문 어학원 전속 매칭",
            "24시간 현지 안전 관리 시스템",
            "연수 비용 100% 주계약금으로 대체"
        ],
        guide: {
            available: "더해피450 ONE (2구좌 이상)",
            conditions: "연수 개시 4개월 전 신청 필수",
            fees: "개인 용돈 및 현지 교통비 제외",
            method: "고객센터 1588-5811 접수"
        },
        notes: "국가별 학생 비자 발급 기간이 다를 수 있어 사전 예약이 필수적입니다.",
        items: [
            { name: "[대교] 눈높이 초등 영어 패키지", desc: "초등 학습, 3개월 과정, 영어 패키지", price: "414,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/5614f0b7-ec6d-4203-92c9-71f78bb1fa22", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=93&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "[대교] 눈높이 초등 수학 패키지", desc: "초등 학습, 3개월 과정, 수학 패키지", price: "393,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/41f22350-9312-45df-b248-199b8f4106fd", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=94&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "[대교] 눈높이 중등 국어·영어·수학 패키지", desc: "중등 학습, 3개월 과정, 수능 국어·영어·수학 패키지", price: "1,080,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/e089a242-8900-4e08-a4cc-158bbb6d7b00", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=95&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "[대교] 눈높이 초등 국어 패키지", desc: "초등 학습, 3개월 과정, 국어 패키지", price: "489,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/ce2328cb-71cc-455f-bbff-32771e732489", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=92&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "[2025 여름방학] 주니어 MBC 해외 영어캠프", desc: "#영어캠프 #해외캠프 #주니어캠프 #MBC연합캠프", price: "4,990,000원~", period: "2025-04-28 ~ 2025-07-15", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/04/28/89ee6051-2543-4e75-ad13-6059b33d84c5", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=59&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "[26년 여름방학] MBC 영어캠프(아시아)", desc: "#싱가포르 #말레이시아 #필리핀 #한국", price: "2,800,000원~", period: "2026-06-02 ~ 2026-08-31", tags: ["전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/02/0d7d502f-3791-41d8-88e2-5a6a0d595839", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=88&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "[26년 여름방학] MBC 영어캠프(미주/남태평양)", desc: "#미주 #캐나다 #호주 #뉴질랜드", price: "5,700,000원~", period: "2026-06-02 ~ 2026-08-31", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/02/7ceeecac-a8a9-46e5-b436-e91dfa101710", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=89&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "['26 겨울방학] 주니어 MBC영어캠프(아시아/남태)", desc: "#영어캠프 #해외캠프 #주니어캠프 #MBC연합캠프", price: "4,100,000원~", period: "2025-10-27 ~ 2025-12-31", tags: ["이벤트","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/10/27/d8ab699d-2fb4-4e1d-9be9-d71b3a385f8c", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=77&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "[대교] 눈높이 유아 리틀원 패키지", desc: "유아 학습, 3개월 과정, 한글&수학 패키지", price: "810,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/a4ae2c82-f7ca-40dc-a911-8659a023fe26", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=91&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
            { name: "['26 겨울방학] 주니어 MBC영어캠프(미주/유럽)", desc: "#영어캠프 #해외캠프 #주니어캠프 #MBC연합캠프", price: "8,500,000원~", period: "2025-10-27 ~ 2025-12-31", tags: ["이벤트","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/10/27/40a21b16-36cb-42db-9bb4-1de58ab3605d", status: "접수마감", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=76&prdctCd=%EA%B5%90%EC%9C%A1%2F%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" }
        ]
    },
    "웨딩": {
        title: "로맨틱 웨딩 컨설팅",
        subtitle: "웨딩홀, 드레스, 메이크업부터 완벽한 결혼식 연출",
        desc: "트렌디한 프리미엄 스튜디오, 브랜드 드레스, 메이크업 패키지와 제휴 홀 혜택을 결합하여 특별한 순간을 완성합니다.",
        img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product06.jpg",
        highlights: [
            "인기 웨딩 스튜디오 & 유명 드레스 브랜드 연계",
            "전문 웨딩 플래너 1:1 밀착 케어",
            "소노 컨벤션 웨딩홀 대관료 할인"
        ],
        guide: {
            available: "더해피450 ONE (1구좌 이상)",
            conditions: "예식 예정일 최소 6개월 전 신청",
            fees: "일부 프리미엄 드레스 피팅비 별도",
            method: "소노아임레디 고객센터 1588-5811 접수"
        },
        notes: "예식 일정이 몰리는 봄/가을 시즌에는 최소 6개월 전 접수가 필수적입니다.",
        items: [
            { name: "[프리미엄] 골드바&다이아 주얼리", desc: "순금골드바, 랩 그로운 다이아몬드, 맞춤제작", price: "170,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/05/14/d646c2a5-88ef-406d-a56b-4077c849ca71", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=86&prdctCd=%EC%9B%A8%EB%94%A9" },
            { name: "[웨딩3] (스드메)+(예복or주얼리or스냅촬영PKG)", desc: "스드메부터 주얼리, 스냅촬영까지!", price: "5,940,000원~", period: "상시", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/c4d1be0d-e6da-4110-98a8-3063353b43fd", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=43&prdctCd=%EC%9B%A8%EB%94%A9" },
            { name: "[웨딩2] (스드메)+(예복or스냅촬영)", desc: "스드메부터 스냅촬영까지!", price: "4,990,000원~", period: "상시", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/04/03/82bc43bf-88dc-42ef-8872-b864973646ff", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=83&prdctCd=%EC%9B%A8%EB%94%A9" },
            { name: "[가전] 신혼 필수가전 추천", desc: "#가전 #신혼가전 #소형가전", price: "10,000원~", period: "상시", tags: ["신규","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/04/26/13896e3f-c284-454d-80f6-0c43ac9e565e", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=84&prdctCd=%EC%9B%A8%EB%94%A9" },
            { name: "[침구] 혼수 침구·패브릭 추천", desc: "#침구 #패브릭 #신혼침구", price: "10,000원~", period: "상시", tags: ["신규","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/04/28/1bbec3a6-0591-4a0e-bb59-60a55d9e84dc", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=85&prdctCd=%EC%9B%A8%EB%94%A9" },
            { name: "[웨딩1] 스튜디오+드레스+메이크업+예복(한복)", desc: "합리적인 웨딩 준비, 스드메와 예복(한복)을 한번에!", price: "3,990,000원~", period: "상시", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/8875ed6c-7ac8-430b-a608-c7e61b8b2f11", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=42&prdctCd=%EC%9B%A8%EB%94%A9" },
            { name: "[주얼리] 청담 예물명가 쥬드쥬얼리", desc: "35년 전통의 청담동 주얼리로 가치를 더해보세요.", price: "3,990,000원~", period: "상시", tags: ["추천","전환","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/d33da11a-65ad-40bf-8eea-4a6bbd8752a2", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=45&prdctCd=%EC%9B%A8%EB%94%A9" },
            { name: "[예복] 맞춤예복명가 아틀레 회원특가", desc: "#예복 #결혼예복 #맞춤정장", price: "890,000원~", period: "상시", tags: ["추천","레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/258d616d-3127-4d01-9994-46ecacf9694e", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=62&prdctCd=%EC%9B%A8%EB%94%A9" }
        ]
    },
    "쇼핑": {
        title: "명품 라이프 & 쇼핑",
        subtitle: "트렌디 가전부터 프리미엄 명품 쇼핑 혜택",
        desc: "일상의 품격을 높여주는 고급 브랜드 패션 컬렉션, 잡화 및 최신 스마트 홈 가전제품을 내 혜택 그대로 연계하여 스마트하게 구매 가능합니다.",
        img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product10.jpg?raw=true",
        highlights: [
            "정품 인증 브랜드 라이프스타일 컬렉션",
            "최신 가전 트렌드 상시 라인업 구축",
            "안전한 택배 배송 및 신속 교환 보장"
        ],
        guide: {
            available: "더해피450 ONE (1구좌 이상)",
            conditions: "상시 신청 및 즉시 전환 적용",
            fees: "몰 내 배송비 무료 혜택 지원",
            method: "소노아임레디 고객센터 1588-5811 접수"
        },
        notes: "포인트 전환 완료 후 취소는 규정에 의거 제한될 수 있습니다.",
        items: [
            { name: "[명품케어] 명품 매입서비스", desc: "#명품매입, #명품시계/가방 #주얼리", price: "100,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/09/10/eee70d16-1d6e-4bbe-8918-d837fb0885ea", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=72&prdctCd=%EC%87%BC%ED%95%91" },
            { name: "[명품케어] 명품 수선서비스", desc: "#명품수선 #명품시계 #명품가방", price: "40,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/09/10/2467111e-6b02-4609-bcff-303936bbc11f", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=73&prdctCd=%EC%87%BC%ED%95%91" }
        ]
    },
    "리빙": {
        title: "스마트 홈 리빙 컨시어지",
        subtitle: "현대리바트 가구 및 프리미엄 이사 서비스 전환",
        desc: "명품 이사 서비스인 통인익스프레스 이사 컨시어지와 함께 현대리바트의 거실, 주방, 침실, 키즈 가구 패키지를 아임레디 혜택으로 자유롭게 이용 가능합니다.",
        img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product07.jpg",
        highlights: [
            "현대리바트 거실/주방/침실/키즈 가구 패키지",
            "통인익스프레스 이사 및 입주 청소 지원",
            "이사/정리수납 전문 리빙 토탈 컨시어지 지원"
        ],
        guide: {
            available: "더해피450 ONE (1구좌 이상)",
            conditions: "설치 및 이사 예정 3주 전 전환 접수",
            fees: "도서산간/일부 지역 설치비 및 사다리차 등 장비 비용 본인 부담",
            method: "소노아임레디 고객센터 1588-5811 접수"
        },
        notes: "이사 일정 및 아파트 규격, 사다리차 이용 여부에 따라 현장 추가 요금이 발생할 수 있습니다.",
        items: [
            { name: "[레디캐시전용] 통인익스프레스 이사 컨시어지", desc: "#이사 #프리미엄 #레디캐시전용", price: "700,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/18/75b99aec-8740-44fd-8ce7-4cb9b72fc0d8", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=78&prdctCd=%EB%A6%AC%EB%B9%99" },
            { name: "[레디캐시전용] 현대리바트 거실가구 ", desc: "#리바트 #거실가구 #레디캐시전용", price: "1,858,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/872b3cc8-4448-4cf3-99be-2ea48f90a163", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=66&prdctCd=%EB%A6%AC%EB%B9%99" },
            { name: "[레디캐시전용] 현대리바트 주방가구", desc: "#리바트 #주방가구 #레디캐시전용", price: "982,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/52116ea4-024a-4566-8ca6-03a14ebbc264", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=67&prdctCd=%EB%A6%AC%EB%B9%99" },
            { name: "[레디캐시전용] 현대리바트 침실가구", desc: "#리바트 #침실가구 #레디캐시전용", price: "1,156,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/90253af0-965b-4bd0-a197-87092dd59e10", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=68&prdctCd=%EB%A6%AC%EB%B9%99" },
            { name: "[레디캐시전용] 현대리바트 키즈가구", desc: "#리바트 #키즈가구 #레디캐시전용", price: "590,000원~", period: "상시", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/3613045b-5ba8-4427-9fb1-70fb265081ed", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=69&prdctCd=%EB%A6%AC%EB%B9%99" }
        ]
    },
    "쉼케어": {
        title: "장지 및 안심 힐링 쉼케어",
        subtitle: "고품격 장지 에스코트 및 심리케어 웰니스 서비스",
        desc: "갑작스러운 시기에 가족 모두의 안정을 돕는 종합심리검사 상담 서비스와 함께 최고의 장지 안치 시설 우대 안내 서비스를 제공합니다.",
        img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product08.jpg?raw=true",
        highlights: [
            "전국 우수 추모공원 및 납골당 VIP 우대 할인",
            "전문 에스코트 및 상담 전문 동행 요원 배치",
            "가족 종합 심리케어 검사 무료 바우처 지급"
        ],
        guide: {
            available: "더해피450 ONE (1구좌 이상)",
            conditions: "상시 예약 신청 가능",
            fees: "안치단 위치 및 석조 가공 비용 별도",
            method: "소노아임레디 고객센터 1588-5811 접수"
        },
        items: [
            { name: "[장지] 장지 시설 서비스", desc: "합법적인 허가 및 관리가 이뤄지는 장지시설 엄선", price: "3,990,000원~", period: "상시", tags: ["추천","전환"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/9d4c2dda-4ef2-4147-9cea-06e9a9edff9c", status: "접수중", link: "https://www.sonoimready.com/front/sc/chgServDetail?prdctSeq=40&prdctCd=%EC%89%BC%EC%BC%80%EC%96%B4" }
        ]
    }
};

interface SmartCareContentProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    isPremiumMallMode?: boolean;
}

const getPlanTagStyle = (name: string, slotCount: number) => {
    const cleanName = name.replace(/\s/g, "");
    if (cleanName.includes("4더블")) {
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-amber-500/20";
    }
    if (cleanName.includes("5")) {
        return "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-600/20";
    }
    if (slotCount === 2) {
        return "bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent shadow-lg shadow-teal-500/20";
    }
    if (slotCount === 3) {
        return "bg-gradient-to-r from-pink-500 to-rose-600 text-white border-transparent shadow-lg shadow-pink-500/20";
    }
    if (slotCount === 4) {
        return "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-lg shadow-violet-600/20";
    }
    return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-lg shadow-cyan-500/20";
};

export default function SmartCareContent({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    isPremiumMallMode = false
}: SmartCareContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pickedAppliance, setPickedAppliance] = useState<Appliance | null>(null);
    const [detailModalAppliance, setDetailModalAppliance] = useState<Appliance | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedHybrid, setSelectedHybrid] = useState<string | null>(null);
    const [hybridItems, setHybridItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [hybridStatusFilter, setHybridStatusFilter] = useState<"전체" | "접수중" | "접수마감">("전체");

    useEffect(() => {
        if (!selectedHybrid) {
            setHybridItems([]);
            setHybridStatusFilter("전체");
            document.body.style.overflow = "";
            return;
        }

        setHybridStatusFilter("전체");
        document.body.style.overflow = "hidden";

        const detail = hybridDetails[selectedHybrid];
        // 기본 셋업 (로딩 중 임시 정적 셋업)
        setHybridItems(detail?.items || []);

        // 모든 전환 서비스 카테고리에 대해 실시간 API 동기화 시도
        setIsLoadingItems(true);
        fetch(`/api/hybrid?category=${encodeURIComponent(selectedHybrid)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.items) && data.items.length > 0) {
                    setHybridItems(data.items);
                }
            })
            .catch(err => {
                console.error("Failed to load live hybrid products:", err);
            })
            .finally(() => {
                setIsLoadingItems(false);
            });

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedHybrid]);

    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [showAllOverlay, setShowAllOverlay] = useState(false);
    const [funeralPlanTab, setFuneralPlanTab] = useState<"smartcare5" | "smartcare4">("smartcare5");

    // Convex Query - Fetch and filter client-side for stability
    const productsData = useQuery(api.products.get);
    const promotionsData = useQuery(api.promotions.get);
    const careProductsData = useQuery(api.careProducts.get);
    
    // 일반상품(standard)으로 등록한 상품은 스마트케어 랜딩(플랜섹션, 가전목록 등)에서 제외
    const smartCareProductsData = useMemo(() => {
        return careProductsData
            ? careProductsData.filter(cp => cp.productType !== "standard" && !cp.name.includes("더해피450"))
            : undefined;
    }, [careProductsData]);

    const allAppliances = ((productsData || []) as Appliance[]).filter(p => p.isVisible !== false);
    const activePromotions = (promotionsData || []).filter(p => p.isActive !== false);
    const isLoadingAppliances = productsData === undefined;
    const [expandedProductNames, setExpandedProductNames] = useState<Set<string>>(new Set());
    const categoriesOrder = ["에어컨/에어케어", "세탁가전", "냉장가전", "주방가전", "생활가전", "TV/디지털", "건강/뷰티", "가구/침대", "기타가전"];
    
    const defaultPlansList = useMemo(() => [
        { _id: "sc4double", name: "스마트케어 4더블", slotCount: 2, monthlyPayment: 55200, cardDiscountPayment: 35000, target: "1인 가구 / 소형 가전", features: ["가전 렌탈료 전액 지원 혜택", "멤버십 즉시 이용", "100% 만기 환급 (만기 후 익월 해약 시)"], paymentCount: "1~179회(180회:79,200원)", defermentPeriod: "181~200회", maturityCount: "200회" },
        { _id: "sc5", name: "스마트케어 5", slotCount: 1, monthlyPayment: 33000, cardDiscountPayment: 25000, target: "1인 가구 / 소형 가전", features: ["가전 렌탈료 전액 지원 혜택", "멤버십 즉시 이용", "100% 만기 환급 (만기 후 익월 해약 시)"], paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
        { _id: "sc5double", name: "스마트케어 5더블", slotCount: 2, monthlyPayment: 66000, cardDiscountPayment: 42000, target: "신혼 부부 / 중형 가전", features: ["가전 렌탈료 전액 지원 혜택", "멤버십 즉시 이용", "100% 만기 환급 (만기 후 익월 해약 시)"], paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
        { _id: "sc5triple", name: "스마트케어 5트리플", slotCount: 3, monthlyPayment: 99000, cardDiscountPayment: 42000, target: "일반 가전 / 대형 가전", features: ["가전 렌탈료 전액 지원 혜택", "멤버십 즉시 이용", "100% 만기 환급 (만기 후 익월 해약 시)"], paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
        { _id: "sc5quad", name: "스마트케어 5쿼드", slotCount: 4, monthlyPayment: 132000, cardDiscountPayment: 42000, target: "대가족 / 프리미엄 가전 패키지", features: ["가전 렌탈료 전액 지원 혜택", "멤버십 즉시 이용", "100% 만기 환급 (만기 후 익월 해약 시)"], paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
    ], []);

    const activePlan = useMemo(() => {
        const plans = (smartCareProductsData && smartCareProductsData.length > 0) ? smartCareProductsData : defaultPlansList;
        if (selectedPlanId) {
            const found = plans.find((p: any) => p._id === selectedPlanId || p.name === selectedPlanId);
            if (found) return found;
        }
        return plans.find((p: any) => p.name === "스마트케어 5더블" || p.slotCount === 2) || plans[0];
    }, [selectedPlanId, smartCareProductsData, defaultPlansList]);

    // Dynamic Slots based on registered care products (smartcare plans only)
    const availableSlots = smartCareProductsData && smartCareProductsData.length > 0
        ? Array.from(new Set(smartCareProductsData.map(cp => cp.slotCount))).sort((a, b) => a - b)
        : Array.from(new Set(allAppliances.map(a => a.slotCount || 4))).sort((a, b) => a - b);
    
    const hasInitializedPlanRef = useRef(false);
    
    // 마우스 좌우 드래그 스크롤 핸들러를 위한 Ref 및 State
    const planScrollRef = useRef<HTMLDivElement>(null);
    const isPlanMouseDownRef = useRef(false);
    const planStartXRef = useRef(0);
    const planScrollLeftRef = useRef(0);
    const isPlanDraggingRef = useRef(false);
    const [isPlanGrabbing, setIsPlanGrabbing] = useState(false);

    const handlePlanMouseDown = (e: React.MouseEvent) => {
        if (!planScrollRef.current) return;
        isPlanMouseDownRef.current = true;
        isPlanDraggingRef.current = false;
        planStartXRef.current = e.pageX - planScrollRef.current.offsetLeft;
        planScrollLeftRef.current = planScrollRef.current.scrollLeft;
        setIsPlanGrabbing(true);
    };

    const handlePlanMouseMove = (e: React.MouseEvent) => {
        if (!isPlanMouseDownRef.current || !planScrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - planScrollRef.current.offsetLeft;
        const walk = (x - planStartXRef.current) * 1.5;
        if (Math.abs(x - planStartXRef.current) > 5) {
            isPlanDraggingRef.current = true;
        }
        planScrollRef.current.scrollLeft = planScrollLeftRef.current - walk;
    };

    const handlePlanMouseUpOrLeave = () => {
        isPlanMouseDownRef.current = false;
        setIsPlanGrabbing(false);
        setTimeout(() => {
            isPlanDraggingRef.current = false;
        }, 80);
    };

    // Default to a 4-slot plan once smartCareProductsData is loaded for the first time
    useEffect(() => {
        if (smartCareProductsData && smartCareProductsData.length > 0 && !hasInitializedPlanRef.current) {
            hasInitializedPlanRef.current = true;
            const defaultPlan = smartCareProductsData.find(cp => cp.slotCount === 4) || smartCareProductsData[0];
            if (defaultPlan) setSelectedPlanId(defaultPlan._id);
        }
    }, [smartCareProductsData]);

    // Dynamic Categories based on current slot selection
    const availableCategories = Array.from(new Set(
        allAppliances
            .filter(a => {
                if (selectedPlanId === "") return true;
                return a.careProductId === selectedPlanId || 
                       (!a.careProductId && a.slotCount === smartCareProductsData?.find(cp => cp._id === selectedPlanId)?.slotCount);
            })
            .map(a => a.category)
    )).sort((a, b) => {
        if (!a) return 1;
        if (!b) return -1;
        const idxA = categoriesOrder.indexOf(a);
        const idxB = categoriesOrder.indexOf(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    const [selectedCategory, setSelectedCategory] = useState<string>("전체");

    // 페이지 내 버튼 문구 처리
    const ctaText = isPremiumMallMode 
        ? "프리미엄몰 접수 바로가기" 
        : (partnerMode ? "가입 신청하기" : "제휴 파트너 신청하기");

    // 현재 구좌 및 카테고리에 맞는 가전 필터링
    const filteredAppliances = allAppliances.filter(item => {
        const matchesPlan = selectedPlanId === "" 
            ? true 
            : (item.careProductId === selectedPlanId || 
               (!item.careProductId && item.slotCount === smartCareProductsData?.find(cp => cp._id === selectedPlanId)?.slotCount));
        const matchesCategory = selectedCategory === "전체" ? true : item.category === selectedCategory;
        return matchesPlan && matchesCategory;
    });

    // 프로모션 상품 필터링 (프로모션 세션용)
    const promotionAppliances = allAppliances.filter(item => item.promotionId);

    // Helper to determine unit from tag (for compatibility if needed)
    const getUnitFromTag = (item: Appliance) => {
        return (item.slotCount || 4).toString();
    };

    const handleApplianceClick = (item: Appliance) => {
        setPickedAppliance(item);
        if (item.careProductId && item.careProductId !== selectedPlanId && selectedPlanId !== "") {
            setSelectedPlanId(item.careProductId);
        } else if (!item.careProductId && item.slotCount) {
            const cp = smartCareProductsData?.find(c => c.slotCount === item.slotCount);
            if (cp && cp._id !== selectedPlanId && selectedPlanId !== "") {
                setSelectedPlanId(cp._id);
            }
        }
        setDetailModalAppliance(item);
    };

    const handleApplyWithProduct = () => {
        if (pickedAppliance) {
            if (pickedAppliance.careProductId) {
                setSelectedPlanId(pickedAppliance.careProductId);
            } else {
                const cp = smartCareProductsData?.find(c => c.slotCount === pickedAppliance.slotCount);
                if (cp) setSelectedPlanId(cp._id);
            }
            setIsModalOpen(true);
        }
    };

    // Sort and filter appliances for display (directly uses backend sorted order from api.products.get)
    const displayAppliances = filteredAppliances;

    // Helper for promotion types/colors
    const getPromotionStyle = (promotionId?: string) => {
        if (!promotionId) return null;
        const promo = activePromotions.find(p => p._id === promotionId);
        const title = promo?.title || "";
        
        // Priority 1: Check for explicit suffixes
        if (title.includes("(A)")) {
            return {
                name: "blue",
                border: "border-blue-500/40 hover:border-blue-500 hover:shadow-blue-500/10",
                badge: "bg-blue-600 text-white",
                benefit: "bg-blue-500 text-white border-blue-400 font-bold",
                glow: "49, 130, 246",
                tag: "bg-blue-600",
                text: "text-blue-600",
                bg: "bg-blue-50/50",
                button: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
                borderFull: "border-blue-200"
            };
        }
        if (title.includes("(B)")) {
            return {
                name: "pink",
                border: "border-pink-500/40 hover:border-pink-500 hover:shadow-pink-500/10",
                badge: "bg-pink-600 text-white",
                benefit: "bg-pink-500 text-white border-pink-400 font-bold",
                glow: "236, 72, 153",
                tag: "bg-pink-600",
                text: "text-pink-600",
                bg: "bg-pink-50/50",
                button: "bg-pink-600 hover:bg-pink-700 shadow-pink-600/20",
                borderFull: "border-pink-200"
            };
        }
        if (title.includes("(C)")) {
            return {
                name: "orange",
                border: "border-orange-500/40 hover:border-orange-500 hover:shadow-orange-500/10",
                badge: "bg-orange-500 text-white",
                benefit: "bg-orange-400 text-white border-orange-300 font-bold",
                glow: "251, 146, 60",
                tag: "bg-orange-500",
                text: "text-orange-600",
                bg: "bg-orange-50/50",
                button: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
                borderFull: "border-orange-200"
            };
        }
        if (title.includes("(D)")) {
            return {
                name: "emerald",
                border: "border-emerald-500/40 hover:border-emerald-500 hover:shadow-emerald-500/10",
                badge: "bg-emerald-600 text-white",
                benefit: "bg-emerald-500 text-white border-emerald-400 font-bold",
                glow: "16, 185, 129",
                tag: "bg-emerald-600",
                text: "text-emerald-600",
                bg: "bg-emerald-50/50",
                button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
                borderFull: "border-emerald-200"
            };
        }
        if (title.includes("(E)")) {
            return {
                name: "purple",
                border: "border-purple-500/40 hover:border-purple-500 hover:shadow-purple-500/10",
                badge: "bg-purple-600 text-white",
                benefit: "bg-purple-500 text-white border-purple-400 font-bold",
                glow: "139, 92, 246",
                tag: "bg-purple-600",
                text: "text-purple-600",
                bg: "bg-purple-50/50",
                button: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
                borderFull: "border-purple-200"
            };
        }

        // Priority 2: Fallback to Brand Keywords
        if (title.includes("삼성")) {
            return {
                name: "blue",
                border: "border-blue-500/40 hover:border-blue-500 hover:shadow-blue-500/10",
                badge: "bg-blue-600 text-white",
                benefit: "bg-blue-500 text-white border-blue-400 font-bold",
                glow: "49, 130, 246",
                tag: "bg-blue-600",
                text: "text-blue-600",
                bg: "bg-blue-50/50",
                button: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
                borderFull: "border-blue-200"
            };
        }
        if (title.includes("LG")) {
            return {
                name: "pink",
                border: "border-pink-500/40 hover:border-pink-500 hover:shadow-pink-500/10",
                badge: "bg-pink-600 text-white",
                benefit: "bg-pink-500 text-white border-pink-400 font-bold",
                glow: "236, 72, 153",
                tag: "bg-pink-600",
                text: "text-pink-600",
                bg: "bg-pink-50/50",
                button: "bg-pink-600 hover:bg-pink-700 shadow-pink-600/20",
                borderFull: "border-pink-200"
            };
        }

        // Priority 3: Default Gold
        return {
            name: "gold",
            border: "border-orange-500/40 hover:border-orange-500 hover:shadow-orange-500/10",
            badge: "bg-orange-500 text-white",
            benefit: "bg-orange-400 text-white border-orange-300 font-bold",
            glow: "251, 146, 60",
            tag: "bg-orange-500",
            text: "text-orange-600",
            bg: "bg-orange-50/50",
            button: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
            borderFull: "border-orange-200"
        };
    };

    return (
        <>
            <Header partnerMode={partnerMode} partnerUrl={partnerUrl} partnerName={partnerName} partnerId={partnerId} productType="smartcare" isPremiumMallMode={isPremiumMallMode} />
            <main className="pb-32"> {/* Add padding for fixed bottom bar */}
                {/* 히어로 섹션 */}
                <section
                    className="relative min-h-[75vh] flex items-center bg-sono-dark overflow-hidden pt-12 bg-cover bg-center bg-[url('https://res.cloudinary.com/lyjyvy54/image/upload/v1785980602/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_6%EC%9D%BC_%EC%98%A4%EC%A0%84_10_12_51_fvzqk5.png')] md:bg-[url('https://res.cloudinary.com/lyjyvy54/image/upload/v1785975702/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_6%EC%9D%BC_%EC%98%A4%EC%A0%84_01_26_52_nl5poy.png')]"
                    style={{
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* 오버레이: 메인 페이지와 동일한 텍스트 가독성 고도화 그라데이션 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/30 z-0"></div>
                    <div className="absolute inset-0 bg-black/25 z-0"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 relative z-10 w-full">
                        <div className="max-w-4xl animate-fade-in text-left">
                            <span className="inline-block bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-black border border-white/20 mb-8 px-4 py-2 rounded-none text-sm shadow-xl tracking-wider">
                                ★ PREMIUM HYBRID SERVICE
                            </span>
                            <h1 className="leading-[1.12] mb-6 tracking-tighter filter drop-shadow-2xl">
                                <span className="block text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-md">스마트케어</span>
                            </h1>
                            <div className="space-y-3 mb-10">
                                <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-amber-300 tracking-tight drop-shadow-md break-keep">
                                    최신가전 렌탈금 전액 지원과<br />만기 시 납입금 100% 환급 보장
                                </p>
                                <p className="text-base md:text-lg text-white/95 leading-relaxed font-semibold drop-shadow-sm break-keep">
                                    국내 대표 토탈 라이프케어 브랜드 소노아임레디가 제안하는 스마트 라이프 솔루션
                                </p>
                            </div>

                            {/* 두 개의 혜택 요약 카드 (가전지원 + 멤버십) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                {/* 프리미엄 가전 지원 카드 */}
                                <div className="relative group flex flex-col justify-between bg-slate-950/40 backdrop-blur-md border border-amber-400/30 p-6 rounded-none shadow-2xl overflow-hidden text-left">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400"></div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shrink-0 rounded-none">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-amber-300 text-lg font-black tracking-tight flex items-center gap-2">
                                                프리미엄 가전 렌탈료 지원
                                                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-none animate-pulse font-bold">BEST</span>
                                            </h3>
                                        </div>
                                        <p className="text-white font-bold text-xs sm:text-sm leading-relaxed break-keep mb-3">
                                            삼성, LG 등 최신 프리미엄 가전제품의 <span className="text-amber-300 underline underline-offset-4 decoration-2">월 렌탈료를 100% 전액 지원</span>하여 이용할 수 있는 스마트케어 시그니처 혜택
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                        <span className="text-slate-400 text-[10px] font-semibold">가전 라인업 확인하기</span>
                                        <button 
                                            onClick={() => {
                                                document.getElementById("appliance-section")?.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="shrink-0 bg-white/10 hover:bg-white text-white hover:text-slate-900 px-3 py-1.5 rounded-none text-[10px] font-black transition-all border border-white/20 flex items-center gap-1 cursor-pointer"
                                        >
                                            바로가기
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* 소노그룹 멤버십 혜택 카드 */}
                                <div className="relative group flex flex-col justify-between bg-slate-950/40 backdrop-blur-md border border-emerald-500/30 p-6 rounded-none shadow-2xl overflow-hidden text-left">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500"></div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0 rounded-none">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-emerald-400 text-lg font-black tracking-tight flex items-center gap-2">
                                                소노그룹 멤버십 혜택
                                                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-none animate-pulse font-bold">FREE</span>
                                            </h3>
                                        </div>
                                        <p className="text-white font-bold text-xs sm:text-sm leading-relaxed break-keep mb-3">
                                            전국 소노호텔 & 리조트 객실 특별 우대 요금 및 오션월드, 스키장 등 <span className="text-emerald-400 underline underline-offset-4 decoration-2">소노그룹 레저 인프라 멤버십 혜택</span> 우대 혜택 제공
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                        <span className="text-slate-400 text-[10px] font-semibold">자세한 서비스 내용 보기</span>
                                        <button 
                                            onClick={() => {
                                                document.getElementById("membership-benefits")?.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="shrink-0 bg-white/10 hover:bg-white text-white hover:text-slate-900 px-3 py-1.5 rounded-none text-[10px] font-black transition-all border border-white/20 flex items-center gap-1 cursor-pointer"
                                        >
                                            바로가기
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>


                            {/* 버튼 영역 */}
                            <div className="flex flex-col sm:flex-row gap-5 mt-10">
                                {partnerMode ? (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="border-2 border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 bg-transparent px-10 py-5 rounded-none font-black text-lg transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] text-center"
                                    >
                                        {ctaText}
                                    </button>
                                ) : (
                                    <Link
                                        href="/partner/apply"
                                        className="border-2 border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 bg-transparent px-10 py-5 rounded-none font-black text-lg transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] text-center"
                                    >
                                        {ctaText}
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        document.getElementById("appliance-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="border-2 border-white/60 text-white hover:bg-white hover:text-slate-950 bg-transparent px-10 py-5 rounded-none font-black text-lg transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] text-center"
                                >
                                    가전 라인업 보기
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                {/* 3대 핵심 혜택 */}
                <section className="py-20 md:py-32 bg-slate-100 text-slate-900 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="bg-blue-600/10 text-blue-600 text-xs font-black px-4 py-2 rounded-none uppercase tracking-wider mb-4 inline-block border border-blue-500/30">
                                KEY BENEFITS
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">스마트케어 핵심 혜택</h2>
                            <p className="text-slate-500 font-medium text-sm md:text-base mt-3 max-w-xl mx-auto break-keep">
                                최고급 가전 지원 혜택부터 100% 환급 보장까지 파트너 및 회원님께 제공되는 특별한 시그니처 혜택
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {[
                                {
                                    title: "BENEFIT 01",
                                    name: "프리미엄 가전 렌탈금 전액 지원",
                                    desc: "삼성, LG 등 최고급 브랜드의 최신 가전 렌탈비 전액을 지원받아 즉시 이용합니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785975702/premium_appliance_rental_support_logo_dqmmm8.png"
                                },
                                {
                                    title: "BENEFIT 02",
                                    name: "100% 안심 환급 시스템",
                                    desc: "만기 후 익월 해약 시 까지 상조나 전환 서비스를 이용하지 않으시면 납입금 100% 전액을 환급해 드립니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932610/06_full_refund_logo_1_ija0rc.png"
                                },
                                {
                                    title: "BENEFIT 03",
                                    name: "하이브리드 전환 서비스",
                                    desc: "상조 외에도 크루즈, 해외여행, 골프, 교육, 어학연수 등 원하는 라이프케어 서비스로 즉각 전환합니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932609/02_hybrid_service_conversion_logo_1_mynjl3.png"
                                },
                                {
                                    title: "BENEFIT 04",
                                    name: "소노그룹 멤버십 혜택",
                                    desc: "가입 즉시 전국 소노호텔 & 리조트 객실 및 부대시설, 레저 할인 우대 혜택을 곧바로 누립니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932611/04_sono_hotel_resort_benefit_with_logo_1_cw84ct.png"
                                }
                            ].map((benefit, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white border border-slate-200 rounded-none overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col group text-left"
                                >
                                    {/* 이미지 비주얼 영역 (직각) */}
                                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950 rounded-none">
                                        <img 
                                            src={benefit.image} 
                                            alt={benefit.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                                    </div>

                                    {/* 내용 영역 */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase mb-2 block">
                                            {benefit.title}
                                        </span>
                                        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors break-keep">
                                            {benefit.name}
                                        </h3>
                                        <p className="text-slate-500 text-xs leading-relaxed font-medium break-keep">
                                            {benefit.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* 상품 구성 섹션 */}
                <section className="py-8 md:py-14 bg-gradient-to-b from-[#0b0f19] via-[#0f172a] to-[#0b0f19] relative text-white border-b border-slate-800" id="plans-section">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-none blur-[120px] pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                        <div className="text-center mb-6 md:mb-10">
                            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-2 leading-tight">
                                다양한 라이프스타일에<br className="md:hidden" /> 맞춘 구성
                            </h2>
                            <p className="text-slate-400 font-bold text-xs sm:text-base max-w-2xl mx-auto break-keep">
                                원하는 구좌 수를 선택하고 최신 가전을 골라보세요.
                            </p>
                            
                            {/* 좌우 드래그 안내 뱃지 */}
                            <div className="mt-3 inline-flex items-center gap-2 bg-[#1f2d42]/80 border border-blue-500/30 text-blue-300 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                </svg>
                                <span>좌우로 마우스 드래그하여 5가지 플랜 비교</span>
                                <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative group px-1 sm:px-4">
                            {/* Previous Arrow Button (Desktop & Mobile) */}
                            <button 
                                onClick={(e) => { 
                                    const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                    if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth; el.scrollBy({ left: -w, behavior: 'smooth' }); }
                                }} 
                                className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-30 bg-slate-900/90 hover:bg-blue-600 text-white p-3 sm:p-3.5 rounded-full shadow-2xl border border-white/20 hover:border-blue-400 transition-all duration-300 focus:outline-none flex items-center justify-center active:scale-95" 
                                aria-label="이전 플랜 보기"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>

                            {/* Plan Cards Horizontal Scroll Container (Drag-to-Scroll enabled) */}
                            <div 
                                ref={planScrollRef}
                                onMouseDown={handlePlanMouseDown}
                                onMouseMove={handlePlanMouseMove}
                                onMouseUp={handlePlanMouseUpOrLeave}
                                onMouseLeave={handlePlanMouseUpOrLeave}
                                style={{ scrollSnapType: isPlanGrabbing ? 'none' : 'x mandatory' }} 
                                className={`flex w-full overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4 md:py-8 px-2 sm:px-4 scroll-px-4 gap-4 sm:gap-6 items-stretch justify-start scroll-smooth select-none ${
                                    isPlanGrabbing ? 'cursor-grabbing' : 'cursor-grab'
                                }`}
                            >
                                {(smartCareProductsData && smartCareProductsData.length > 0 ? smartCareProductsData : [
                                    { name: "스마트케어 4더블", slotCount: 2, monthlyPayment: 55200, cardDiscountPayment: 35000, target: "1인 가구 / 소형 가전", paymentCount: "1~179회(180회:79,200원)", defermentPeriod: "181~200회", maturityCount: "200회" },
                                    { name: "스마트케어 5", slotCount: 1, monthlyPayment: 33000, cardDiscountPayment: 25000, target: "1인 가구 / 소형 가전", paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
                                    { name: "스마트케어 5더블", slotCount: 2, monthlyPayment: 66000, cardDiscountPayment: 42000, target: "신혼 부부 / 중형 가전", paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
                                    { name: "스마트케어 5트리플", slotCount: 3, monthlyPayment: 99000, cardDiscountPayment: 42000, target: "일반 가전 / 대형 가전", paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
                                    { name: "스마트케어 5쿼드", slotCount: 4, monthlyPayment: 132000, cardDiscountPayment: 42000, target: "대가족 / 프리미엄 가전 패키지", paymentCount: "1~180회", defermentPeriod: "181~200회", maturityCount: "200회" },
                                ]).map((plan: any, i) => {
                                    const isBest = plan.slotCount === 4 || (smartCareProductsData && smartCareProductsData.length > 0 ? i === 2 : i === 2);
                                    const isActive = selectedPlanId === plan._id || (selectedPlanId === "" && isBest);
                                    const cardDiscount = 23000;
                                    const discountedPrice = Math.max(0, plan.monthlyPayment - cardDiscount);

                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => {
                                                if (isPlanDraggingRef.current) return;
                                                setSelectedPlanId(plan._id);
                                            }}
                                            style={{ scrollSnapStop: 'always' }}
                                            className={`relative !p-4 sm:!p-5 flex flex-col justify-between transition-all rounded-[24px] snap-center snap-always [scroll-snap-stop:always] shrink-0 w-[285px] sm:w-[315px] md:w-[325px] cursor-pointer select-none ${
                                                isActive 
                                                    ? "bg-white text-slate-900 shadow-[0_20px_50px_rgba(37,99,235,0.25)] border-[3px] border-[#2563eb] ring-4 ring-blue-500/20 z-10 scale-[1.02]" 
                                                    : "bg-white/95 text-slate-900 border border-slate-200 hover:border-blue-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                                            }`}
                                        >
                                            <div>
                                                {/* Tag/Badge at the Top */}
                                                <div className="flex justify-between items-start mb-2.5">
                                                    <span className={`text-[11px] font-black tracking-wider px-3 py-1 rounded-full shadow-xs ${getPlanTagStyle(plan.name, plan.slotCount)}`}>
                                                        {plan.name}
                                                    </span>
                                                    {isBest && (
                                                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
                                                            ★ BEST
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Plan Header */}
                                                <div className="mb-2 text-left">
                                                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-slate-900 flex items-baseline gap-1">
                                                        {plan.slotCount}
                                                        <span className="text-base font-extrabold text-slate-500">구좌</span>
                                                    </h3>
                                                    <p className="text-xs font-bold mt-1 text-slate-500">{plan.target}</p>
                                                </div>

                                                {/* Price block */}
                                                <div className="pt-2 border-t border-slate-100">
                                                    <div className="text-left">
                                                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">기본 월 납입금</span>
                                                        <div className="flex items-baseline gap-0.5">
                                                            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                                                {plan.monthlyPayment.toLocaleString()}
                                                            </span>
                                                            <span className="text-xs font-bold text-slate-500">원 ~</span>
                                                        </div>
                                                    </div>

                                                    {/* 제휴카드 할인 가격 안내 박스 */}
                                                    <div className="mt-2 p-2.5 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-blue-50/90 border border-blue-200/80 rounded-xl text-left shadow-xs">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className="text-[10px] font-extrabold text-blue-700 flex items-center gap-1">
                                                                💳 제휴카드 적용 시
                                                            </span>
                                                            <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-xs">
                                                                -23,000원 할인
                                                            </span>
                                                        </div>
                                                        <div className="flex items-baseline justify-between pt-0.5">
                                                            <span className="text-[10px] font-bold text-slate-500">할인 적용가</span>
                                                            <div className="flex items-baseline gap-0.5">
                                                                <span className="text-lg sm:text-xl font-black text-blue-600">
                                                                    {discountedPrice.toLocaleString()}
                                                                </span>
                                                                <span className="text-xs font-bold text-blue-600">원 ~</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Details schedule card */}
                                                <div className="my-2.5 p-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold flex flex-col gap-1.5 text-left bg-slate-50 border border-slate-200/80 text-slate-600">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-400 font-medium">납입회차</span>
                                                        <span className="font-bold text-slate-800">{plan.paymentCount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                                                        <span className="text-slate-400 font-medium">거치기간</span>
                                                        <span className="font-bold text-slate-800">{plan.defermentPeriod}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                                                        <span className="text-slate-400 font-medium">만기회차</span>
                                                        <span className="font-black text-blue-600">{plan.maturityCount}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 플랜 카드 내부 제휴카드 신청 안내 */}
                                            <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                                                    <img 
                                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1787790972/11755_1_oaddqn.png" 
                                                        alt="BS렌탈 플러스 하나카드" 
                                                        className="w-11 h-auto object-contain shrink-0 drop-shadow-xs" 
                                                    />
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="text-[11px] font-black text-slate-900 truncate">BS렌탈 플러스 하나카드</p>
                                                        <p className="text-[10px] font-extrabold text-blue-600">최대 월 2.3만원 할인</p>
                                                        <p className="text-[9px] text-slate-400 truncate">30만↑ 1.3만 / 120만↑ 2.3만</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href="https://m.hanacard.co.kr/MKCDCM1000M.web?CD_PD_SEQ=11811"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full py-2 bg-[#0c2340] hover:bg-[#1a365d] text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                                >
                                                    <span>제휴카드 신청하기</span>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Next Arrow Button (Desktop & Mobile) */}
                            <button 
                                onClick={(e) => { 
                                    const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                    if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth; el.scrollBy({ left: w, behavior: 'smooth' }); }
                                }} 
                                className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-30 bg-slate-900/90 hover:bg-blue-600 text-white p-3 sm:p-3.5 rounded-full shadow-2xl border border-white/20 hover:border-blue-400 transition-all duration-300 focus:outline-none flex items-center justify-center active:scale-95" 
                                aria-label="다음 플랜 보기"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>
                    </div>
                </section>
                <section className="py-20 md:py-32 bg-slate-50 border-t border-slate-200" id="appliance-section">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-8 sm:mb-16 md:mb-24">
                            <span className="badge-primary mb-4 px-5 py-2">PREMIUM LINEUP</span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">스마트케어 가전 라인업</h2>
                            <p className="section-subtitle max-w-2xl mx-auto mb-8 sm:mb-16 text-gray-500 font-medium text-xs sm:text-base leading-snug">
                                <span className="block">라이프 스타일에 딱 맞는 최신 가전을 선택해 보세요.</span>
                                <span className="block">렌탈료 전액 지원으로 부담 없이 시작할 수 있습니다.</span>
                                <span className="block mt-2 text-xs md:text-sm text-gray-400 font-normal">
                                    (만기 후 익월 해약 시 또는 라이프서비스 사용 시)
                                </span>
                            </p>
                        </div>

                        {/* 프로모션 섹션 - 필터 위로 이동 */}
                        {promotionAppliances.length > 0 && (
                            <div className="mb-20 animate-fade-in text-left">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="bg-sono-primary text-white p-2.5 rounded-none shadow-lg shadow-sono-primary/20">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-sono-dark tracking-tight">이 달의 프로모션 안내</h3>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                                    {promotionAppliances.map((item, index) => {
                                        const promotion = activePromotions.find(p => p._id === item.promotionId);
                                        const promoStyle = getPromotionStyle(item.promotionId);
                                        return (
                                            <div
                                                key={`promo-${item._id}`}
                                                className={`group bg-white rounded-[40px] overflow-hidden border-2 flex flex-col h-full relative transition-all duration-500 ${promoStyle?.border || 'border-sono-primary/20 hover:border-sono-primary hover:shadow-[0_20px_60px_rgba(46,78,162,0.15)]'} ${promoStyle ? promoStyle.borderFull : ''}`}
                                            >

                                                {/* Promotion Tag (Top Left) - With Neon Effect */}
                                                <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
                                                    <span 
                                                        className={`text-white text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-none shadow-lg flex items-center gap-1 animate-neon-blink ${promoStyle?.tag || 'bg-sono-primary'}`}
                                                        style={{ '--neon-color': promoStyle?.glow } as React.CSSProperties}
                                                    >
                                                        <span className="animate-pulse">🔥</span> 프로모션
                                                    </span>
                                                </div>

                                                {/* Image Container */}
                                                <div className="aspect-square bg-[#f9fafb] p-4 md:p-10 flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors duration-500">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                                                    
                                                    {/* Promotion Gift Image (Bottom Right) */}
                                                    {promotion?.imageUrl && (
                                                        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-14 h-14 md:w-20 md:h-20 bg-white rounded-none shadow-xl overflow-hidden border-2 border-white group-hover:scale-110 transition-transform duration-500 z-10 flex items-center justify-center">
                                                            <img src={promotion.imageUrl} alt="사은품" className="w-full h-full object-contain p-1" />
                                                            <div className="absolute top-0 right-0 bg-sono-primary text-white text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">GIFT</div>
                                                        </div>
                                                    )}

                                                    {/* 프로모션 카드에도 구좌 표시 (우상단으로 이동) */}
                                                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                                                        <span className="bg-sono-dark/80 backdrop-blur-md text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-2.5 md:py-1.5 rounded-none shadow-lg">
                                                            {item.slotCount}구좌
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 md:p-8 flex-grow flex flex-col bg-sono-primary/5">
                                                    <div className="mb-3 md:mb-4">
                                                        <h4 className={`font-black text-[9px] md:text-xs mb-1 ${promoStyle?.text || 'text-sono-primary'}`}>[{promotion?.title || "특별 혜택"}]</h4>
                                                        <h3 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedProductNames(prev => {
                                                                    const next = new Set(prev);
                                                                    if (next.has(item.name)) next.delete(item.name);
                                                                    else next.add(item.name);
                                                                    return next;
                                                                });
                                                            }}
                                                            className={`text-sono-dark font-black text-xs md:text-base leading-tight tracking-tighter cursor-pointer transition-all ${expandedProductNames.has(item.name) ? "line-clamp-none" : "line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]"}`}
                                                        >
                                                            {item.name}
                                                        </h3>
                                                        <p className={`font-bold text-[9px] md:text-xs mt-1 md:mt-2 truncate underline decoration-sono-primary/30 uppercase ${promoStyle?.text || 'text-gray-500'}`}>{promotion?.period}</p>
                                                    </div>
                                                    
                                                    {/* Benefit Box with Blinking Effect */}
                                                    <div className={`backdrop-blur-sm rounded-none md:rounded-none p-3 md:p-4 border mb-2 animate-benefit-blink ${promoStyle?.benefit || 'bg-sono-primary/5 text-sono-primary border-sono-primary/10'}`}>
                                                        <p className="text-[10px] md:text-[11px] font-black leading-relaxed break-keep line-clamp-2 text-center">
                                                            {promotion?.description || "지금 바로 상담 신청하고 혜택을 확인하세요."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 필터 시스템 */}
                        <div className="flex flex-col gap-4 md:gap-6">
                            {/* 1. 요금제 상품 필터 */}
                            <div className="flex flex-wrap justify-center gap-2 pb-2 px-4 md:px-0">
                                <button
                                    onClick={() => { setSelectedPlanId(""); setSelectedCategory("전체"); }}
                                    className={`px-5 py-2.5 rounded-none font-black text-xs md:text-sm transition-all duration-300 border whitespace-nowrap shadow-xs ${selectedPlanId === ""
                                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                                        }`}
                                >
                                    전체 상품
                                </button>
                                {(smartCareProductsData || []).map((plan) => (
                                    <button
                                        key={plan._id}
                                        onClick={() => { setSelectedPlanId(plan._id); setSelectedCategory("전체"); }}
                                        className={`px-5 py-2.5 rounded-none font-black text-xs md:text-sm transition-all duration-300 border whitespace-nowrap shadow-xs ${selectedPlanId === plan._id
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                                            }`}
                                    >
                                        {plan.name}
                                    </button>
                                ))}
                            </div>

                            {/* 2. 카테고리 필터 */}
                            <div className="flex flex-nowrap md:justify-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                                {availableCategories.length > 0 && ["전체", ...availableCategories].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-none border text-xs md:text-sm font-black whitespace-nowrap transition-all shadow-xs ${selectedCategory === cat
                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 표시 가전 개수 요약 카운터 바 */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 my-4 sm:my-6 px-1 border-b border-slate-200/80 pb-3 sm:pb-4">
                            {/* 타이틀 및 개수 배지 */}
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
                                <h3 className="text-sm sm:text-base font-black text-slate-900 whitespace-nowrap">
                                    {selectedCategory === "전체" ? "전체 가전" : `${selectedCategory}`} 목록
                                </h3>
                                <span className="text-[11px] sm:text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-200/80 px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                                    총 {displayAppliances.length.toLocaleString()}개
                                </span>
                            </div>

                            {/* 우측 라인업 정보 & 업데이트 날짜 */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 whitespace-nowrap">
                                {selectedPlanId !== "" && (
                                    <span className="text-[11px] sm:text-xs font-bold text-slate-400 truncate max-w-[140px] sm:max-w-none">
                                        {smartCareProductsData?.find(cp => cp._id === selectedPlanId)?.name || `${filteredAppliances[0]?.slotCount || 4}구좌`} 전용
                                    </span>
                                )}
                                {(() => {
                                    let dateStr: string | undefined = undefined;
                                    if (selectedPlanId) {
                                        const plan = smartCareProductsData?.find(cp => cp._id === selectedPlanId);
                                        dateStr = plan?.lastSyncedAt || plan?.updatedAt;
                                    } else {
                                        const dates = (smartCareProductsData || [])
                                            .map(p => p.lastSyncedAt || p.updatedAt)
                                            .filter((d): d is string => !!d)
                                            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                                        if (dates.length > 0) dateStr = dates[0];
                                    }

                                    if (!dateStr) return null;

                                    try {
                                        const d = new Date(dateStr);
                                        if (isNaN(d.getTime())) return null;
                                        const year = d.getFullYear();
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const day = String(d.getDate()).padStart(2, '0');
                                        const formattedDate = `${year}.${month}.${day}`;

                                        return (
                                            <span className="inline-flex items-center gap-1.5 bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap shadow-2xs">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                                                <span className="font-mono">{formattedDate} 업데이트</span>
                                            </span>
                                        );
                                    } catch {
                                        return null;
                                    }
                                })()}
                            </div>
                        </div>

                        {isLoadingAppliances ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-4">
                                <div className="animate-spin w-10 h-10 border-[4px] border-sono-primary border-t-transparent rounded-none"></div>
                                <p className="text-gray-400 font-bold animate-pulse text-sm">최신 가전 데이터를 불러오고 있습니다...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mt-4">
                                {displayAppliances.map((item, index) => {
                                    const promoStyle = getPromotionStyle(item.promotionId);
                                    const promotion = activePromotions.find(p => p._id === item.promotionId);
                                    
                                    const isItemBest = !!item.isBest;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleApplianceClick(item as any)}
                                            className={`group bg-white rounded-none overflow-hidden border transition-all duration-300 flex flex-col h-full relative shadow-sm cursor-pointer ${
                                                isItemBest 
                                                    ? 'border-sono-gold/80 shadow-md ring-2 ring-sono-gold/30 hover:border-sono-gold' 
                                                    : (promoStyle?.border || 'border-gray-200 hover:border-sono-primary/50 hover:shadow-md')
                                            } ${promoStyle ? promoStyle.borderFull : ''}`}
                                        >
                                            {/* Promotion Tag (Top Left) */}
                                            {isItemBest ? (
                                                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                                                    <span className="bg-sono-gold text-sono-dark text-[8px] md:text-[10px] font-black px-2 py-1 rounded-none shadow flex items-center gap-1">
                                                        ★ 베스트
                                                    </span>
                                                </div>
                                            ) : item.promotionId ? (
                                                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                                                    <span 
                                                        className={`text-white text-[8px] md:text-[10px] font-black px-2 py-1 rounded-none shadow flex items-center gap-1 animate-neon-blink ${promoStyle?.tag || 'bg-sono-primary'}`}
                                                        style={{ '--neon-color': promoStyle?.glow } as React.CSSProperties}
                                                    >
                                                        <span className="animate-pulse">🔥</span> 프로모션
                                                    </span>
                                                </div>
                                            ) : item.hasGift ? (
                                                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                                                    <span className="bg-sono-gold text-white text-[8px] md:text-[10px] font-black px-2 py-1 rounded-none shadow flex items-center gap-1">
                                                        <span className="animate-pulse">🎁</span> 사은품
                                                    </span>
                                                </div>
                                            ) : null}
                                            
                                            {/* Slot Tag */}
                                            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                                                <span className="bg-sono-dark/80 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black px-2 py-1 rounded-none shadow">
                                                    {item.slotCount}구좌
                                                </span>
                                            </div>

                                            {/* Image Container (White Background) */}
                                            <div className="aspect-square bg-white p-2.5 md:p-6 flex items-center justify-center relative overflow-hidden transition-colors duration-300">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                                />
                                                
                                                {/* Promotion Gift Image (Bottom Right) */}
                                                {promotion?.imageUrl && (
                                                    <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 w-10 h-10 md:w-14 md:h-14 bg-white rounded-none shadow border border-gray-100 overflow-hidden z-10 flex items-center justify-center">
                                                        <img src={promotion.imageUrl} alt="사은품" className="w-full h-full object-contain p-0.5" />
                                                        <div className="absolute top-0 right-0 bg-sono-primary text-white text-[6px] md:text-[7px] font-black px-1 py-0.2 rounded-bl-sm">GIFT</div>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>

                                            {/* Content Area (Light Gray Background) */}
                                            <div className="p-3 md:p-5 flex-grow flex flex-col bg-[#f8fafc] border-t border-gray-100">
                                                <div className="mb-1.5 md:mb-2.5">
                                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest block mb-0.5 ${promoStyle?.text || 'text-sono-primary'}`}>{item.brand}</span>
                                                    <h3 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedProductNames(prev => {
                                                                const next = new Set(prev);
                                                                if (next.has(item.name)) next.delete(item.name);
                                                                else next.add(item.name);
                                                                return next;
                                                            });
                                                        }}
                                                        className={`text-sono-dark font-black text-xs md:text-sm leading-tight tracking-tight group-hover:text-sono-primary transition-all cursor-pointer ${expandedProductNames.has(item.name) ? "line-clamp-none" : "line-clamp-2 min-h-[1.75rem] md:min-h-[2.25rem]"}`}
                                                    >
                                                        {cleanProductName(item.name, item.brand)}
                                                    </h3>
                                                    <p className="text-gray-400 font-bold text-[9px] md:text-xs mt-0.5 md:mt-1 uppercase truncate">{item.model}</p>
                                                </div>

                                                {/* Benefit Box for Main List - Blinking Effect */}
                                                {promotion && (
                                                    <div className={`mt-2 p-2.5 rounded-none border animate-benefit-blink ${promoStyle?.benefit || 'bg-sono-primary/5 text-sono-primary border-sono-primary/10'}`}>
                                                        <p className="text-[9px] md:text-[10px] font-black leading-tight line-clamp-1">{promotion.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        </div>
                </section>

                {/* 전체 라인업 오버레이 (풀스크린) */}
                {showAllOverlay && (
                    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-fade-in-up">
                        {/* 상단 헤더 */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-10 px-6 py-4 md:py-6">
                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                <h2 className="text-xl md:text-2xl font-black text-sono-dark tracking-tighter">전체 가전 라인업</h2>
                                <button
                                    onClick={() => setShowAllOverlay(false)}
                                    className="flex items-center gap-2 text-[#8b95a1] hover:text-sono-dark font-bold text-sm md:text-base border border-gray-200 px-4 py-2 rounded-none transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    뒤로가기
                                </button>
                            </div>
                        </div>

                        {/* 본문 콘텐츠 */}
                        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 pb-40"> {/* pb-40 for fixed bar space */}
                            <div className="text-center mb-16">
                                <p className="text-sono-primary font-black text-sm uppercase tracking-widest mb-4">Product Catalog</p>
                                <h3 className="text-4xl md:text-5xl font-black text-sono-dark tracking-tighter leading-tight mb-10">
                                    원하시는 모든 가전을<br className="md:hidden" /> 한눈에 확인해보세요
                                </h3>

                                {/* 오버레이 전용 상품 필터 버튼 */}
                                <div className="flex bg-[#f2f4f6] p-1.5 rounded-none shadow-inner border border-gray-100 inline-flex flex-wrap gap-1">
                                    <button
                                        onClick={() => setSelectedPlanId("")}
                                        className={`px-4 md:px-6 py-3 rounded-none font-bold text-sm transition-all whitespace-nowrap ${selectedPlanId === ""
                                            ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20"
                                            : "text-[#8b95a1] hover:text-sono-dark"
                                            }`}
                                    >
                                        전체
                                    </button>
                                    {(smartCareProductsData || []).map((plan) => (
                                        <button
                                            key={plan._id}
                                            onClick={() => setSelectedPlanId(plan._id)}
                                            className={`px-4 md:px-6 py-3 rounded-none font-bold text-sm transition-all whitespace-nowrap ${selectedPlanId === plan._id
                                                ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20"
                                                : "text-[#8b95a1] hover:text-sono-dark"
                                                }`}
                                        >
                                            {plan.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-24">
                                {availableCategories.map((cat) => {
                                    const categoryItems = allAppliances.filter(a =>
                                        a.category === cat &&
                                        (selectedPlanId === "" 
                                            ? true 
                                            : (a.careProductId === selectedPlanId || 
                                               (!a.careProductId && a.slotCount === smartCareProductsData?.find(cp => cp._id === selectedPlanId)?.slotCount)))
                                    );

                                    if (categoryItems.length === 0) return null;

                                    return (
                                        <div key={cat} className="animate-fade-in">
                                            <div className="flex items-center gap-4 mb-10">
                                                <h4 className="text-2xl md:text-3xl font-black text-sono-dark tracking-tight">{cat}</h4>
                                                <div className="h-0.5 flex-grow bg-gray-100 rounded-none"></div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                                                {categoryItems.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleApplianceClick(item)}
                                                        className={`group flex flex-col text-left transition-all duration-300 ${pickedAppliance?.name === item.name && pickedAppliance?.model === item.model ? "scale-105" : ""}`}
                                                    >
                                                        <div className={`relative pt-[100%] rounded-none overflow-hidden bg-[#f9fafb] border transition-all ${
                                                            pickedAppliance?.name === item.name && pickedAppliance?.model === item.model 
                                                                ? "border-sono-primary ring-4 ring-sono-primary/20 shadow-xl" 
                                                                : (item.isBest 
                                                                    ? "border-sono-gold/60 shadow-[0_4px_20px_rgba(254,220,64,0.1)] hover:border-sono-gold" 
                                                                    : "border-gray-50 group-hover:border-sono-primary/30")
                                                        }`}>
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-none border border-gray-100">
                                                                {item.slotCount}구좌
                                                            </div>
                                                            {item.isBest && (
                                                                <div className="absolute top-3 right-3 bg-sono-gold text-sono-dark text-[8px] font-black px-2 py-0.5 rounded shadow z-10 animate-pulse">
                                                                    ★ 베스트
                                                                </div>
                                                            )}
                                                            {pickedAppliance?.name === item.name && pickedAppliance?.model === item.model && (
                                                                <div className="absolute inset-0 bg-sono-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                                                                    <div className="bg-sono-primary text-white rounded-none p-2 shadow-lg">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-4 px-2">
                                                            <p className="text-[10px] font-bold text-[#8b95a1] mb-1 uppercase">{item.brand}</p>
                                                            <h5 className={`text-sm md:text-base font-extrabold leading-snug transition-colors mb-1 ${pickedAppliance?.name === item.name && pickedAppliance?.model === item.model ? "text-sono-primary" : "text-sono-dark group-hover:text-sono-primary"}`}>{item.name}</h5>
                                                            <p className="text-[10px] md:text-sm font-bold text-[#6b7684] uppercase">{item.model}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}




                {/* 상조 서비스 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="bg-slate-900 text-white font-black text-xs px-4 py-2 rounded-none mb-6 inline-block uppercase tracking-wider">FUNERAL SERVICE</span>
                            <h2 className="section-title leading-tight">품격 있는 마지막 인사,<br className="md:hidden" /> 대명소노가 함께합니다</h2>
                            <p className="section-subtitle max-w-2xl mx-auto">
                                국가공인 장례지도사와 전문 도우미가 정성을 다해
                                고인의 명복을 빌며, 유가족의 슬픔을 함께 나누는 신뢰의 서비스를 약속드립니다.
                            </p>
                        </div>

                        <div className="relative group md:block"><button onClick={(e) => { const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 32 : el.clientWidth; el.scrollBy({ left: -w, behavior: 'smooth' }); }}} className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none md:hidden" aria-label="Previous"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button><div style={{ scrollSnapType: 'x mandatory' }} className="flex w-full overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-6 pb-6 md:pt-6 md:pb-0 px-0 md:px-0 scroll-px-0 md:scroll-px-0 gap-8 md:gap-10 mb-20 md:mb-32">
                            {[
                                {
                                    title: "정성을 다하는 서비스",
                                    desc: "고인을 위한 관과 수의를 정직하게 정성을 다합니다.",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932612/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_09_20_03_1_1_uk04ro.png"
                                },
                                {
                                    title: "고객님을 위로하는 마음",
                                    desc: "전문 장례지도사가 모든 예법주관부터 행정업무까지 편리하게 지원합니다.",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932613/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_09_20_04_2_1_dqziit.png"
                                },
                                {
                                    title: "전문가의 따뜻한 손길",
                                    desc: "필요한 장의용품부터 고인 전용 차량까지 모두 제공합니다.",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932608/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_09_20_04_3_1_whaflz.png"
                                },
                            ].map((item, index) => (
                                <div key={index} style={{ scrollSnapStop: 'always' }} className="flex flex-col text-center group snap-center snap-always [scroll-snap-stop:always] shrink-0 w-full md:w-auto">
                                    <div className="relative aspect-[4/3] rounded-none overflow-hidden bg-gray-100 mb-6 md:mb-10 shadow-sm transition-all duration-500 hover:shadow-2xl">
                                        {item.img ? (
                                            <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#8b95a1] font-bold">이미지 준비중</div>
                                        )}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-sono-dark mb-3 md:mb-4 tracking-tight group-hover:text-sono-primary transition-colors leading-tight">{item.title}</h3>
                                    <p className="text-[#6b7684] text-sm md:text-lg font-medium leading-relaxed break-keep px-4">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* 소노아임레디 상조 서비스만의 특별함 (1x3 이미지/텍스트 박스 형태) */}
<button onClick={(e) => { const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 32 : el.clientWidth; el.scrollBy({ left: w, behavior: 'smooth' }); }}} className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none md:hidden" aria-label="Next"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button></div>                        <div className="w-full animate-fade-in mt-16">
                            <div className="relative bg-slate-900 text-white py-5 px-6 rounded-none mb-10 shadow-md w-full">
                                <h3 className="text-amber-300 text-lg md:text-2xl font-black text-center tracking-tight">
                                    ★ 소노아임레디 상조 서비스만의 시그니처 특별함
                                </h3>
                            </div>

                            <div className="flex flex-col gap-6">
                                {[
                                    {
                                        title: "처음부터 끝까지",
                                        desc: "장례지도사는 1건의 장례가 끝날 때까지 책임지고 함께합니다. 24시간 긴급의전센터(1588-2227)를 운영하며 접수 시 전문 장례지도사가 2시간 이내 현장에 도착하여 도와드립니다.",
                                        sub: "*도서 및 산간지역 제외, 상황에 따라 출동시간은 변동될 수 있음",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785933208/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_09_20_04_4_1_webcz3.png"
                                    },
                                    {
                                        title: "전문가와 같이",
                                        desc: "고객 만족도 99%*의 전문 장례지도사가 장례물품 준비부터 장례 진행, 행정 절차까지 유가족이 큰 어려움 없이 마무리할 수 있도록 곁에서 세심하게 관리해 드립니다.",
                                        sub: "*2026년 기준",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932614/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_09_20_04_5_1_illnk5.png"
                                    },
                                    {
                                        title: "용품 보증 시스템",
                                        desc: "규격용품보다 하위용품은 사용하지 않습니다. 소노아임레디만의 디자인 특허 고깔, 대마 100% 수의 등 빠짐없이 정직하게 준비해 드립니다.",
                                        sub: "*고깔: 디자인등록증 제 30-1110105호/수의: 2024년 1월 fiti 직물테스트 기준 *1년 단위 주기 테스트 진행",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932613/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_09_20_04_6_1_slqmry.png"
                                    }
                                ].map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white border border-slate-200 rounded-none overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group text-left h-auto"
                                    >
                                        {/* 좌측 이미지 영역 */}
                                        <div className="w-full md:w-[240px] lg:w-[280px] h-48 md:h-auto shrink-0 overflow-hidden bg-slate-900 relative">
                                            <img 
                                                src={item.img} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                                        </div>

                                        {/* 우측 내용 영역 */}
                                        <div className="p-6 md:p-8 flex flex-col flex-grow justify-between min-w-0">
                                            <div>
                                                <h4 className="text-[#191f28] text-lg sm:text-xl font-black mb-3 tracking-tight group-hover:text-sono-primary transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-slate-700 font-bold text-sm sm:text-base leading-relaxed break-keep mb-4">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <p className="text-slate-400 text-[10px] sm:text-xs leading-normal font-semibold break-keep border-t border-slate-100 pt-3">
                                                {item.sub}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>


                {/* 의전 서비스 상세 구성 (스마트케어 4 / 스마트케어 5 탭 분기) */}
                <section className="py-16 md:py-24 bg-slate-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
                        <div className="text-center mb-8">
                            <span className="bg-slate-900 text-white font-black text-xs px-4 py-2 rounded-none mb-3 inline-block uppercase tracking-wider">SERVICE DETAILS</span>
                            <h2 className="section-title">스마트케어 상조 서비스 상세 구성</h2>
                            <p className="text-slate-500 font-medium text-sm md:text-base mt-2">
                                플랜별 맞춤 상조 의전 서비스 구성을 확인해보세요
                            </p>
                        </div>

                        {/* 플랜 전환 탭 */}
                        <div className="flex justify-center mb-10">
                            <div className="inline-flex bg-slate-200/90 p-1.5 rounded-xl border border-slate-300 shadow-inner">
                                <button
                                    onClick={() => setFuneralPlanTab("smartcare5")}
                                    className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-black text-sm sm:text-base transition-all duration-200 ${
                                        funeralPlanTab === "smartcare5"
                                            ? "bg-[#0c2340] text-white shadow-md"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    스마트케어 5 <span className="text-[11px] font-normal opacity-80">(추천)</span>
                                </button>
                                <button
                                    onClick={() => setFuneralPlanTab("smartcare4")}
                                    className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-black text-sm sm:text-base transition-all duration-200 ${
                                        funeralPlanTab === "smartcare4"
                                            ? "bg-[#0c2340] text-white shadow-md"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    스마트케어 4
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {/* 고인용품 및 수시용품 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800 flex justify-between items-center">
                                        <span>고인용품 및 수시용품</span>
                                        <span className="text-[11px] font-semibold text-blue-300">
                                            {funeralPlanTab === "smartcare5" ? "스마트케어 5" : "스마트케어 4"}
                                        </span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">관</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                <p>오동나무 45mm <span className="text-slate-400 text-xs">(매장시)</span></p>
                                                <p>오동나무 18mm, 유골함 <span className="text-slate-400 text-xs">(화장시)</span></p>
                                                <p>오동나무 18mm, 횡대 <span className="text-slate-400 text-xs">(탈관시)</span></p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">수의</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                {funeralPlanTab === "smartcare5" ? (
                                                    <p className="font-bold text-blue-900">대마 100%, 기계직</p>
                                                ) : (
                                                    <p className="font-bold text-slate-800">마혼용 (대마, 아마, 저마), 기계직</p>
                                                )}
                                                <p className="text-[#8b95a1] text-[11px] mt-0.5 font-normal">수의 준비 시: 꽃관보 또는 장례도우미 1명 (택1)</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">입관/수시용품</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                <p>도포, 원삼, 천금, 지금 <span className="text-slate-400 text-xs">(수의와 동일)</span></p>
                                                <p>명정, 관보, 베개, 습신, 수시포, 한지 등 <span className="text-slate-400 text-xs">(규격품)</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 빈소 및 기타용품 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800">
                                        빈소 및 기타용품
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">빈소용품</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                <p>향, 양초, 부의록, 축문, 위패</p>
                                                <p className="font-bold text-emerald-600">일체 제공</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">대여용품</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                <p>향로, 촛대, 잔대</p>
                                                <p className="font-bold text-emerald-600">일체 대여 제공</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">기타용품</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                <p>완장, 상장, 운구장갑</p>
                                                <p className="font-bold text-emerald-600">필요량 일체 제공</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 의전용품 (상복) */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800 flex justify-between items-center">
                                        <span>의전용품 (상복)</span>
                                        <span className="text-[11px] font-semibold text-blue-300">
                                            {funeralPlanTab === "smartcare5" ? "스마트케어 5" : "스마트케어 4"}
                                        </span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">현대식 상복</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                {funeralPlanTab === "smartcare5" ? (
                                                    <>
                                                        <p>남성: <strong className="text-blue-900">제공 (10벌)</strong></p>
                                                        <p>여성: <strong className="text-blue-900">직계제공</strong></p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>남성: <strong className="text-slate-800">제공 (5벌)</strong></p>
                                                        <p>여성: <strong className="text-slate-800">제공 (5벌)</strong></p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">전통식 상복</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                <p>남성: 직계 제공</p>
                                                <p>여성: 필요량 제공</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 제단장식 (꽃장식) */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800 flex justify-between items-center">
                                        <span>제단장식 (꽃장식)</span>
                                        <span className="text-[11px] font-semibold text-blue-300">
                                            {funeralPlanTab === "smartcare5" ? "스마트케어 5" : "스마트케어 4"}
                                        </span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">생화꽃 액자</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                                제공
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">생화꽃 제단장식</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                                {funeralPlanTab === "smartcare5" ? (
                                                    <span className="font-bold text-blue-900">35만원 상당</span>
                                                ) : (
                                                    <span className="font-bold text-slate-800">25만원 상당</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">헌화용 국화</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                                {funeralPlanTab === "smartcare5" ? (
                                                    <span className="font-bold text-blue-900">50송이</span>
                                                ) : (
                                                    <span className="font-bold text-slate-800">30송이</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">꽃바구니</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                                꽃바구니 2개
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 차량지원 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800 flex justify-between items-center">
                                        <span>차량지원</span>
                                        <span className="text-[11px] font-semibold text-blue-300">
                                            {funeralPlanTab === "smartcare5" ? "스마트케어 5" : "스마트케어 4"}
                                        </span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">운구이송차량</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                                관내(시,군내) 제공 <span className="text-slate-400 text-xs">(요청 시)</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">고인전용 리무진</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                {funeralPlanTab === "smartcare5" ? (
                                                    <p className="font-bold text-blue-900">왕복 300KM</p>
                                                ) : (
                                                    <p className="font-bold text-slate-800">왕복 200KM</p>
                                                )}
                                                <p className="text-slate-400 text-[11px] font-normal">(초과시 2,000원 / KM)</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">유족전용 버스</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                {funeralPlanTab === "smartcare5" ? (
                                                    <p className="font-bold text-blue-900">왕복 300KM</p>
                                                ) : (
                                                    <p className="font-bold text-slate-800">왕복 200KM</p>
                                                )}
                                                <p className="text-slate-400 text-[11px] font-normal">(초과시 2,000원 / KM)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 인력지원 & 편의서비스 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800 flex justify-between items-center">
                                        <span>인력지원 & 편의서비스</span>
                                        <span className="text-[11px] font-semibold text-blue-300">
                                            {funeralPlanTab === "smartcare5" ? "스마트케어 5" : "스마트케어 4"}
                                        </span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">장례지도사</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                                장례진행 <span className="font-bold text-[#11326c]">1명</span>, 입관지원 <span className="font-bold text-[#11326c]">1명</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">장례의전 도우미</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                {funeralPlanTab === "smartcare5" ? (
                                                    <p><strong className="text-blue-900 text-base">5명</strong> (인당 10시간)</p>
                                                ) : (
                                                    <p><strong className="text-slate-800 text-base">4명</strong> (인당 10시간)</p>
                                                )}
                                                <p className="text-slate-400 text-[11px] font-normal">(접객 및 빈소 관리)</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                            <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">편의서비스</span>
                                            <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                                <p>일회용 식기세트: <strong className="text-slate-800">150인분</strong></p>
                                                <p>편의용품: <strong className="text-slate-800">(남/녀 6인세트) 1개</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-1">
                            <p className="text-left md:text-center text-[11px] text-[#8b95a1] font-medium">
                                ※ 상기 품목은 지역 및 장례식장 여건에 따라 동급의 타 제품으로 대체될 수 있습니다.
                            </p>
                            <p className="text-left md:text-center text-[11px] text-[#8b95a1] font-medium">
                                ※ 고객의 요청에 의해 품목을 추가하실 경우 별도의 비용이 발생할 수 있습니다.
                            </p>
                        </div>

                        {/* 24시간 긴급 장례 접수 안내 배너 */}
                        <div className="mt-12 bg-gradient-to-r from-[#2c0d12] via-[#0f172a] to-[#0f172a] border border-red-500/15 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden text-left">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex-grow">
                                <div className="inline-flex items-center gap-1.5 bg-red-600/10 text-red-400 border border-red-500/20 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full mb-4">
                                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>24시간 365일 연중무휴 긴급 상황실</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-3 tracking-tight break-keep">
                                    갑작스러운 임종 시 <span className="text-[#ff4d4f]">24시간 긴급 장례 접수</span>
                                </h3>
                                <p className="text-slate-400 text-xs sm:text-sm font-bold leading-relaxed mb-6 break-keep max-w-2xl">
                                    당황하지 마시고 바로 전화 주십시오. 국가공인 장례지도사가 즉시 현장으로 출동하여 수의, 관, 차량 및 식장 수급을 진정성 있게 케어합니다.
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] sm:text-xs font-bold text-slate-300">
                                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded">
                                        <span className="text-red-400">🛡️</span> 전국 소노 전문 장례식장 연계 우대
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded">
                                        <span className="text-red-400">👥</span> 지도사 2인 & 의전도우미 4인 밀착 케어
                                    </span>
                                </div>
                            </div>

                            <div className="w-full lg:w-72 shrink-0 bg-white/5 border border-white/10 rounded-xl p-5 text-center shadow-inner flex flex-col justify-center">
                                <div className="text-white/60 text-xs font-bold tracking-wide mb-1.5">24시간 긴급 장례 접수 전용</div>
                                <a href="tel:1588-2227" className="text-2xl sm:text-3xl font-black text-white hover:text-red-400 transition-colors tracking-widest block mb-4">1588-2227</a>
                                <a href="tel:1588-2227" className="flex items-center justify-center gap-2 bg-[#ff4d4f] hover:bg-[#e03f41] text-white font-black text-sm py-3 px-5 rounded-lg transition-all shadow-md">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2a1 1 0 00.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                                    </svg>
                                    <span>지금 긴급 출동 요청</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="py-16 md:py-32 bg-[#f9fafb] text-slate-900">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="flex items-center justify-between mb-12 border-b border-gray-200 pb-6">
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                전환(하이브리드) 서비스
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </h2>
                        </div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {[
                                { 
                                    title: "여유롭고 편안한 세계 여행", 
                                    subtitle: "내 멤버십 혜택으로 전 세계 어디든 스마트 한 여정",
                                    desc: "원하시는 해외/국내 패키지 여행부터 전용 맞춤 투어, 호텔 예약까지 내 납입금 한도 내에서 자유롭게 실시간 전환이 가능합니다.",
                                    key: "여행", 
                                    badge: "하이브리드 전환",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product01.jpg",
                                    features: [
                                        "글로벌 1위 여행사 연계 혜택 제공",
                                        "회원 전용 맞춤 개별 투어 설계",
                                        "납입금 한도 내 실시간 전환"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m-4-3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    )
                                },
                                { 
                                    title: "프리미엄 럭셔리 크루즈 여행", 
                                    subtitle: "지중해, 아시아, 알래스카 5성급 럭셔리 크루즈 혜택",
                                    desc: "평생 기억에 남을 최고급 크루즈 여행으로 전환하여 호화로운 선상 연회와 환상적인 휴양지를 편안하게 즐기실 수 있습니다.",
                                    key: "크루즈", 
                                    badge: "하이브리드 전환",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product09.jpg",
                                    features: [
                                        "5성급 대형 크루즈 전용 객실 지원",
                                        "전문 한국인 가이드 전담 동행",
                                        "선상 뷔페, 공연, 부대시설 풀패키지 포함"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    )
                                },
                                { 
                                    title: "VIP 골프 라운딩 투어", 
                                    subtitle: "국내외 명문 골프장 특별 라운딩 전환 혜택",
                                    desc: "명문 골프 클럽에서의 특별한 라운딩과 최고급 리조트 숙박이 연계된 명품 골프 투어 서비스입니다.",
                                    key: "골프", 
                                    badge: "하이브리드 전환",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product02.jpg",
                                    features: [
                                        "제휴 명문 CC 그린피 우대 지원",
                                        "명문 해외 골프장 맞춤형 투어 패키지",
                                        "동반자 우대 혜택 및 예약 지원"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.475 3.475 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.475 3.475 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.475 3.475 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.475 3.475 0 013.138-3.138z" />
                                        </svg>
                                    )
                                },
                                { 
                                    title: "어학연수 & 교육", 
                                    subtitle: "자녀 및 손자녀를 위한 해외 프리미엄 어학연수 전환",
                                    desc: "원어민 1:1 멘토링과 안전한 해외 전용 기숙 캠프 프로그램으로 최고의 글로벌 교육 기회를 스마트하게 매칭해 드립니다.",
                                    key: "교육/어학연수", 
                                    badge: "하이브리드 전환",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product04.jpg",
                                    features: [
                                        "해외 우수 교육 기관 전속 매칭",
                                        "24시간 안전 케어 및 밀착 관리 시스템",
                                        "연수 비용 100% 주계약금으로 대체"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    )
                                },
                                { 
                                    title: "로맨틱 웨딩 컨설팅", 
                                    subtitle: "웨딩홀, 드레스, 메이크업부터 완벽한 결혼식 연출",
                                    desc: "트렌디한 프리미엄 스튜디오, 브랜드 드레스, 메이크업 패키지와 제휴 홀 혜택을 결합하여 단 한 번뿐인 감동의 순간을 완성합니다.",
                                    key: "웨딩", 
                                    badge: "하이브리드 전환",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product06.jpg",
                                    features: [
                                        "트렌디 스튜디오 & 명품 드레스 제휴",
                                        "전문 웨딩 플래너 1:1 맞춤 컨설팅",
                                        "제휴 고급 웨딩홀 대관료 우대 할인"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )
                                },
                                { 
                                    title: "명품 라이프 & 쇼핑", 
                                    subtitle: "트렌디 가전부터 프리미엄 명품 쇼핑 혜택",
                                    desc: "일상의 품격을 높여주는 고급 브랜드 패션 컬렉션, 잡화 및 최신 스마트 홈 가전제품을 내 혜택 그대로 연계하여 스마트하게 구매 가능합니다.",
                                    key: "쇼핑", 
                                    badge: "하이브리드 전환",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product10.jpg?raw=true",
                                    features: [
                                        "정품 인증 브랜드 라이프스타일 컬렉션",
                                        "최신 가전 트렌드 상시 라인업 구축",
                                        "안전한 택배 배송 및 신속 교환 보장"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    )
                                },
                                { 
                                    title: "스마트 홈 리빙 컨시어지", 
                                    subtitle: "현대리바트 가구 및 프리미엄 이사 서비스 전환",
                                    desc: "명품 이사 서비스인 통인익스프레스 이사 컨시어지와 함께 현대리바트의 거실, 주방, 침실, 키즈 가구 패키지를 아임레디 혜택으로 자유롭게 이용 가능합니다.",
                                    key: "리빙", 
                                    badge: "하이브리드 전환",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product07.jpg",
                                    features: [
                                        "현대리바트 거실/주방/침실/키즈 가구 패키지",
                                        "통인익스프레스 이사 및 입주 청소 지원",
                                        "이사/정리수납 전문 리빙 토탈 컨시어지 지원"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    )
                                },
                                { 
                                    title: "토탈 헬스 & 쉼케어", 
                                    subtitle: "검진부터 홈케어까지 아우르는 웰니스 혜택",
                                    desc: "건강한 삶의 동반자로서 종합 건강검진 우대 혜택부터 전문 케어 코디네이터 연계, 살균 및 소독 청소 홈케어까지 맞춤 제공합니다.",
                                    key: "쉼케어", 
                                    badge: "하이브리드 전환",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product08.jpg?raw=true",
                                    features: [
                                        "전국 종합 검진 센터 회원 특별 우대",
                                        "전문 교육 홈케어 살균/방역 서비스",
                                        "시니어 요양 및 전문 간병 매칭 지원"
                                    ],
                                    icon: (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    )
                                }
                            ].map((item, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setSelectedHybrid(item.key)}
                                    className="bg-white rounded border border-slate-200/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                                        <img 
                                            src={item.img} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        />
                                        {/* 좌측 상단 아이콘 뱃지 */}
                                        <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-amber-400 z-10 shadow-md">
                                            {item.icon}
                                        </div>
                                        {/* 우측 하단 텍스트 뱃지 */}
                                        <span className="absolute bottom-3 right-3 bg-slate-950/65 backdrop-blur-[2px] text-white text-[10px] font-black px-2.5 py-1 rounded">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow text-left">
                                        <h3 className="font-black text-slate-900 text-lg md:text-xl mb-1 tracking-tight leading-tight group-hover:text-sono-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-400 text-[11px] font-bold mb-3 tracking-tight">
                                            {item.subtitle}
                                        </p>
                                        <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mb-5 min-h-[40px] line-clamp-2">
                                            {item.desc}
                                        </p>
                                        {/* 특장점 체크 리스트 */}
                                        <ul className="space-y-2.5 border-t border-slate-100 pt-4 mb-6 flex-grow">
                                            {item.features.map((feature, fi) => (
                                                <li key={fi} className="flex items-start gap-2 text-xs text-slate-600 font-bold leading-normal">
                                                    <span className="text-sono-primary font-black text-xs leading-none">✓</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {/* 자세히 보기 CTA 버튼 */}
                                        <button 
                                            className="w-full border border-slate-200 rounded py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sono-primary hover:border-sono-primary/40 flex justify-between items-center transition-all mt-auto group/btn"
                                        >
                                            <span>자세히 보기</span>
                                            <svg className="w-4 h-4 text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-sono-primary transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* 소노그룹 멤버십 (밝은 연그레이 배경 + 6대 제휴사 카드 그리드 스타일 + 리조트 예약방법 안내박스 + 하단 대형 단일 버튼) */}
                <section id="membership-benefits" className="py-20 md:py-32 bg-slate-50 border-t border-slate-200/60 text-slate-900 relative text-left">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        {/* 헤더 영역 */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 md:mb-24 pb-8 border-b border-slate-200">
                            <div>
                                <span className="bg-amber-500/10 text-amber-600 text-xs font-black px-4 py-2 uppercase tracking-wider mb-4 inline-block border border-amber-500/20">
                                    SONO MEMBER MEMBERSHIP
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tighter break-keep">
                                    가입 후 회원 정상 유지기간 내 맘껏 누리는<br className="hidden md:inline" /> 소노아임레디 멤버십
                                </h2>
                                <ul className="space-y-2 text-slate-600 text-sm font-bold">
                                    <li className="flex items-center gap-2">
                                        <span className="text-amber-500">•</span>
                                        <span>행사(장례/전환) 시 가입일로부터 5년간 제공</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-amber-500">•</span>
                                        <span>멤버십 서비스는 당사 및 제휴사의 사정에 따라 축소 및 확대, 변경될 수 있습니다.</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* 우측 프리미엄 아임레디 멤버십 카드 Mockup */}
                            <div className="w-full sm:w-64 h-40 rounded-2xl bg-gradient-to-br from-[#0c2340] to-[#1d3557] text-white p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/10 shrink-0 self-center lg:self-auto">
                                <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/5 rounded-full blur-xl"></div>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-black tracking-widest text-[#d97706]">I'm Ready</span>
                                    <span className="text-[10px] text-white/40 font-bold uppercase">Membership</span>
                                </div>
                                <div className="text-xs font-mono tracking-widest text-white/50 my-2">
                                    •••• •••• •••• 4500
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-[9px] font-bold text-white/30 tracking-wider">SONO MEMBER CARD</div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-white/80"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6대 멤버십 제휴 혜택 격자 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    badge: "리조트/호텔",
                                    highlight: "객실 정가 대비 최대 70% 할인",
                                    partner: "소노호텔앤리조트 (구 대명리조트)",
                                    title: "전국 소노호텔앤리조트 객실 우대",
                                    subtitle: "쏠비치, 소노펠리체, 소노캄 등 전국 18개 리조트 회원 가격 혜택",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913144/benefit_list_bg01_ouicgo.jpg",
                                    target: "회원 본인에 한해 이용 가능 (연 10박 제한, 양도 불가)",
                                    method: "컨택센터(1588-8511) 또는 홈페이지 하단 [리조트 예약] 후 비수기 주중 이용",
                                    period: "가입 시점부터 만기 시까지 비수기 주중 적용",
                                    details: [
                                        "호텔 [패밀리 / 슈페리어] 객실 할인: 비수기 주중 이용 시 무기명 회원가 + 1만원 (일~목요일) / + 2만원 (금요일)",
                                        "리조트 [패밀리 / 스위트] 객실 할인: 비수기 주중 이용 시 무기명 회원가 + 1만원 (일~목요일) / + 2만원 (금요일)"
                                    ],
                                    note: "※ 리조트 사용의 경우 연 10박으로 제한되며, 회원 본인에 한해서만 이용이 가능합니다.\n※ 예약방법 : 당사 컨택센터(1588-8511) 또는 홈페이지 하단의 [리조트 예약] > 소노호텔앤리조트(구 대명리조트) 홈페이지를 통해 잔여 객실 확인 후 비수기 주중 객실만 예약 가능합니다.\n※ 리조트 객실 이용은 관련 법령에 의한 리조트 정회원 우선 예약 제도에 따라 이용이 제한될 수 있으며, 리조트 상황에 따라 객실은 조기 마감될 수 있습니다.\n※ 성수기 안내 : 여름 성수기 (7월 중순 ~ 8월 말), 겨울 성수기 (12월 중순 ~ 1월 말), 연휴, 휴일 전 일, 토요일은 예약이 제외됩니다.\n※ 현장에서 모바일 멤버십 카드 및 신분증 지참 필수 (미지참 시 우대 혜택 적용 제외)"
                                },
                                {
                                    badge: "오션월드/워터파크",
                                    highlight: "본인 및 동반 1인 최대 50% 할인",
                                    partner: "비발디파크 오션월드",
                                    title: "오션월드 & 워터파크 4계절 할인",
                                    subtitle: "비발디파크 오션월드 및 전국 소노 아쿠아월드 할인 우대",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913537/benefit_list_bg02_wa1jzf.jpg",
                                    target: "본인 포함 2인 할인 적용 (양도 불가)",
                                    method: "매표소에서 소노아임레디 모바일 멤버십 바코드 제시",
                                    period: "연중 상시 적용 (전 시즌)",
                                    details: [
                                        "오션월드 / 오션어드벤처 할인 (최대 30% 우대 할인 혜택)",
                                        "오션플레이 할인 (최대 35% 우대 할인 혜택)"
                                    ],
                                    note: "※ 본인포함 2인, 연간 10회 이용 가능 (오션월드 / 오션어드벤처 / 오션플레이)\n※ 타 할인 쿠폰과 중복 적용은 불가합니다.\n※ 현장에서 멤버십 카드 제시 후 이용 가능합니다.\n※ 회원 본인 모바일 멤버십 카드, 신분증 지참 필수 (미지참 시, 우대 혜택이 적용되지 않습니다.)\n※ 멤버십 우대 혜택은 당사/제휴사의 사정 및 시즌에 따라 변동 될 수 있습니다.\n※ 소노호텔앤리조트 객실 예약은 투숙 예정일로부터 90일전부터 이용 가능합니다.\n※ 객실 이용 혜택은 소노아임레디와 제휴된 소노호텔앤리조트 사업장(호텔/리조트)에서 이용 가능하며, 사업장별 상황에 따라 확대 및 축소 될 수 있습니다."
                                },
                                {
                                    badge: "레저/부대시설",
                                    highlight: "그린피 및 사우나 10% 우대",
                                    partner: "비발디파크 레저 부대시설",
                                    title: "비발디파크 레저 부대시설 우대",
                                    subtitle: "골프 소노펠리체CC 그린피 및 전국 사우나 시설 할인 혜택",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913145/benefit_list_bg04_veb7an.jpg",
                                    target: "회원 본인 (사우나는 본인 포함 2인 적용)",
                                    method: "부대시설 결제 시 멤버십 바코드 또는 모바일 카드 제시",
                                    period: "연간 이용 횟수 한도 내 상시 적용",
                                    details: [
                                        "골프 소노펠리체CC 그린피 할인 (비발디파크 WEST / 델피노 CC 주중 그린피 10% 할인 - 회원본인, 연간 10회 이용 가능)",
                                        "소노호텔앤리조트 사우나 할인 (사우나 10% 우대 할인 - 소노캄 제주 35% 할인, 소노휴 양평 제외 - 본인포함 2인, 연간 10회 이용 가능)"
                                    ],
                                    note: "※ 현장에서 멤버십 카드 제시 후 이용 가능합니다.\n※ 회원 본인 모바일 멤버십 카드, 신분증 지참 필수 (미지참 시, 우대 혜택이 적용되지 않습니다.)\n※ 멤버십 우대 혜택은 당사/제휴사의 사정 및 시즌에 따라 변동 될 수 있습니다.\n※ 소노호텔앤리조트 객실 예약은 투숙 예정일로부터 90일전부터 이용 가능합니다.\n※ 객실 이용 혜택은 소노아임레디와 제휴된 소노호텔앤리조트 사업장(호텔/리조트)에서 이용 가능하며, 사업장별 상황에 따라 확대 및 축소 될 수 있습니다."
                                },
                                {
                                    badge: "스키/보드",
                                    highlight: "리프트 및 렌탈 최대 30% 할인",
                                    partner: "비발디파크 스키",
                                    title: "비발디파크 스키 & 스노우보드 할인",
                                    subtitle: "리프트 및 장비 렌탈 우대 할인 혜택",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913147/benefit_list_bg03_bmckql.jpg",
                                    target: "본인 포함 2인까지 할인 혜택 적용",
                                    method: "매표소에서 모바일 멤버십 카드 제시",
                                    period: "스키장 동계 시즌 운영 기간 내 상시 적용",
                                    details: [
                                        "비발디파크 스키 할인 (리프트 / 렌탈 최대 30% 우대 할인 혜택)"
                                    ],
                                    note: "※ 본인포함 2인, 연간 10회 이용 가능\n※ 현장에서 멤버십 카드 제시 후 이용 가능합니다.\n※ 회원 본인 모바일 멤버십 카드, 신분증 지참 필수 (미지참 시, 우대 혜택이 적용되지 않습니다.)\n※ 멤버십 우대 혜택은 당사/제휴사의 사정 및 시즌에 따라 변동 될 수 있습니다.\n※ 소노호텔앤리조트 객실 예약은 투숙 예정일로부터 90일전부터 이용 가능합니다.\n※ 객실 이용 혜택은 소노아임레디와 제휴된 소노호텔앤리조트 사업장(호텔/리조트)에서 이용 가능하며, 사업장별 상황에 따라 확대 및 축소 될 수 있습니다."
                                },
                                {
                                    badge: "헬스케어",
                                    highlight: "다이어트 등록 시 10% 추가 관리",
                                    partner: "쥬비스 다이어트",
                                    title: "쥬비스 다이어트 특별 우대 혜택",
                                    subtitle: "감량부터 요요 관리까지 완벽하게 케어하는 쥬비스 다이어트",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913158/fileView_qxl4nr.png",
                                    target: "소노아임레디 회원 본인 및 배우자, 직계가족",
                                    method: "소노아임레디 회원 전용 쥬비스 상담 페이지를 통한 등록",
                                    period: "가입 후 회원 유지 기간 내 횟수 제한 없이 제공",
                                    details: [
                                        "소노아임레디 회원 전용 다이어트 프로그램 10% 추가 관리",
                                        "전문 컨설턴트의 1:1 맞춤 감량 및 요요 방지 코칭",
                                        "무리한 식단조절 없이 영양 밸런스 기반 푸드 케어"
                                    ],
                                    note: "* 주의사항: 타 이벤트 및 제휴 혜택과 중복 적용은 불가합니다.\n※ 행사(장례/전환) 시에도 가입일로부터 5년간 멤버십 서비스를 제공합니다.\n※ 멤버십서비스는 당사 및 제휴사의 사정에 따라 축소 및 확대, 변경될 수 있습니다.\n※ 멤버십 카드는 1회차 납입 후부터 홈페이지에서 조회가 가능합니다.\n※ 이름/생년월일/핸드폰번호가 동일한 경우에만 확인 가능합니다. (상품 가입이 본인 명의가 아닐 경우 확인 불가)\n※ 제휴사 이용 시 카드 사용자 확인을 위해 신분증이 필요할 수 있습니다."
                                },
                                {
                                    badge: "여가/레저",
                                    highlight: "입장권 정상가 대비 2,000원 할인",
                                    partner: "삼양라운드힐",
                                    title: "삼양라운드힐(구 삼양목장) 입장권 할인",
                                    subtitle: "600만평 국내 최대의 유기초지목장, 푸른 초원에서의 힐링",
                                    img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913154/fileView_rhh44m.jpg",
                                    target: "회원 본인 및 동반 3인 적용 (총 4인 혜택)",
                                    method: "삼양라운드힐 매표소에서 모바일 멤버십 카드와 신분증 제시",
                                    period: "가입 후 회원 정상 유지기간 내 상시 적용",
                                    details: [
                                        "입장권 대인/소인 무조건 2,000원 우대 할인 제공",
                                        "동반 3인까지 동일하게 동일 2,000원 할인 혜택",
                                        "청정 대관령 풍력발전기 및 양떼 목장 힐링 투어"
                                    ],
                                    note: "* 주의사항: 모바일 멤버십 카드 미지참 시 우대 적용이 불가능합니다.\n※ 행사(장례/전환) 시에도 가입일로부터 5년간 멤버십 서비스를 제공합니다.\n※ 멤버십서비스는 당사 및 제휴사의 사정에 따라 축소 및 확대, 변경될 수 있습니다.\n※ 멤버십 카드는 1회차 납입 후부터 홈페이지에서 조회가 가능합니다.\n※ 이름/생년월일/핸드폰번호가 동일한 경우에만 확인 가능합니다. (상품 가입이 본인 명의가 아닐 경우 확인 불가)\n※ 제휴사 이용 시 카드 사용자 확인을 위해 신분증이 필요할 수 있습니다."
                                }
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col bg-white overflow-hidden shadow-lg border border-slate-200 hover:-translate-y-1.5 transition-all duration-300 group">
                                    <div className="aspect-[16/10] overflow-hidden relative">
                                        <span className="absolute top-4 left-4 bg-slate-900/80 text-white text-[10px] font-extrabold px-2.5 py-1 z-10">
                                            {item.badge}
                                        </span>
                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-all duration-500" />
                                    </div>
                                    <div className="p-6 text-left flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span>제휴사: {item.partner}</span>
                                            </div>
                                            <h3 className="font-black text-slate-900 text-lg md:text-xl mb-1.5 leading-snug group-hover:text-sono-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-500 text-xs font-semibold mb-4 leading-relaxed break-keep">
                                                {item.subtitle}
                                            </p>
                                            
                                            {/* 이용 정보 가이드 박스 */}
                                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg text-left text-xs space-y-2 mb-4 font-semibold text-slate-600">
                                                <div className="flex flex-col sm:flex-row sm:items-start">
                                                    <span className="text-slate-900 font-bold sm:w-20 shrink-0">이용 대상</span>
                                                    <span>{item.target}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-start">
                                                    <span className="text-slate-900 font-bold sm:w-20 shrink-0">이용 방법</span>
                                                    <span className="break-keep">{item.method}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-start">
                                                    <span className="text-slate-900 font-bold sm:w-20 shrink-0">이용 기간</span>
                                                    <span>{item.period}</span>
                                                </div>
                                            </div>

                                            {/* 제휴 혜택 상세 */}
                                            <div className="text-left space-y-1.5 mb-5">
                                                <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">제휴 혜택 상세</div>
                                                {item.details.map((detail, dIdx) => (
                                                    <div key={dIdx} className="flex items-start gap-2 text-xs font-bold text-slate-600 break-keep">
                                                        <span className="text-emerald-500">✓</span>
                                                        <span>{detail}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-slate-400 text-[10px] font-semibold text-left mb-2 leading-relaxed whitespace-pre-line break-keep border-t border-slate-100 pt-3">
                                                {item.note}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 리조트 예약 방법 안내 박스 */}
                        <div className="mt-20 pt-16 border-t border-slate-200">
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">리조트 예약 방법</h3>
                            <p className="text-slate-600 text-xs sm:text-sm font-bold leading-relaxed break-keep mb-8">
                                소노호텔앤리조트 회원가입 및 개인정보 동의가 필요하며 객실요금 결제 시 예약이 완료됩니다.<br className="hidden md:inline" />
                                제휴사 사정에 따라 예약가능 리조트는 사전 고지 없이 변경됩니다.
                            </p>

                            <div className="relative group lg:block">
                                <button 
                                    onClick={(e) => { 
                                        const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                        if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth; el.scrollBy({ left: -w, behavior: 'smooth' }); }
                                    }} 
                                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none lg:hidden" 
                                    aria-label="Previous"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <div style={{ scrollSnapType: 'x mandatory' }} className="flex w-full overflow-x-auto lg:overflow-visible lg:grid lg:grid-cols-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-6 pb-6 lg:pt-6 lg:pb-0 px-0 lg:px-0 scroll-px-0 lg:scroll-px-0 gap-6">
                                    {[
                                        {
                                            step: "STEP 1",
                                            title: "소노아임레디 홈페이지 '개인정보 제공 동의하기' 동의 후 '소노호텔앤리조트 가기'",
                                            img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913594/reserve_step_01_x5sksh.jpg"
                                        },
                                        {
                                            step: "STEP 2",
                                            title: "소노호텔앤리조트 My SONO → MENU → 회원권 연동",
                                            img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913596/reserve_step_02_wk7wd2.jpg"
                                        },
                                        {
                                            step: "STEP 3",
                                            title: "라이프웨이 회원권 연동 클릭 후 연동",
                                            img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785913596/reserve_step_03_gjehmo.jpg"
                                        },
                                        {
                                            step: "STEP 4",
                                            title: "리조트 예약 및 결제",
                                            sub: "* 레디캐쉬로 결제 원할 시, 선 결제 후 리조트에서 결제수단 변경",
                                            img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785981110/reserve_step_04_eycfpo.jpg"
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ scrollSnapStop: 'always' }} className="bg-white border border-slate-200 p-5 shadow flex flex-col justify-between snap-center snap-always [scroll-snap-stop:always] shrink-0 w-full lg:w-auto">
                                            <div>
                                                <div className="aspect-square w-[70%] mx-auto overflow-hidden mb-4 shadow-sm bg-slate-100 rounded-lg">
                                                    <img src={item.img} alt={item.step} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="text-xs font-black text-sono-primary mb-1.5 tracking-wider">{item.step}</div>
                                                <p className="text-slate-800 text-xs sm:text-sm font-bold leading-relaxed break-keep">{item.title}</p>
                                            </div>
                                            {item.sub && (
                                                <div className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2 text-left leading-relaxed break-keep">
                                                    {item.sub}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={(e) => { 
                                        const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                        if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth; el.scrollBy({ left: w, behavior: 'smooth' }); }
                                    }} 
                                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none lg:hidden" 
                                    aria-label="Next"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 소노아임레디몰 (어두운 프리미엄 스타일) */}
                <section className="py-20 md:py-32 bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#020408] text-white border-t border-slate-900 relative overflow-hidden text-left">
                    {/* 은은한 그라데이션 빛 효과 */}
                    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-800 pb-8 gap-4">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter">소노아임레디몰</h2>
                                <p className="text-slate-400 text-sm md:text-xl font-bold">소노아임레디 회원을 위한 전용 프라이빗 쇼핑몰!</p>
                            </div>
                            <a href="https://www.imreadymall.com/" target="_blank" rel="noopener noreferrer" className="bg-[#c5a059] text-white font-black text-sm px-6 py-3 rounded-none hover:bg-[#b08b47] transition-all flex items-center gap-2 shrink-0 shadow-lg">
                                <span>소노아임레디몰 바로가기</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </a>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                            <div className="flex-1 w-full animate-fade-in">
                                <img 
                                    src="https://github.com/jihoon3813-commits/img_sono/blob/main/computer_main.png?raw=true" 
                                    alt="소노아임레디몰 메인" 
                                    className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-[1.02]"
                                />
                            </div>
                            
                            <div className="flex-1 w-full space-y-6 md:space-y-8">
                                {[
                                    {
                                        title: "매일 기다려지는 특가 상품과 이벤트",
                                        desc: "타임딜, 릴레이딜부터 룰렛 이벤트까지! 매일 새로운 상품과 이벤트가 쏟아집니다.",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h3.586a1 1 0 00.707-.293l12-12a1 1 0 000-1.414l-4.586-4.586a1 1 0 00-1.414 0l-12 12a1 1 0 00-.293.707V18a2 2 0 002 2z" />
                                    },
                                    {
                                        title: "신규 가입자 5,000원 쿠폰을!",
                                        desc: "신규 가입 고객에게만 제공되는 혜택을 받아보세요. 필요한 상품을 더 합리적인 가격으로 경험해 보세요!",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    },
                                    {
                                        title: "레디캐쉬로 연결되는 합리적인 소비",
                                        desc: "소노아임레디몰에서 레디캐쉬를 활용해 보세요! 구매 부담은 줄이고, 풍부한 혜택을 받아보세요!",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
                                    }
                                ].map((benefit, i) => (
                                    <div key={i} className="flex gap-6 md:gap-8 group border-b border-slate-800 pb-6 md:pb-8 last:border-none">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-none bg-slate-800 text-[#c5a059] flex items-center justify-center group-hover:bg-[#c5a059] group-hover:text-white transition-all duration-300 flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {benefit.icon}
                                            </svg>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h3 className="text-lg md:text-xl font-black text-white mb-1">{benefit.title}</h3>
                                            <p className="text-slate-400 text-xs md:text-sm font-bold leading-relaxed break-keep">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 레디캐시 안내 (샤프한 직각 사각형 스타일) */}
                <section className="py-16 md:py-24 bg-slate-200">
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 tracking-tight">레디캐시 안내</h3>
                        <ul className="space-y-4 md:space-y-6">
                            {[
                                "레디캐시는 회원님이 가입한 상품의 해약환급금 내에서 당사가 정한 기준 금액에 한 해 1원당 1캐시로 전환하여 사용 가능합니다.",
                                "레디캐시는 납입한 상품 금액에서 사용한 레디캐시 금액만큼 차감되며 상품 이용(장례 또는 전환 서비스) 시, 사용한 레디캐시 금액만큼 추가 금액이 발생합니다.",
                                "레디캐시의 환불은 취소 완료일로부터 3영업일 이내 사용한 레디캐시 금액만큼 환불됩니다.",
                                "제휴 상황에 따라 일부 서비스는 변동될 수 있습니다. 자세한 내용은 공식 홈페이지 제휴 서비스 페이지를 참고하시기 바랍니다.",
                                "고객님께서 가입한 상품에 따라 레디캐시 발생 시점 및 금액은 상이할 수 있습니다."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-4 text-xs md:text-base text-slate-700 font-bold leading-relaxed">
                                    <span className="flex-shrink-0 mt-2.5 w-1.5 h-1.5 bg-slate-900 rounded-none"></span>
                                    <p className="break-keep">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 중요 고지사항 */}
                <ImportantNotice />

                {/* CTA (샤프한 직각 사각형 스타일) */}
                <section className="py-20 md:py-32 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/5 to-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-10 tracking-tighter leading-tight">
                            최고의 혜택을 담은 스마트케어 상품을<br />지금 바로 만나보세요.
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 mb-10 md:mb-12 font-medium">
                            본 상품은 소노 아임레디와 제휴한 제휴사 회원에게만 제공하는 혜택이 포함되어 있습니다.
                        </p>
                        {partnerMode ? (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg md:text-xl px-12 py-5 rounded-none shadow-xl transition-all inline-block active:scale-95 duration-150"
                            >
                                {ctaText}
                            </button>
                        ) : (
                            <Link href="/partner/apply" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg md:text-xl px-12 py-5 rounded-none shadow-xl transition-all inline-block active:scale-95 duration-150">
                                {ctaText}
                            </Link>
                        )}
                    </div>
                </section>
            </main>

            {/* Sleek Floating Bottom Counseling Bar for both Mobile & PC (샤프한 직각 사각형 스타일) */}
            {!isModalOpen && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 py-3 px-4 sm:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-none bg-emerald-400"></span>
                            <span className="text-xs sm:text-sm font-bold text-slate-200">온라인 무료 상담 대기 중</span>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-base px-6 sm:px-8 py-3 rounded-none shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <span>⚡ 빠른 상담 신청하기</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 하이브리드 전환 서비스 모달 */}
            {selectedHybrid && (() => {
                const detail = hybridDetails[selectedHybrid];
                if (!detail) return null;
                return (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedHybrid(null)}>
                        <div 
                            className="relative bg-white text-slate-900 w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-6xl max-h-[92vh] sm:max-h-[90vh] rounded-none sm:rounded overflow-hidden shadow-2xl flex flex-col border border-gray-200 z-10 mx-auto my-auto min-w-0 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 모달 헤더 */}
                            <div className="bg-gray-50 border-b border-gray-200 px-3.5 sm:px-6 py-3 sm:py-4 flex justify-between items-center shrink-0 gap-2">
                                <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                                    <span className="bg-blue-50 text-blue-600 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded border border-blue-200 whitespace-nowrap shrink-0">
                                        {selectedHybrid} 하이브리드 전환
                                    </span>
                                    <span className="text-slate-500 text-[10px] sm:text-xs font-bold truncate">
                                        100% 가치 대체 서비스
                                    </span>
                                </div>
                                <button onClick={() => setSelectedHybrid(null)} className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-900 transition-colors shrink-0 cursor-pointer" aria-label="닫기">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* 모달 바디 (스크롤 가능) */}
                            <div className="p-3.5 sm:p-6 md:p-10 space-y-6 sm:space-y-8 overflow-y-auto overflow-x-hidden no-scrollbar flex-grow bg-white box-border">
                                {/* 상단 비주얼 영역 */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">
                                    <div className="md:col-span-5 aspect-[4/3] rounded overflow-hidden bg-gray-100 border border-gray-200 w-full">
                                        <img src={detail.img} alt={detail.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="md:col-span-7 space-y-3.5 sm:space-y-5 text-left min-w-0">
                                        <span className="text-slate-500 text-xs md:text-sm font-bold block">{detail.subtitle}</span>
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight break-keep">{detail.title}</h3>
                                        <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed break-keep">{detail.desc}</p>
                                        
                                        <div className="bg-gray-50 border border-gray-250/60 p-3.5 sm:p-5 rounded space-y-2.5 sm:space-y-3">
                                            <h4 className="text-sono-primary text-xs md:text-sm font-black tracking-wider uppercase">주요 핵심 포함사항</h4>
                                            <ul className="space-y-2.5">
                                                {detail.highlights.map((hl, i) => (
                                                    <li key={i} className="flex items-center gap-2.5 text-xs md:text-sm font-bold text-slate-700">
                                                        <svg className="w-4 h-4 text-sono-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        {hl}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* 상세 가이드 테이블 */}
                                <div className="space-y-3.5 sm:space-y-4 text-left">
                                    <h4 className="font-black text-base sm:text-lg text-slate-900">전환 서비스 이용 상세 가이드</h4>
                                    <div className="border border-gray-200 rounded overflow-hidden w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
                                            {/* 행 1 */}
                                            <div className="flex divide-x divide-gray-200 min-w-0">
                                                <div className="w-[90px] sm:w-[120px] shrink-0 bg-gray-50/70 px-2 sm:px-3 py-2.5 sm:p-4 font-bold text-[11px] sm:text-xs md:text-sm text-slate-500 flex items-center whitespace-nowrap">이용 가능 상품</div>
                                                <div className="flex-grow min-w-0 p-2.5 sm:p-4 text-xs md:text-sm font-medium text-slate-800 flex items-center break-words">{detail.guide.available}</div>
                                            </div>
                                            <div className="flex divide-x divide-gray-200 min-w-0">
                                                <div className="w-[90px] sm:w-[120px] shrink-0 bg-gray-50/70 px-2 sm:px-3 py-2.5 sm:p-4 font-bold text-[11px] sm:text-xs md:text-sm text-slate-500 flex items-center whitespace-nowrap">이용 조건</div>
                                                <div className="flex-grow min-w-0 p-2.5 sm:p-4 text-xs md:text-sm font-medium text-slate-800 flex items-center break-words">{detail.guide.conditions}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white border-t border-gray-200">
                                            {/* 행 2 */}
                                            <div className="flex divide-x divide-gray-200 min-w-0">
                                                <div className="w-[90px] sm:w-[120px] shrink-0 bg-gray-50/70 px-2 sm:px-3 py-2.5 sm:p-4 font-bold text-[11px] sm:text-xs md:text-sm text-slate-500 flex items-center whitespace-nowrap">추가 비용 안내</div>
                                                <div className="flex-grow min-w-0 p-2.5 sm:p-4 text-xs md:text-sm font-medium text-slate-800 flex items-center break-words">{detail.guide.fees}</div>
                                            </div>
                                            <div className="flex divide-x divide-gray-200 min-w-0">
                                                <div className="w-[90px] sm:w-[120px] shrink-0 bg-gray-50/70 px-2 sm:px-3 py-2.5 sm:p-4 font-bold text-[11px] sm:text-xs md:text-sm text-slate-500 flex items-center whitespace-nowrap">신청 방법</div>
                                                <div className="flex-grow min-w-0 p-2.5 sm:p-4 text-xs md:text-sm font-medium text-slate-800 flex items-center break-words">{detail.guide.method}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 안내 하단 바 */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <svg className="w-5 h-5 text-sono-primary shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.587 4.587l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                            <span>전환 전담 문의처: <strong>1833-6093</strong></span>
                                        </div>
                                        <a 
                                            href={selectedHybrid === "크루즈" ? "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" : "https://www.sonoimready.com"} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-sono-primary hover:text-indigo-600 font-bold flex items-center gap-1"
                                        >
                                            소노 공식 홈페이지 바로가기
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    </div>
                                </div>

                                {/* 전환 서비스 유의사항 */}
                                <div className="bg-amber-50 border border-amber-200/60 p-3 sm:p-4 rounded text-left flex items-start gap-2.5 sm:gap-3">
                                    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <div className="space-y-1 min-w-0">
                                        <h5 className="font-black text-amber-700 text-xs md:text-sm">전환 서비스 유의사항</h5>
                                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{detail.notes}</p>
                                    </div>
                                </div>

                                {/* 상세 상품 목록 (여행 및 크루즈 전용) */}
                                {isLoadingItems ? (
                                    <div className="space-y-6 text-center border-t border-gray-200 pt-8 py-12">
                                        <div className="animate-spin w-10 h-10 border-4 border-sono-primary border-t-transparent rounded-full mx-auto"></div>
                                        <p className="text-sm font-bold text-slate-500">실시간 전환 가능 상품을 소노 공식 사이트에서 불러오는 중입니다...</p>
                                    </div>
                                ) : hybridItems && hybridItems.length > 0 ? (() => {
                                    const filteredHybridItems = hybridItems.filter((subItem) => {
                                        if (hybridStatusFilter === "전체") return true;
                                        const isClosed = subItem.status && (subItem.status === "접수마감" || subItem.status === "마감" || subItem.status.includes("마감"));
                                        if (hybridStatusFilter === "접수마감") return isClosed;
                                        if (hybridStatusFilter === "접수중") return !isClosed;
                                        return true;
                                    });

                                    return (
                                        <div className="space-y-6 text-left border-t border-gray-200 pt-8">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                                <h4 className="font-black text-base sm:text-lg md:text-xl text-slate-900">전환 가능 상품 목록 (총 {filteredHybridItems.length}개)</h4>
                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() => setHybridStatusFilter("전체")}
                                                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                                            hybridStatusFilter === "전체"
                                                                ? "text-blue-600 font-bold underline underline-offset-4"
                                                                : "text-slate-500 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        전체
                                                    </button>
                                                    <span className="text-slate-300">•</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setHybridStatusFilter("접수중")}
                                                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                                            hybridStatusFilter === "접수중"
                                                                ? "text-blue-600 font-bold underline underline-offset-4"
                                                                : "text-slate-500 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        접수중
                                                    </button>
                                                    <span className="text-slate-300">•</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setHybridStatusFilter("접수마감")}
                                                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                                            hybridStatusFilter === "접수마감"
                                                                ? "text-blue-600 font-bold underline underline-offset-4"
                                                                : "text-slate-500 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        접수마감
                                                    </button>
                                                </div>
                                            </div>

                                            {filteredHybridItems.length === 0 ? (
                                                <div className="py-12 text-center text-slate-500 font-bold bg-slate-50 border border-gray-200 rounded">
                                                    해당 상태({hybridStatusFilter})의 상품이 없습니다.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                                    {filteredHybridItems.map((subItem, subIdx) => {
                                                        // 1순위: direct 소노아임레디 이미지 URL, 2순위: 이미지 프록시, 3순위: 카테고리 대표 고화질 이미지
                                                        let subImg = subItem.img;
                                                        if (!subImg || subImg.includes('img_default_product.svg')) {
                                                            subImg = detail?.img || "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product01.jpg";
                                                        }

                                                        const targetUrl = subItem.link || `https://www.sonoimready.com/front/sc/chgServList?prdctCd=${encodeURIComponent(selectedHybrid || '')}`;

                                                        return (
                                                            <a 
                                                                key={subIdx} 
                                                                href={targetUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-white border border-gray-200 hover:border-blue-500/50 rounded overflow-hidden flex flex-col group/item shadow-sm hover:shadow-md transition-all cursor-pointer text-inherit no-underline"
                                                            >
                                                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                                                                    <img 
                                                                        src={subImg} 
                                                                        alt={subItem.name} 
                                                                        onError={(e) => {
                                                                            const target = e.currentTarget;
                                                                            const proxyUrl = subItem.img && subItem.img.includes('/attach') ? `/api/hybrid/image-proxy?fileUrl=${encodeURIComponent(subItem.img.slice(subItem.img.indexOf('/attach')))}` : '';
                                                                            const defaultFallback = detail?.img || "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product01.jpg";
                                                                            
                                                                            if (proxyUrl && !target.src.includes('/api/hybrid/image-proxy')) {
                                                                                target.src = proxyUrl;
                                                                            } else if (target.src !== defaultFallback) {
                                                                                target.src = defaultFallback;
                                                                            }
                                                                        }}
                                                                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" 
                                                                    />
                                                                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                                                        {subItem.tags && subItem.tags.map((t: string, ti: number) => (
                                                                            <span key={ti} className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{t}</span>
                                                                        ))}
                                                                    </div>
                                                                    <span className="absolute top-2 right-2 bg-slate-950/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                                        {selectedHybrid}
                                                                    </span>
                                                                </div>
                                                                <div className="p-4 flex flex-col flex-grow text-left">
                                                                    <h5 className="font-black text-slate-900 text-base mb-1 group-hover/item:text-blue-600 transition-colors leading-snug line-clamp-1 flex items-center justify-between" title={subItem.name}>
                                                                        <span>{subItem.name}</span>
                                                                        <svg className="w-4 h-4 text-slate-400 group-hover/item:text-blue-600 transition-colors shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                    </h5>
                                                                    <p className="text-slate-500 text-xs font-medium mb-3 flex-grow line-clamp-2" title={subItem.desc}>{subItem.desc}</p>
                                                                    
                                                                    <div className="flex justify-between items-baseline border-t border-gray-100 pt-3 mt-auto">
                                                                        <span className="text-sono-primary font-black text-base">{subItem.price}</span>
                                                                        <span className="text-[10px] text-slate-400 font-bold">{subItem.period}</span>
                                                                    </div>
                                                                    <div className="mt-3 flex justify-between items-center">
                                                                        {subItem.status && (subItem.status === "접수마감" || subItem.status === "마감" || subItem.status.includes("마감")) ? (
                                                                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-300">
                                                                                {subItem.status}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/40">
                                                                                {subItem.status}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[11px] font-bold text-blue-600 group-hover/item:underline flex items-center gap-0.5">
                                                                            자세히보기
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })() : null}
                            </div>

                            {/* 모달 풋터 */}
                            <div className="bg-gray-50 border-t border-gray-200 px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-center justify-end shrink-0">
                                <button 
                                    onClick={() => setSelectedHybrid(null)}
                                    className="bg-white hover:bg-gray-55 text-slate-700 border border-gray-300 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm transition-colors text-center w-full sm:w-auto cursor-pointer"
                                >
                                    닫기
                                </button>
                                <button 
                                    onClick={() => {
                                        setSelectedHybrid(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 bg-sono-primary text-white font-black px-6 sm:px-8 py-2.5 sm:py-3 rounded text-xs sm:text-sm hover:bg-blue-600 transition-all w-full sm:w-auto cursor-pointer"
                                >
                                    <svg className="w-4 h-4 transform rotate-45 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    빠른 상담 신청하기
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <Footer partnerMode={partnerMode} productType="smartcare" />

            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partnerName={partnerName}
                partnerId={partnerId}
                productType="smartcare"
                showProductSelect={false}
                initialAppliance={pickedAppliance ? (() => {
                    const cleanBrand = (pickedAppliance.brand || "").trim();
                    let cleanName = (pickedAppliance.name || "").trim();
                    if (cleanBrand) {
                        const bracketBrand = `[${cleanBrand}]`;
                        if (cleanName.startsWith(bracketBrand)) {
                            cleanName = cleanName.slice(bracketBrand.length).trim();
                        } else if (cleanName.startsWith(cleanBrand)) {
                            cleanName = cleanName.slice(cleanBrand.length).trim();
                        }
                    }
                    const brandPrefix = cleanBrand ? `[${cleanBrand}] ` : "";
                    const modelSuffix = pickedAppliance.model ? ` (${pickedAppliance.model})` : "";
                    return `${brandPrefix}${cleanName}${modelSuffix}`;
                })() : ""}
                initialUnit={pickedAppliance?.slotCount ? pickedAppliance.slotCount.toString() : (isPremiumMallMode ? "" : "4")}
                initialPlanId={pickedAppliance?.careProductId || ""}
                isPremiumMallMode={isPremiumMallMode}
            />

            <ProductDetailModal
                isOpen={Boolean(detailModalAppliance)}
                onClose={() => setDetailModalAppliance(null)}
                appliance={detailModalAppliance}
                onApplyInquiry={(app: any) => {
                    setPickedAppliance(app);
                    setIsModalOpen(true);
                }}
            />

            {/* 자동이체 변경 안내 모달 (샤프한 직각 사각형 스타일) */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setIsTransferModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-none overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="p-8 md:p-10">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">자동이체 변경 안내</h3>
                                <button onClick={() => setIsTransferModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-900 transition-colors">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="bg-slate-100 p-6 rounded-none border border-slate-300">
                                    <p className="text-slate-900 font-bold leading-relaxed break-keep text-sm md:text-base">
                                        카드 발급 후 반드시 아래 방법 중 하나를 선택하여 <span className="underline underline-offset-4 decoration-2 text-sono-primary">결제수단을 해당 제휴카드로 변경</span>하셔야 할인 혜택이 적용됩니다.
                                    </p>
                                </div>
                                
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <h4 className="font-black text-slate-900 text-lg flex items-center gap-2 tracking-tight">
                                            <span className="w-1.5 h-6 bg-sono-primary"></span>
                                            방법 01. 고객센터 전화 신청
                                        </h4>
                                        <div className="ml-3.5">
                                            <p className="text-slate-600 text-sm md:text-base font-bold leading-relaxed break-keep">
                                                대명소노아임레디 고객센터 <a href="tel:1588-8511" className="text-slate-900 border-b-2 border-slate-900 hover:text-sono-primary transition-all font-black text-lg">1588-8511</a> 연결 후 상담원을 통해 결제 카드 변경을 요청하세요.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-black text-slate-900 text-lg flex items-center gap-2 tracking-tight">
                                            <span className="w-1.5 h-6 bg-sono-primary"></span>
                                            방법 02. 공식 홈페이지 직접 변경
                                        </h4>
                                        <div className="ml-3.5 space-y-4">
                                            <p className="text-slate-600 text-sm md:text-base font-bold leading-relaxed break-keep">
                                                로그인 {'>'} My아임레디 {'>'} 결제수단 관리 {'>'} <span className="text-sono-primary font-black underline underline-offset-4">결제수단 변경</span> 버튼을 선택하세요.
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <a href="https://www.sonoimready.com/front/login/login" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-none text-sm font-bold hover:bg-sono-primary transition-all">
                                                    마이페이지 바로가기
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                                <div className="relative group overflow-hidden rounded-none border border-slate-200 shadow-md bg-slate-50 flex flex-col">
                                                    {/* STEP 1 CSS Mockup */}
                                                    <div className="w-full aspect-[4/3] bg-slate-50 flex flex-col p-4 border-b border-slate-200 relative select-none">
                                                        {/* Header bar */}
                                                        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-3 shrink-0">
                                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                            <span className="text-[8px] text-slate-400 font-bold ml-1 font-mono">sonoimready.com</span>
                                                        </div>
                                                        {/* Body */}
                                                        <div className="flex flex-grow gap-2.5 text-[9px] min-h-0">
                                                            {/* Sidebar */}
                                                            <div className="w-1/3 bg-slate-100 p-1.5 border border-slate-200 flex flex-col gap-1.5 select-none">
                                                                <div className="w-10 h-1.5 bg-slate-300"></div>
                                                                <div className="w-12 h-1 bg-slate-200"></div>
                                                                <div className="w-10 h-1 bg-slate-200"></div>
                                                                <div className="w-full py-0.5 bg-blue-50 border-l-2 border-blue-600 px-1 flex items-center font-black text-blue-700 text-[8px]">
                                                                    결제수단 관리
                                                                </div>
                                                                <div className="w-10 h-1 bg-slate-200"></div>
                                                            </div>
                                                            {/* Content */}
                                                            <div className="flex-1 bg-white p-1.5 border border-slate-200 flex flex-col justify-between select-none">
                                                                <div className="space-y-1">
                                                                    <div className="w-14 h-2 bg-slate-800"></div>
                                                                    <div className="w-full h-[1px] bg-slate-100"></div>
                                                                    <div className="flex justify-between items-center bg-slate-50 p-1 border border-slate-100 text-[7px] font-bold text-slate-500">
                                                                        <span>기존 결제방법</span>
                                                                        <span>신용카드</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end mt-1">
                                                                    <span className="bg-blue-600 text-white font-black px-2 py-0.5 text-[7px] border border-blue-500 animate-pulse">
                                                                        결제수단 변경
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-2 left-2 bg-sono-primary text-white text-[10px] px-2 py-1 font-bold shadow-lg z-10">STEP 1</div>
                                                    <div className="bg-slate-900 text-white p-3 text-xs font-bold text-center">결제수단 변경 메뉴를 선택하세요</div>
                                                </div>
                                                <div className="relative group overflow-hidden rounded-none border border-slate-200 shadow-md bg-slate-50 flex flex-col">
                                                    {/* STEP 2 CSS Mockup */}
                                                    <div className="w-full aspect-[4/3] bg-slate-50 flex flex-col p-4 border-b border-slate-200 relative select-none">
                                                        {/* Header bar */}
                                                        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-3 shrink-0">
                                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                            <span className="text-[8px] text-slate-400 font-bold ml-1 font-mono">card-payment-form</span>
                                                        </div>
                                                        {/* Body: Card Form input fields */}
                                                        <div className="flex flex-col gap-1.5 flex-grow text-[8px] min-h-0">
                                                            <div className="space-y-1">
                                                                <label className="text-slate-400 text-[7px] font-bold block">제휴 카드 선택</label>
                                                                <div className="w-full p-1 border border-slate-300 bg-white font-bold text-slate-700 flex justify-between items-center text-[7px]">
                                                                    <span>[제휴] 소노아임레디 KB국민카드</span>
                                                                    <span className="text-[5px] text-slate-400">▼</span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="space-y-1">
                                                                    <label className="text-slate-400 text-[7px] font-bold block">카드번호</label>
                                                                    <div className="w-full p-1 border border-slate-300 bg-white text-slate-400 font-mono tracking-wider font-bold text-[7px]">
                                                                        9410 - **** - ****
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-slate-400 text-[7px] font-bold block">유효기간</label>
                                                                    <div className="w-full p-1 border border-slate-300 bg-white text-slate-400 font-mono font-bold text-[7px]">
                                                                        MM / YY
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end mt-auto pt-1">
                                                                <span className="w-full bg-slate-900 text-white font-black text-center py-1 text-[7px] border border-slate-800 hover:bg-sono-primary transition-all">
                                                                    정보 입력 완료
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-2 left-2 bg-sono-primary text-white text-[10px] px-2 py-1 font-bold shadow-lg z-10">STEP 2</div>
                                                    <div className="bg-slate-900 text-white p-3 text-xs font-bold text-center">새로운 결제 수단 정보를 입력하세요</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-black text-slate-900 text-lg flex items-center gap-2 tracking-tight">
                                            <span className="w-1.5 h-6 bg-sono-primary"></span>
                                            방법 03. 공식 카카오채널 상담
                                        </h4>
                                        <div className="ml-3.5">
                                            <p className="text-slate-600 text-sm md:text-base font-bold leading-relaxed break-keep">
                                                소노아임레디 공식 카카오채널 채팅 상담을 통해 간편하게 변경 요청을 하실 수 있습니다. <span className="text-slate-500 block mt-1 text-xs md:text-sm font-medium">(가입자 본인 카카오톡에서 채널 확인 가능)</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsTransferModalOpen(false)}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-none mt-12 hover:bg-black transition-all text-lg"
                            >
                                확인하였습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
