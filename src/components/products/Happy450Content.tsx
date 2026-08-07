"use client";

import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { useState, useEffect } from "react";
import InquiryModal from "@/components/InquiryModal";
import ImportantNotice from "@/components/common/ImportantNotice";

interface HybridItem {
    status?: string;
    name: string;
    desc: string;
    price: string;
    period: string;
    tags: string[];
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
            method: "소노아임레디 고객센터 1588-2227 접수"
        },
        notes: "항공 스케줄 및 현지 리조트 사정에 따라 추가 요금이 발생할 수 있습니다.",
        items: [
            { name: "[플러스앤] 회원전용 국내숙박", desc: "#국내숙박 #회원전용 #플러스앤", price: "100,000원~", period: "2025-04-25 ~ 상시접수", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/04/25/143b0bde-e209-46e2-ba48-38901ce30cfe", status: "접수중" },
            { name: "[호주] 시드니 블루마운틴&포트스테판 6일 패키지", desc: "최소출발 2명, 와이너리부터 오페라하우스까지", price: "5,940,000원~", period: "2026-07-09 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/09/aed7aa1c-3a7e-4a86-9615-e0f039ce9f5e", status: "접수중" },
            { name: "[일본] 회원 전용 프라이빗 맞춤여행 서비스", desc: "내 납입금으로 완성하는 나만의 여행 일정", price: "2,970,000원~", period: "2026-07-27 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/27/e60bd27c-9e97-4cc2-87d6-05470786fd1b", status: "접수중" },
            { name: "[제주굿렌터카] 제주도 렌터카", desc: "제주도 여행갈땐? 레디캐시로 제주렌터카!", price: "100,000원~", period: "2025-05-07 ~ 상시접수", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/07/279d6d83-418f-4aa5-87a6-6a0238eed7d1", status: "접수중" },
            { name: "[일본] 큐슈 온천&소도시 4일 패키지", desc: "최소출발 2명, 편하게 떠나는 힐링 일본 여행", price: "3,990,000원~", period: "2026-06-16 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/16/474fe0bf-9a4c-41a2-add3-66eee3d26a82", status: "접수중" },
            { name: "[하나투어] 해외여행 패키지&호텔", desc: "대한민국을 대표하는 1등 여행 브랜드", price: "100,000원~", period: "2025-03-27 ~ 상시접수", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/dcf0fe19-459b-4f4a-a970-1c288a07087f", status: "접수중" }
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
            method: "소노아임레디 고객센터 1588-2227 접수"
        },
        notes: "선실 등급 및 항공 노선에 따라 추가 비용이 발생할 수 있습니다.",
        items: [
            { name: "[MSC 월드유로파] 서부지중해 4국 11일", desc: "10월 출발, 21만톤 최대 규모 지중해 크루즈!", price: "7,190,000원~", period: "2025-11-27 ~ 2026-11-22", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/27/f48e8faf-a3b6-4ad4-aa64-d9a522840733", status: "접수중" },
            { name: "[MSC 그란디오사] 서부지중해 3국 11일", desc: "11월 출발, 부담없이 즐길 수 있는 지중해 크루즈!", price: "6,590,000원~", period: "2025-11-27 ~ 2026-11-22", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/27/66a27e84-52a2-44de-b4f0-0ca571ce5270", status: "접수중" },
            { name: "[MSC 디비나] 동부지중해 3국 11일", desc: "10월 출발, 그리스 신화의 고향 지중해 크루즈!", price: "6,490,000원~", period: "2025-11-27 ~ 2026-11-22", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/27/cb688d36-47b1-42ce-b470-736820646576", status: "접수중" },
            { name: "[MSC 벨리시마] 추석연휴 한중일 3국 7일", desc: "26.9월 출발, 추석연휴에 떠나는 한중일 크루즈", price: "3,890,000원~", period: "2026-07-20 ~ 2026-09-20", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/20/fab6621b-8882-4448-8b3c-a70d0160c2d3", status: "접수중" },
            { name: "[코스타 세레나] 국내출발 한중일 3국 6일", desc: "26.5~6월 출발, 속초/부산 출발 아시아 크루즈", price: "2,390,000원~", period: "2026-05-18 ~ 2026-06-15", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/05/18/b44c85c3-6995-47c6-8097-e6b127135476", status: "접수마감" },
            { name: "[팬스타 미라클] 부산출발 원나잇 크루즈", desc: "주말 부산 앞바다 불꽃쇼와 선상 공연의 로맨틱 여행", price: "180,000원~", period: "2026-07-29 ~ 2027-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/29/aa848c02-cace-4b46-8875-3a5e492d94af", status: "접수중" },
            { name: "[로얄캐리비안 네비게이터] 동남아 3국 7일", desc: "26.10-27.3월 출발, 아임레디 크루즈 베스트셀러", price: "7,290,000원~", period: "2026-07-01 ~ 2027-02-05", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/30/fe6646e9-adb9-4eda-a92e-800b0d41e44f", status: "접수중" },
            { name: "[카니발 어드벤처] 호주 시드니/브리즈번 7일", desc: "~12월 출발, 부담없이 떠날 수 있는 호주 크루즈", price: "3,990,000원~", period: "2025-04-01 ~ 2026-12-13", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/07/01/31e4e5ec-2135-49f7-8851-01f348752829", status: "접수중" }
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
            method: "고객센터 1588-2227 접수"
        },
        notes: "시즌별 골프장 예약 상황에 따라 일정이 변경될 수 있습니다.",
        items: [
            { name: "[골프투어] 태국 아티타야 칸차나부리 CC 5일", desc: "최소 2인 출발, 36홀 명문 골프 코스", price: "510,000원~", period: "2025-05-13 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/ba0b27be-519f-4a4f-939b-79eeea196c9e", status: "접수중" },
            { name: "[골프투어] 일본 하코다테 홋카이도 CC 4일~8일", desc: "시원한 북해도 여름 골프 라운딩", price: "1,270,000원~", period: "2025-05-13 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/fcb7344f-9c5f-4050-af8f-63eb48fcc9a0", status: "접수중" },
            { name: "[골프투어] 베트남 소노펠리체 하이퐁 CC 3일", desc: "소노 그룹 직영 프리미엄 해외 골프 리조트", price: "1,490,000원~", period: "2025-05-13 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/75e53303-34e8-466a-9391-4cf1fbdcd641", status: "접수중" },
            { name: "[골프투어] 일본 사츠마 CC 벚꽃 라운딩", desc: "온천 리조트와 함께 즐기는 규슈 명문 골프", price: "1,190,000원~", period: "2025-05-13 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/bc556bd1-912b-426b-9c71-33230a1eb9e8", status: "접수중" },
            { name: "[골프투어] 괌 소노펠리체 CC 3색 골프 3박 4일", desc: "휴양과 골프를 동시에 즐기는 프리미엄 괌 투어", price: "1,690,000원~", period: "2025-06-23 ~ 2026-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/06/23/c4d886a0-720d-4776-a826-085398af29ee", status: "접수중" }
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
            method: "고객센터 1588-2227 접수"
        },
        notes: "국가별 학생 비자 발급 기간이 다를 수 있어 사전 예약이 필수적입니다.",
        items: [
            { name: "[대교] 눈높이 초등 영어 패키지", desc: "초등 학습, 3개월 과정, 영어 패키지", price: "414,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/5614f0b7-ec6d-4203-92c9-71f78bb1fa22", status: "접수중" },
            { name: "[대교] 눈높이 초등 수학 패키지", desc: "초등 학습, 3개월 과정, 수학 패키지", price: "393,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/41f22350-9312-45df-b248-199b8f4106fd", status: "접수중" },
            { name: "[대교] 눈높이 중등 국어·영어·수학 패키지", desc: "중등 학습, 3개월 과정, 수능 국어·영어·수학 패키지", price: "1,080,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/e089a242-8900-4e08-a4cc-158bbb6d7b00", status: "접수중" },
            { name: "[대교] 눈높이 초등 국어 패키지", desc: "초등 학습, 3개월 과정, 국어 패키지", price: "489,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/ce2328cb-71cc-455f-bbff-32771e732489", status: "접수중" },
            { name: "[2025 여름방학] 주니어 MBC 해외 영어캠프", desc: "#영어캠프 #해외캠프 #주니어캠프 #MBC연합캠프", price: "4,990,000원~", period: "2025-04-28 ~ 2025-07-15", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/04/28/89ee6051-2543-4e75-ad13-6059b33d84c5", status: "접수마감" },
            { name: "[26년 여름방학] MBC 영어캠프(아시아)", desc: "#싱가포르 #말레이시아 #필리핀 #한국", price: "2,800,000원~", period: "2026-06-02 ~ 2026-08-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/02/0d7d502f-3791-41d8-88e2-5a6a0d595839", status: "접수마감" },
            { name: "[26년 여름방학] MBC 영어캠프(미주/남태평양)", desc: "#미주 #캐나다 #호주 #뉴질랜드", price: "5,700,000원~", period: "2026-06-02 ~ 2026-08-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/02/7ceeecac-a8a9-46e5-b436-e91dfa101710", status: "접수마감" },
            { name: "['26 겨울방학] 주니어 MBC영어캠프(아시아/남태)", desc: "#영어캠프 #해외캠프 #주니어캠프 #MBC연합캠프", price: "4,500,000원~", period: "2025-10-27 ~ 2025-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/10/27/d8ab699d-2fb4-4e1d-9be9-d71b3a385f8c", status: "접수마감" },
            { name: "[대교] 눈높이 유아 리틀원 패키지", desc: "유아 학습, 3개월 과정, 한글&수학 패키지", price: "810,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/06/24/a4ae2c82-f7ca-40dc-a911-8659a023fe26", status: "접수중" },
            { name: "['26 겨울방학] 주니어 MBC영어캠프(미주/유럽)", desc: "#영어캠프 #해외캠프 #주니어캠프 #MBC연합캠프", price: "9,000,000원~", period: "2025-10-27 ~ 2025-12-31", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/10/27/40a21b16-36cb-42db-9bb4-1de58ab3605d", status: "접수마감" }
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
            method: "소노아임레디 고객센터 1588-2227 접수"
        },
        notes: "예식 일정이 몰리는 봄/가을 시즌에는 최소 6개월 전 접수가 필수적입니다.",
        items: [
            { name: "[프리미엄] 골드바&다이아 주얼리", desc: "순금골드바, 랩 그로운 다이아몬드, 맞춤제작", price: "170,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/05/14/d646c2a5-88ef-406d-a56b-4077c849ca71", status: "접수중" },
            { name: "[웨딩3] (스드메)+(예복or주얼리or스냅촬영PKG)", desc: "스드메부터 주얼리, 스냅촬영까지!", price: "5,940,000원~", period: "상시접수", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/c4d1be0d-e6da-4110-98a8-3063353b43fd", status: "접수중" },
            { name: "[웨딩2] (스드메)+(예복or스냅촬영)", desc: "스드메부터 스냅촬영까지!", price: "4,990,000원~", period: "상시접수", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/04/03/82bc43bf-88dc-42ef-8872-b864973646ff", status: "접수중" },
            { name: "[가전] 신혼 필수가전 추천", desc: "#가전 #신혼가전 #소형가전", price: "10,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/04/26/13896e3f-c284-454d-80f6-0c43ac9e565e", status: "접수중" },
            { name: "[침구] 혼수 침구·패브릭 추천", desc: "#침구 #패브릭 #신혼침구", price: "10,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2026/04/28/1bbec3a6-0591-4a0e-bb59-60a55d9e84dc", status: "접수중" },
            { name: "[웨딩1] 스튜디오+드레스+메이크업+예복(한복)", desc: "합리적인 웨딩 준비, 스드메와 예복(한복)을 한번에!", price: "3,990,000원~", period: "상시접수", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/8875ed6c-7ac8-430b-a608-c7e61b8b2f11", status: "접수중" },
            { name: "[주얼리] 청담 예물명가 쥬드쥬얼리", desc: "35년 전통의 청담동 주얼리로 가치를 더해보세요.", price: "3,990,000원~", period: "상시접수", tags: ["전환", "레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/d33da11a-65ad-40bf-8eea-4a6bbd8752a2", status: "접수중" },
            { name: "[예복] 맞춤예복명가 아틀레 회원특가", desc: "#예복 #결혼예복 #맞춤정장", price: "890,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/05/13/258d616d-3127-4d01-9994-46ecacf9694e", status: "접수중" }
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
            method: "소노아임레디 고객센터 1588-2227 접수"
        },
        notes: "포인트 전환 완료 후 취소는 규정에 의거 제한될 수 있습니다.",
        items: [
            { name: "[명품케어] 명품 매입서비스", desc: "#명품매입, #명품시계/가방 #주얼리", price: "100,000원~", period: "2025-11-01 ~ 2040-12-31", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/09/10/eee70d16-1d6e-4bbe-8918-d837fb0885ea", status: "접수중" },
            { name: "[명품케어] 명품 수선서비스", desc: "#명품수선 #명품시계 #명품가방", price: "40,000원~", period: "2025-11-01 ~ 2040-12-31", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/09/10/2467111e-6b02-4609-bcff-303936bbc11f", status: "접수중" }
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
            method: "소노아임레디 고객센터 1588-2227 접수"
        },
        notes: "이사 일정 및 아파트 규격, 사다리차 이용 여부에 따라 현장 추가 요금이 발생할 수 있습니다.",
        items: [
            { name: "[레디캐시전용] 통인익스프레스 이사 컨시어지", desc: "#이사 #프리미엄 #레디캐시전용", price: "700,000원~", period: "2025-11-18 ~ 상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/11/18/75b99aec-8740-44fd-8ce7-4cb9b72fc0d8", status: "접수중" },
            { name: "[레디캐시전용] 현대리바트 거실가구 ", desc: "#리바트 #거실가구 #레디캐시전용", price: "1,858,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/872b3cc8-4448-4cf3-99be-2ea48f90a163", status: "접수중" },
            { name: "[레디캐시전용] 현대리바트 주방가구", desc: "#리바트 #주방가구 #레디캐시전용", price: "982,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/52116ea4-024a-4566-8ca6-03a14ebbc264", status: "접수중" },
            { name: "[레디캐시전용] 현대리바트 침실가구", desc: "#리바트 #침실가구 #레디캐시전용", price: "1,156,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/90253af0-965b-4bd0-a197-87092dd59e10", status: "접수중" },
            { name: "[레디캐시전용] 현대리바트 키즈가구", desc: "#리바트 #키즈가구 #레디캐시전용", price: "590,000원~", period: "상시접수", tags: ["레디캐시"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/08/01/3613045b-5ba8-4427-9fb1-70fb265081ed", status: "접수중" }
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
            method: "소노아임레디 고객센터 1588-2227 접수"
        },
        items: [
            { name: "[장지] 장지 시설 서비스", desc: "합법적인 허가 및 관리가 이뤄지는 장지시설 엄선", price: "3,990,000원~", period: "상시접수", tags: ["전환"], img: "https://www.sonoimready.com/service/file/fileView?fileUrl=/attach/se/2025/03/27/9d4c2dda-4ef2-4147-9cea-06e9a9edff9c", status: "접수중" }
        ]
    }
};
interface Happy450ContentProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    pointInfo?: string;
    isPremiumMallMode?: boolean;
}

export default function Happy450Content({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    pointInfo = "",
    isPremiumMallMode = false
}: Happy450ContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedHybrid, setSelectedHybrid] = useState<string | null>(null);
    const [hybridItems, setHybridItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    useEffect(() => {
        if (!selectedHybrid) {
            setHybridItems([]);
            document.body.style.overflow = "";
            return;
        }

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

    const hasPointBenefit = Boolean(pointInfo && pointInfo.trim() !== "" && !pointInfo.includes("없음") && pointInfo !== "0P" && pointInfo !== "0포인트");

    // 파트너 페이지에서는 제휴신청 대신 가입신청으로 표시됨 (Header에서 처리)
    // 페이지 내 버튼 문구 처리
    const ctaText = isPremiumMallMode 
        ? "프리미엄몰 접수 바로가기" 
        : (partnerMode ? "가입 신청하기" : "제휴 파트너 신청하기");

    return (
        <>
            <Header partnerMode={partnerMode} partnerUrl={partnerUrl} partnerName={partnerName} partnerId={partnerId} productType="happy450" isPremiumMallMode={isPremiumMallMode} />
            <main>
                {/* 히어로 섹션 */}
                <section
                    className="relative min-h-[75vh] flex items-center bg-sono-dark overflow-hidden pt-12 bg-cover bg-center bg-[url('https://res.cloudinary.com/lyjyvy54/image/upload/v1785937204/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_10_39_37_pzb3ym.png')] md:bg-[url('https://res.cloudinary.com/lyjyvy54/image/upload/v1785308928/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_29%EC%9D%BC_%EC%98%A4%ED%9B%84_03_38_13_1_1_mpokg4.png')]"
                    style={{
                        // backgroundImage: overridden by tailwind bg-url classes
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* 오버레이: 메인 페이지와 동일한 텍스트 가독성 고도화 그라데이션 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/30 z-0"></div>
                    <div className="absolute inset-0 bg-black/25 z-0"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 relative z-10 w-full">
                        <div className="max-w-4xl animate-fade-in text-left">
                            <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black border border-white/20 mb-8 px-4 py-2 rounded-none text-sm shadow-xl tracking-wider">
                                ★ 인증 제휴 전용 상조 서비스
                            </span>
                            <h1 className="leading-[1.12] mb-6 tracking-tighter filter drop-shadow-2xl">
                                <span className="block text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-md">더 해피 450 ONE</span>
                            </h1>
                            <div className="space-y-3 mb-10">
                                <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-amber-300 tracking-tight drop-shadow-md break-keep">
                                    호텔&리조트 혜택부터 헬스케어 서비스까지 이용하고도<br />만기 시 납입금 100% 환급 보장
                                </p>
                                <p className="text-base md:text-lg text-white/95 leading-relaxed font-semibold drop-shadow-sm break-keep">
                                    대한민국 대표 리조트 기업 소노아임레디가 제안하는 프리미엄 라이프케어 솔루션
                                </p>
                            </div>

                            {/* 두 개의 혜택 요약 카드 (제휴카드 할인 + GC헬스케어) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-3xl">
                                {/* 제휴카드 카드 */}
                                <div 
                                    onClick={() => {
                                        const el = document.getElementById("affiliate-card");
                                        if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="relative group flex flex-col justify-between bg-slate-950/40 backdrop-blur-md border border-amber-400/30 hover:border-amber-400 p-6 rounded-none shadow-2xl overflow-hidden text-left cursor-pointer transition-all"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400"></div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shrink-0 rounded-none">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                                            </div>
                                            <h3 className="text-amber-300 text-lg font-black tracking-tight flex items-center gap-2">
                                                제휴카드 파격 할인
                                                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-none animate-pulse font-bold">HOT</span>
                                            </h3>
                                        </div>
                                        <p className="text-white font-bold text-xs sm:text-sm leading-relaxed break-keep mb-3">
                                            자동이체 등록 시 첫 달 <span className="text-amber-300 underline underline-offset-4 decoration-2">무조건 12,000원 청구할인!</span> (전월 실적 상관없이 제공, 매월 최대 22,000원 할인)
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                        <span className="text-slate-400 text-[10px] font-semibold group-hover:text-amber-300 transition-colors">자세한 조건 확인하기</span>
                                        <a 
                                            href="#affiliate-card" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const el = document.getElementById("affiliate-card");
                                                if (el) el.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="shrink-0 bg-white/10 group-hover:bg-amber-400 text-white group-hover:text-slate-950 px-3 py-1.5 rounded-none text-[10px] font-black transition-all border border-white/20 flex items-center gap-1"
                                        >
                                            바로가기
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                        </a>
                                    </div>
                                </div>

                                {/* GC헬스케어 카드 */}
                                <div 
                                    onClick={() => {
                                        const el = document.getElementById("gccare");
                                        if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="relative group flex flex-col justify-between bg-slate-950/40 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 p-6 rounded-none shadow-2xl overflow-hidden text-left cursor-pointer transition-all"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500"></div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0 rounded-none">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-emerald-400 text-lg font-black tracking-tight flex items-center gap-2">
                                                GC헬스케어 특별 혜택
                                                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-none animate-pulse font-bold">FREE</span>
                                            </h3>
                                        </div>
                                        <p className="text-white font-bold text-xs sm:text-sm leading-relaxed break-keep mb-3">
                                            전문간호사 1:1 상담부터 대형병원 진료예약 대행, 전문의 명의 추천, <span className="text-emerald-400 underline underline-offset-4 decoration-2">간호사 병원동행 서비스</span> 무상 연계
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                        <span className="text-slate-400 text-[10px] font-semibold group-hover:text-emerald-300 transition-colors">자세한 서비스 내용 보기</span>
                                        <a 
                                            href="#gccare" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const el = document.getElementById("gccare");
                                                if (el) el.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="shrink-0 bg-white/10 group-hover:bg-emerald-500 text-white group-hover:text-white px-3 py-1.5 rounded-none text-[10px] font-black transition-all border border-white/20 flex items-center gap-1"
                                        >
                                            바로가기
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* 가입신청 및 파트너센터 이동 버튼 (투명 보더라인 디자인) */}
                            <div className="flex flex-col sm:flex-row gap-5 mt-10">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="border-2 border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 bg-transparent px-10 py-5 rounded-none font-black text-lg transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] text-center"
                                >
                                    {ctaText}
                                </button>
                                {!partnerMode && (
                                    <Link
                                        href="/partner-center"
                                        className="border-2 border-white/60 text-white hover:bg-white hover:text-slate-950 bg-transparent px-10 py-5 rounded-none font-black text-lg transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] text-center"
                                    >
                                        파트너센터 바로가기
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
                </section>

                {/* 핵심 혜택 섹션 (3x3 격자형 6개 혜택) */}
                <section className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-4 py-2 rounded-none uppercase tracking-wider mb-4 inline-block border border-amber-500/30">
                                KEY BENEFITS
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">더 해피 450 핵심 혜택</h2>
                            <p className="text-slate-400 font-medium text-sm md:text-base mt-3 max-w-xl mx-auto">
                                가입부터 만기 환급까지 파트너 및 회원님께 제공되는 특별한 시그니처 혜택
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {[
                                {
                                    title: "BENEFIT 01",
                                    name: "장례서비스 약관보장",
                                    desc: "20년이 지나도 1원도 추가 비용 없이 약관에 있는 의전서비스 일체를 제공해 드립니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932608/01_funeral_terms_guarantee_logo_1_rq81kz.png"
                                },
                                {
                                    title: "BENEFIT 02",
                                    name: "8대 하이브리드 서비스 전환 보장",
                                    desc: "어학연수, 웨딩, 리빙, 골프, 크루즈, 여행 등 원하는 시점에 원하는 서비스로 자유롭게 전환 가능합니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932609/02_hybrid_service_conversion_logo_1_mynjl3.png"
                                },
                                {
                                    title: "BENEFIT 03",
                                    name: "제휴카드 파격할인",
                                    desc: "소노아임레디 제휴카드 매월 청구할인 혜택을 제공합니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932609/03_affiliate_card_discount_logo_1_mht0ov.png"
                                },
                                {
                                    title: "BENEFIT 04",
                                    name: "소노호텔&리조트 회원우대",
                                    desc: "전국 소노호텔&리조트 객실 및 오션월드, 스키 등 멤버십 혜택을 제공합니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932611/04_sono_hotel_resort_benefit_with_logo_1_cw84ct.png"
                                },
                                {
                                    title: "BENEFIT 05",
                                    name: "GC헬스케어 특별혜택",
                                    desc: "GC케어가 제공하는 프리미엄 건강 상담 및 헬스케어 서비스 무료 연계 혜택을 제공합니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932611/Group_1_8_1_guxnwi.png"
                                },
                                {
                                    title: "BENEFIT 06",
                                    name: "납입금 100% 전액환급",
                                    desc: "상조 서비스를 이용하지 않더라도 만기 납입 완료 후 해약 시 납입하신 금액 100% 전액을 환급해 드립니다.",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785932610/06_full_refund_logo_1_ija0rc.png"
                                }
                            ].map((benefit, index) => (
                                <div 
                                    key={index} 
                                    className="bg-slate-800/90 border border-slate-700/80 rounded-none overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300 flex flex-col group text-left"
                                >
                                    {/* 이미지 비주얼 영역 (직각) */}
                                    <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950 rounded-none">
                                        <img 
                                            src={benefit.image} 
                                            alt={benefit.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                    </div>

                                    {/* 내용 영역 */}
                                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                                        <div className="mb-3">
                                            <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-none border border-amber-500/20 tracking-wider uppercase inline-block">
                                                {benefit.title}
                                            </span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-black text-white mb-2 tracking-tight group-hover:text-amber-300 transition-colors break-keep">
                                            {benefit.name}
                                        </h3>
                                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium break-keep">
                                            {benefit.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* 납입 플랜 (그레이 섹션 배경 & 진한 다크 직각 카드 스타일) */}
                <section className="py-20 md:py-32 bg-slate-100 text-slate-900">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-none mb-6 inline-block uppercase tracking-wider">PLAN</span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">합리적인 월 납입 플랜</h2>
                            <p className="text-slate-600 text-base md:text-xl font-medium">부담 없는 납입금으로<br className="md:hidden" /> 미래의 상조 서비스를 준비하세요.</p>
                        </div>

                        <div className="relative group md:block">
                            <button 
                                onClick={(e) => { 
                                    const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                    if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth; el.scrollBy({ left: -w, behavior: 'smooth' }); }
                                }} 
                                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none md:hidden" 
                                aria-label="Previous"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <div style={{ scrollSnapType: 'x mandatory' }} className="flex w-full overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-10 md:py-16 px-0 md:px-0 scroll-px-0 md:scroll-px-0 gap-6 md:gap-10 max-w-5xl mx-auto items-stretch">
                                {[
                                    { name: "실속형", units: "더 해피450 ONE 1구좌", price: "18,000", desc: "가장 기본적인 상조 서비스" },
                                    { name: "인기형", units: "더 해피450 ONE 2구좌", price: "36,000", desc: "더 풍성한 서비스 구성", popular: true },
                                    { name: "베스트", units: "더 해피450 ONE 3구좌", price: "54,000", desc: "프리미엄 서비스 구성" },
                                ].map((plan, index) => (
                                    <div 
                                        key={index} 
                                        style={{ scrollSnapStop: 'always' }} className={`relative !p-6 md:!p-10 flex flex-col h-full transition-all rounded-none text-white snap-center snap-always [scroll-snap-stop:always] shrink-0 w-full md:w-auto ${
                                            plan.popular 
                                                ? 'bg-slate-950 border-2 border-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.3)] md:scale-105 z-10' 
                                                : 'bg-slate-900 border border-slate-800 shadow-xl hover:border-slate-700'
                                        }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <span className="bg-amber-400 text-slate-950 text-xs font-black px-5 py-1.5 rounded-none shadow-md tracking-wider whitespace-nowrap">MOST POPULAR</span>
                                            </div>
                                        )}
                                        <div className="text-center mb-6 md:mb-8">
                                            <h3 className="text-xl md:text-2xl font-black text-white mb-1 md:mb-2">{plan.name}</h3>
                                            <span className="text-slate-400 font-bold text-xs md:text-sm">{plan.units}</span>
                                            <div className="my-4 md:my-6">
                                                <span className={`text-3xl md:text-4xl font-black tracking-tight ${plan.popular ? 'text-amber-400' : 'text-blue-400'}`}>{plan.price}</span>
                                                <span className="text-slate-400 font-bold ml-1 text-sm md:text-base">원/월</span>
                                            </div>

                                            {/* 제휴카드 할인 가격 안내 */}
                                            <div className="mt-4 space-y-2 pt-4 border-t border-slate-800">
                                                <div className="flex justify-between items-center bg-slate-950/80 border border-slate-800 rounded-none px-4 py-3 transition-colors">
                                                    <div className="text-left">
                                                        <p className="text-[11px] font-black text-blue-400 leading-none mb-1.5">제휴카드 할인</p>
                                                        <p className="text-[10px] font-bold text-slate-400 leading-none">30만원 실적 시</p>
                                                    </div>
                                                    <div className="text-right flex items-baseline gap-0.5">
                                                        <span className="text-lg md:text-xl font-black text-blue-400 whitespace-nowrap">
                                                            {Math.max(0, Number(plan.price.replace(/,/g, '')) - 12000).toLocaleString()}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 whitespace-nowrap">원</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center bg-slate-950/80 border border-amber-500/20 rounded-none px-4 py-3 transition-colors">
                                                    <div className="text-left">
                                                        <p className="text-[11px] font-black text-amber-400 leading-none mb-1.5">제휴카드 최대할인</p>
                                                        <p className="text-[10px] font-bold text-slate-400 leading-none">150만원 실적 시</p>
                                                    </div>
                                                    <div className="text-right flex items-baseline gap-0.5">
                                                        <span className="text-lg md:text-xl font-black text-amber-400 whitespace-nowrap">
                                                            {Math.max(0, Number(plan.price.replace(/,/g, '')) - 25000).toLocaleString()}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 whitespace-nowrap">원</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-center font-medium mb-6 flex-grow text-sm md:text-base">{plan.desc}</p>
                                        <ul className="space-y-3 text-sm font-bold mb-4 pt-4 border-t border-slate-800">
                                            {[
                                                "제휴몰 포인트 지급",
                                                "레디캐시 전환",
                                                "소노그룹 멤버십",
                                                "납입금 100% 환급"
                                            ].map((text, i) => (
                                                <li key={i} className="flex items-center gap-3 text-slate-200">
                                                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={(e) => { 
                                    const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                    if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth; el.scrollBy({ left: w, behavior: 'smooth' }); }
                                }} 
                                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none md:hidden" 
                                aria-label="Next"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>                        <div className="mt-12 max-w-5xl mx-auto">
                            <div className="bg-slate-900 border border-slate-800 rounded-none p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-2xl text-white">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-none bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg font-black">
                                    <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-lg md:text-xl font-black text-white mb-2 tracking-tight">
                                        할인 받아도 <span className="text-amber-300 underline underline-offset-4 decoration-2">환급은 100% 그대로!</span>
                                    </h4>
                                    <p className="text-slate-300 font-bold text-sm md:text-lg leading-relaxed break-keep">
                                        제휴카드로 할인을 받았다고 하더라도 <span className="text-white font-black">만기환급금은 가입 금액 그대로 인정</span>해 드립니다.
                                    </p>
                                    <p className="text-slate-400 font-bold text-xs md:text-base mt-2">
                                        (예: 월 18,000원 회비를 제휴카드를 통해 전액 할인 받았어도, 만기 시 18,000원 납입으로 인정)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-12 text-center space-y-1 md:space-y-2">
                            <p className="text-slate-500 font-bold text-xs md:text-sm italic">
                                *100% 환급 조건 : 만기 납입 후 익월 해약 시*
                            </p>
                            <p className="text-slate-500 font-bold text-xs md:text-sm italic">
                                *레디캐시 사용 조건 : 가입 상품의 해약환급금 80% 사용 가능*
                            </p>
                        </div>
                    </div>
                </section>

                {/* 제휴카드 혜택 (진한 다크 럭셔리 & 직각 사각형 스타일) */}
                <section id="affiliate-card" className="py-20 md:py-32 bg-slate-900 text-white scroll-mt-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative p-4 sm:p-6 md:p-12 lg:p-20 rounded-none border-[3px] border-amber-500/20 bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.3)] hover:border-amber-500/35 transition-all duration-500">
                            <div className="text-center mb-16 md:mb-24">
                                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-4 py-2 rounded-none mb-6 inline-block uppercase tracking-wider border border-amber-500/30">AFFILIATE CARD</span>
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">제휴카드 할인 혜택</h2>
                                <p className="text-slate-400 text-base md:text-xl font-medium">제휴카드로 결제 시 매월 납입금 부담을 더 줄여드립니다.</p>
                            </div>

                            <div className="relative group md:block">
                                <button 
                                    onClick={(e) => { 
                                        const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                        if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 32 : el.clientWidth; el.scrollBy({ left: -w, behavior: 'smooth' }); }
                                    }} 
                                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-slate-950/80 hover:bg-slate-950 text-amber-500 hover:text-amber-400 p-2 rounded-full shadow-lg border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 focus:outline-none md:hidden" 
                                    aria-label="Previous"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                </button>
                                <div style={{ scrollSnapType: 'x mandatory' }} className="flex w-full overflow-x-auto md:overflow-visible md:grid md:grid-cols-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-8 pb-6 md:pt-6 md:pb-0 px-0 md:px-0 scroll-px-0 md:scroll-px-0 gap-8 md:gap-10 mb-16 max-w-5xl mx-auto">
                                    {/* 카드 1: KB국민카드 */}
                                    <div style={{ scrollSnapStop: 'always' }} className="relative bg-slate-100 rounded-none p-5 sm:p-8 md:p-10 shadow-sm border border-slate-200 flex flex-col hover:shadow-xl hover:border-slate-400 transition-all duration-300 text-slate-900 snap-center snap-always [scroll-snap-stop:always] shrink-0 w-full md:w-auto">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-white text-[11px] font-black px-4 py-1.5 rounded-none shadow-lg whitespace-nowrap z-10">연회비 가장 저렴</div>
                                        <div className="aspect-[1.58/1] mb-8 flex items-center justify-center">
                                            <img 
                                                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097491/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_KB%EC%B9%B4%EB%93%9C_ffyvb2_zql90f.png" 
                                                alt="소노아임레디 KB국민카드"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="mb-8 text-center md:text-left">
                                            <h3 className="text-[16px] sm:text-xl md:text-2xl font-black text-slate-900 mb-2 tracking-tighter whitespace-nowrap">소노아임레디 KB국민카드</h3>
                                            <p className="text-[#f59e0b] font-bold text-lg whitespace-nowrap">최대 <span className="text-2xl md:text-3xl">1.7만원</span> 할인</p>
                                        </div>
                                        <div className="space-y-4 mb-8 flex-grow">
                                            <div className="bg-white rounded-none p-3 sm:p-5 border border-slate-200">
                                                <div className="flex justify-between items-center mb-2 sm:mb-3 gap-1">
                                                    <span className="text-slate-500 font-bold text-[10px] sm:text-xs shrink-0 whitespace-nowrap">전월 30만원 실적 시</span>
                                                    <span className="text-slate-900 font-black text-[11px] sm:text-sm whitespace-nowrap">12,000원 할인</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[#f59e0b] gap-1">
                                                    <span className="font-bold text-[10px] sm:text-xs shrink-0 whitespace-nowrap">첫 달 실적 없어도</span>
                                                    <span className="font-black text-[11px] sm:text-sm underline underline-offset-4 decoration-2 whitespace-nowrap">12,000원 할인</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 px-1">
                                                <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                    <span className="text-slate-500">전월 30만원 ↑</span>
                                                    <span className="text-slate-900">12,000원</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                    <span className="text-slate-500">전월 70만원 ↑</span>
                                                    <span className="text-slate-900">17,000원</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center py-4 border-t border-slate-300 mt-4">
                                                <span className="text-slate-500 font-bold text-xs">연회비</span>
                                                <span className="text-xs font-bold text-slate-900 text-right">국내외겸용 15,000원</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 mt-auto">
                                            <a href="tel:1899-0077" className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-none hover:bg-black transition-all text-sm">
                                                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.587 4.587l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                                1899-0077 전화 신청
                                            </a>
                                            <a href="https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=04342&mainCC=a&solicitorcode=7030201000" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-sono-primary text-white font-bold py-4 rounded-none hover:bg-blue-600 transition-all text-sm">
                                                온라인 신청
                                            </a>
                                        </div>
                                    </div>

                                    {/* 카드 2: 하나카드 */}
                                    <div style={{ scrollSnapStop: 'always' }} className="relative bg-slate-100 rounded-none p-5 sm:p-8 md:p-10 shadow-sm border border-slate-200 flex flex-col hover:shadow-xl hover:border-slate-400 transition-all duration-300 text-slate-900 snap-center snap-always [scroll-snap-stop:always] shrink-0 w-full md:w-auto">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[11px] font-black px-4 py-1.5 rounded-none shadow-lg whitespace-nowrap z-10">빠른 신청(전용번호)</div>
                                        <div className="aspect-[1.58/1] mb-8 flex items-center justify-center">
                                            <img 
                                                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097508/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_%ED%94%8C%EB%9F%AC%EC%8A%A4_%ED%95%98%EB%82%98%EC%B9%B4%EB%93%9C_nyopom_delgx0.png" 
                                                alt="소노아임레디 플러스 하나카드"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="mb-8 text-center md:text-left">
                                            <h3 className="text-[15px] sm:text-xl md:text-2xl font-black text-slate-900 mb-2 tracking-tighter whitespace-nowrap">소노아임레디 플러스 하나카드</h3>
                                            <p className="text-red-500 font-bold text-lg whitespace-nowrap">최대 <span className="text-2xl md:text-3xl">1.9만원</span> 할인</p>
                                        </div>
                                        <div className="space-y-4 mb-8 flex-grow">
                                            <div className="bg-white rounded-none p-3 sm:p-5 border border-slate-200">
                                                <div className="flex justify-between items-center mb-2 sm:mb-3 gap-1">
                                                    <span className="text-slate-500 font-bold text-[10px] sm:text-xs shrink-0 whitespace-nowrap">전월 30만원 실적 시</span>
                                                    <span className="text-slate-900 font-black text-[11px] sm:text-sm whitespace-nowrap">12,000원 할인</span>
                                                </div>
                                                <div className="flex justify-between items-center text-red-500 gap-1">
                                                    <span className="font-bold text-[10px] sm:text-xs shrink-0 whitespace-nowrap">첫 달 실적 없어도</span>
                                                    <span className="font-black text-[11px] sm:text-sm underline underline-offset-4 decoration-2 whitespace-nowrap">12,000원 할인</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 px-1">
                                                <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                    <span className="text-slate-500">전월 30만원 ↑</span>
                                                    <span className="text-slate-900">12,000원</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                    <span className="text-slate-500">전월 100만원 ↑</span>
                                                    <span className="text-slate-900">19,000원</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center py-4 border-t border-slate-300 mt-4">
                                                <span className="text-slate-500 font-bold text-xs">연회비</span>
                                                <span className="text-xs font-bold text-slate-900 text-right">국내외겸용 20,000원</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 mt-auto">
                                            <a href="tel:1800-0672" className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-none hover:bg-black transition-all text-sm">
                                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.587 4.587l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                                1800-0672 전화 신청
                                            </a>
                                            <a href="https://m.hanacard.co.kr/MPACMM101M.web?CD_PD_SEQ=13910" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-sono-primary text-white font-bold py-4 rounded-none hover:bg-blue-600 transition-all text-sm">
                                                온라인 신청
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { 
                                        const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                        if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 32 : el.clientWidth; el.scrollBy({ left: w, behavior: 'smooth' }); }
                                    }} 
                                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-slate-950/80 hover:bg-slate-950 text-amber-500 hover:text-amber-400 p-2 rounded-full shadow-lg border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 focus:outline-none md:hidden" 
                                    aria-label="Next"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                </button>
                            </div>
                            <div className="w-full mt-16">
                                <div className="bg-slate-900 p-6 md:p-10 rounded-none border border-slate-800 shadow-xl text-white">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="text-left">
                                            <h4 className="text-lg md:text-xl font-black text-white mb-2 tracking-tight">카드 발급 후 꼭 확인하세요!</h4>
                                            <p className="text-slate-300 text-sm md:text-base font-bold leading-relaxed break-keep">제휴카드를 발급받으신 후, 반드시 <span className="text-amber-400 underline underline-offset-4">자동이체 결제 수단을 해당 카드로 변경</span>하셔야 혜택이 적용됩니다.</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsTransferModalOpen(true)}
                                            className="w-full md:w-auto shrink-0 bg-sono-primary text-white font-bold px-8 py-4 md:py-5 rounded-none hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2 text-base md:text-lg"
                                        >
                                            자동이체 변경 안내
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-10 space-y-3">
                                    <p className="text-[11px] md:text-xs text-[#8b95a1] font-bold leading-relaxed">※ 전월 실적 제외 항목 : 장/단기 카드대출, 무이자할부, 아파트관리비, 국세/지방세/관세, 수수료, 이자, 연회비 등</p>
                                    <p className="text-[11px] md:text-xs text-[#8b95a1] font-bold leading-relaxed">※ 제휴카드 관련 문의는 해당 카드사 고객센터로 문의하세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
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

                        <div className="relative group md:block">
                            <button 
                                onClick={(e) => { 
                                    const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                    if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 32 : el.clientWidth; el.scrollBy({ left: -w, behavior: 'smooth' }); }
                                }} 
                                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none md:hidden" 
                                aria-label="Previous"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <div style={{ scrollSnapType: 'x mandatory' }} className="flex w-full overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-6 pb-6 md:pt-6 md:pb-0 px-0 md:px-0 scroll-px-0 md:scroll-px-0 gap-8 md:gap-10 mb-20 md:mb-32">
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
                            <button 
                                onClick={(e) => { 
                                    const el = e.currentTarget.closest('.relative')?.querySelector('.overflow-x-auto'); 
                                    if (el) { const card = el.querySelector(':scope > div'); const w = card ? card.getBoundingClientRect().width + 32 : el.clientWidth; el.scrollBy({ left: w, behavior: 'smooth' }); }
                                }} 
                                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-slate-400 hover:text-slate-600 p-2 rounded-full shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 focus:outline-none md:hidden" 
                                aria-label="Next"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>                        <div className="w-full animate-fade-in mt-16">
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


                {/* 의전 서비스 상세 구성 (샤프한 직각 사각형 스타일) */}
                <section className="py-16 md:py-24 bg-slate-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
                        <div className="text-center mb-12">
                            <span className="bg-slate-900 text-white font-black text-xs px-4 py-2 rounded-none mb-3 inline-block uppercase tracking-wider">SERVICE DETAILS</span>
                            <h2 className="section-title">의전 서비스 상세 구성</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* 고인용품 (입관/수시) */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm">
                                <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800">
                                    고인용품 (입관/수시)
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">관</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                            <p>오동나무 45mm (매장)</p>
                                            <p>오동나무 18mm/유골함 (화장)</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">수의</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                            <p>대마 100% 기계직</p>
                                            <p className="text-[#8b95a1] font-bold text-[11px]">(꽃관보/도우미 대체 가능)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 입관용품 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm">
                                <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800">
                                    입관용품
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">의류</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                            도포, 원삼, 천금, 지금<br />(수의와 동일 제품)
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">기타</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                            명정, 관보, 베개, 습신 등<br />규격품 일체 제공
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 빈소 및 기타용품 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm">
                                <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800">
                                    빈소 및 기타용품
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">빈소내 용품</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                            향, 양초, 부의록, 위패 등<br />필요량 일체 제공
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">대여/기타</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                            향로, 촛대 (대여)<br />완장, 상장, 장갑 (제공)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 의전 및 제단 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm">
                                <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800">
                                    의전 및 제단
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">현대식 상복</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                            검정 양복 / 개량 한복<br />
                                            <span className="text-[#11326c] font-bold">각 5벌 (남녀 무관)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">꽃장식</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                            헌화용 국화 30송이, 꽃바구니 2개<br />
                                            <span className="text-red-500 font-bold">(제단 꽃장식 제외)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 차량지원 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm">
                                <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800">
                                    차량지원
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">이송차량</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                            관내 (시, 군내) 무료 제공
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">유족버스/<br />리무진</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium leading-relaxed">
                                            왕복 300km 제공<br />
                                            <span className="text-[#11326c] font-bold">택 1 (초과시 별도)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 인력지원 */}
                            <div className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-sm">
                                <div className="bg-slate-900 text-white px-5 py-3.5 font-bold text-sm md:text-base border-b border-slate-800">
                                    인력지원
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">장례지도사</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                            국가공인 지도사 <span className="font-bold text-[#11326c] text-base">1명</span>
                                            <p className="text-[#8b95a1] text-[11px] font-bold mt-0.5">(입관 및 행사 진행)</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-3">
                                        <span className="font-bold text-[#11326c] flex-shrink-0 text-xs md:text-sm">의전도우미</span>
                                        <div className="text-right text-xs md:text-sm text-sono-dark font-medium">
                                            전문 도우미 <span className="font-bold text-[#11326c] text-base">5명</span>
                                            <p className="text-[#8b95a1] text-[11px] font-bold mt-0.5">(접객 및 빈소 관리)</p>
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

                                {/* GC케어 헬스케어서비스 (초록/오렌지 그라데이션 + 파트너 로고 + 업계최초 라벨 + 밝은 박스/표 + 하단 링크 적용) */}
                <section id="gccare" className="py-20 md:py-32 bg-gradient-to-b from-[#0a351d] via-[#051c0e] to-[#010904] text-white border-t border-slate-900 relative overflow-hidden text-left scroll-mt-10">
                    {/* 추가적인 초록색 및 오렌지색 그라데이션 빛 효과 */}
                    <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[140px] pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/15 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-1/4 right-10 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        {/* 헤더 */}
                        <div className="text-center mb-16 md:mb-24">
                            {/* NEW 라벨 */}
                            <div className="mb-6">
                                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full border border-emerald-500/30 uppercase tracking-widest inline-block animate-pulse">
                                    ★ NEW
                                </span>
                            </div>

                            {/* 소노아임레디 x GC케어 로고 파트너십 */}
                            <div className="flex items-center justify-center gap-4 md:gap-5 mb-8 flex-wrap">
                                <img 
                                    src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785909883/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_BI_3_w_mpxzbh.png" 
                                    alt="소노아임레디" 
                                    className="h-6 md:h-8 object-contain" 
                                />
                                <span className="text-emerald-500/60 text-lg md:text-xl font-bold">×</span>
                                <img 
                                    src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785909760/logo_gc_wh_zmguys.png" 
                                    alt="GC케어" 
                                    className="h-6 md:h-8 object-contain" 
                                />
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 animate-fade-in">
                                GC케어 헬스케어서비스
                            </h2>
                            <p className="text-emerald-400 text-lg md:text-xl font-bold max-w-3xl mx-auto leading-relaxed break-keep">
                                평소 건강관리부터<br className="md:hidden" /> 중대질환 이후의 회복까지
                            </p>
                            <p className="text-slate-300 text-sm md:text-base font-medium max-w-2xl md:max-w-5xl mx-auto mt-4 leading-relaxed break-keep">
                                건강상담과 병원예약은 물론, 중대질환 발생 시 간호사 병원 동행·간병·생활지원까지 전문적이고 따뜻한 케어를 약속합니다.
                            </p>
                        </div>

                        {/* 1. 평상시 건강관리 */}
                        <div className="mb-24">
                            <div className="text-left mb-8 border-l-4 border-emerald-500 pl-4">
                                <h3 className="text-xl md:text-2xl font-black text-white">01. 평상시 건강관리</h3>
                                <p className="text-slate-300 text-xs md:text-sm font-bold mt-1">가입 구좌와 관계없이 다양하고 전문적인 건강관리 서비스를 자유롭게 이용하실 수 있습니다.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {[
                                    {
                                        title: "전문간호사·전문의 건강상담",
                                        desc: "24시간 365일 언제든 전문 의료진과의 1:1 맞춤형 건강 상담 서비스 제공",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911342/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_32_1_1_rzcp61.png"
                                    },
                                    {
                                        title: "대형병원 진료예약 및 명의 안내",
                                        desc: "전국 주요 대학병원 및 대형병원 진료 예약 대행 및 최적의 분야별 명의 추천 안내",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911342/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_32_2_1_jyu0db.png"
                                    },
                                    {
                                        title: "건강검진 컨설팅 및 우대예약",
                                        desc: "개인별 맞춤형 검진 프로그램 설계 및 제휴 검진센터 최우대 우대 할인 예약 지원",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911342/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_32_3_1_xa3lms.png"
                                    },
                                    {
                                        title: "건강기능식품 구매우대",
                                        desc: "전문가가 엄선한 검증된 건강기능식품을 아임레디 회원 전용 특별 할인가로 제공",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911342/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_33_4_1_rk2xiq.png"
                                    },
                                    {
                                        title: "뷰티클리닉 예약 및 우대",
                                        desc: "제휴 메디컬 에스테틱 및 유명 뷰티 클리닉 우대 가격 혜택 및 예약 컨시어지",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911343/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_33_5_1_rn4vfy.png"
                                    },
                                    {
                                        title: "건강정보 월 1회 제공",
                                        desc: "계절별, 연령별 맞춤형 예방 의학 정보 및 전문 트렌드 건강 레터를 모바일로 매월 발송",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911342/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_34_6_1_wkcumd.png"
                                    },
                                    {
                                        title: "9대 백신 접종 우대",
                                        desc: "독감, 대상포진, 자궁경부암 등 필수 9대 주요 백신 접종의 협약 병원 우대 혜택",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911343/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_34_8_1_mljpfx.png"
                                    },
                                    {
                                        title: "해외 중입자치료 컨시어지",
                                        desc: "꿈의 암 치료로 불리는 일본 중입자치료 전문 코디네이션 및 현지 이송/치료 컨시어지",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911342/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_34_7_1_hhjyii.png"
                                    },
                                    {
                                        title: "건강 안부콜 분기 1회",
                                        desc: "부모님 및 실버 가구 대상 분기별 전문 간호사의 건강 체크 통화 및 케어 피드백 안부콜",
                                        img: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785911342/ChatGPT_Image_2026%EB%85%84_8%EC%9B%94_5%EC%9D%BC_%EC%98%A4%ED%9B%84_03_25_35_9_1_y4dcvo.png"
                                    }
                                ].map((item, index) => (
                                    <div key={index} className="flex flex-col bg-white overflow-hidden shadow-lg border border-slate-100 hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="aspect-[16/10] overflow-hidden relative">
                                            <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-all duration-500" />
                                        </div>
                                        <div className="p-3 sm:p-5 text-left flex-grow flex flex-col justify-center">
                                            <h4 className="font-black text-slate-900 text-xs sm:text-base md:text-lg mb-1 leading-snug group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                                            <p className="text-slate-500 text-[10px] sm:text-xs font-semibold leading-relaxed line-clamp-2">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-400 text-[11px] text-left mt-3 font-semibold">※ 검진비·진료비·백신비·제품 구매비·해외 치료비 등 실제 의료 관련 직접 실비는 고객 본인 부담입니다.</p>
                        </div>

                        {/* 2. 구좌별 중대질환 지원 */}
                        <div className="mb-24">
                            <div className="text-left mb-8 border-l-4 border-emerald-500 pl-4">
                                <h3 className="text-xl md:text-2xl font-black text-white">02. 구좌별 중대질환 지원</h3>
                                <p className="text-slate-300 text-xs md:text-sm font-bold mt-1">중대질환 진단 시 가입하신 구좌 수에 따라 맞춤형 전문 집중 케어가 차등 지원됩니다.</p>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 bg-white shadow-xl">
                                <table className="w-full text-left border-collapse text-xs md:text-sm whitespace-nowrap md:whitespace-normal">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                                            <th className="p-4 font-black w-2/5">지원 서비스</th>
                                            <th className="p-4 font-black text-center w-1/5">기본 (1구좌)</th>
                                            <th className="p-4 font-black text-center w-1/5">플러스 (2구좌)</th>
                                            <th className="p-4 font-black text-center w-1/5">프리미엄 (3구좌)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                                        {[
                                            { name: "간호사 병원 동행", desc: "치료 시 전문 간호사가 직접 내방하여 동행 서비스 제공", t1: "2회", t2: "4회", t3: "6회" },
                                            { name: "전문 간병인 지원", desc: "수술/입원 시 전문 간병인을 파견하여 집중 수발 지원", t1: "3일", t2: "6일", t3: "9일" },
                                            { name: "차량 에스코트", desc: "이송이 필요한 경우 전용 기사 및 고급 차량 에스코트 제공", t1: "-", t2: "2회", t3: "4회" },
                                            { name: "가사도우미 지원", desc: "가정 복귀 후 빠른 회복을 위한 가사 대행 서비스 제공", t1: "-", t2: "1회", t3: "2회" },
                                            { name: "정리수납 서비스", desc: "쾌적하고 위생적인 요양 환경을 위한 실내 정리정돈 수납 서비스", t1: "-", t2: "1회", t3: "2회" },
                                            { name: "케어스테이", desc: "요양 및 힐링 케어를 위한 엄선된 숙박 요양 서비스 지원", t1: "-", t2: "-", t3: "1박" }
                                        ].map((row, index) => (
                                            <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4 text-left border-r border-slate-100">
                                                    <div className="font-black text-slate-900 text-sm md:text-base mb-0.5">{row.name}</div>
                                                    <div className="text-slate-400 text-[11px] font-medium leading-relaxed">{row.desc}</div>
                                                </td>
                                                <td className="p-4 text-center border-r border-slate-100 text-slate-500">{row.t1}</td>
                                                <td className="p-4 text-center border-r border-slate-100 text-emerald-600 font-extrabold">{row.t2}</td>
                                                <td className="p-4 text-center text-amber-600 font-black">{row.t3}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-slate-400 text-[11px] text-left mt-3 font-semibold">※ 실제 중대질환 진단 확인(진단서 발급 등) 후 서비스 이용이 개시될 수 있으며, 서비스별 제공 세부 요건이 별도로 적용됩니다.</p>
                        </div>

                        {/* 3 & 4. 이용 대상 및 방법 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                            {/* 이용 대상 및 기간 */}
                            <div className="bg-white border border-slate-200 p-8 shadow-xl text-slate-800 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-5 bg-emerald-500"></span>
                                        이용 대상 및 기간
                                    </h3>
                                    <ul className="space-y-4 text-xs md:text-sm font-semibold text-slate-600">
                                        <li className="flex items-start gap-3">
                                            <span className="text-emerald-500 mt-0.5">✓</span>
                                            <span><strong>서비스 자격 기준</strong>: 기본(1구좌), 플러스(2구좌), 프리미엄(3구좌) 가입 고객 대상</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-emerald-500 mt-0.5">✓</span>
                                            <span><strong>이용 범위</strong>: 가입자 본인 및 직계가족 중 사전 지정된 1인에 한함 (양도 불가능)</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-emerald-500 mt-0.5">✓</span>
                                            <span><strong>서비스 개시</strong>: 상품 가입 후 <strong>6회차 정상 납부 완료</strong> 후 익월 1일부터 개시</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-emerald-400 mt-0.5">✓</span>
                                            <span><strong>제공 기간</strong>: 서비스 개시일로부터 <strong>총 24개월간</strong> 혜택 이용 가능</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="border-t border-slate-100 pt-6 mt-6">
                                    <p className="text-slate-400 text-[11px] leading-relaxed">※ 직계가족 혜택 지정은 서비스를 처음 이용하실 때 공식 등록 절차를 통해 지정하며, 1회 등록 완료 후에는 타인으로 절대 변경하실 수 없습니다.</p>
                                </div>
                            </div>

                            {/* 이용 방법 및 콜센터 */}
                            <div className="bg-white border border-slate-200 p-8 shadow-xl text-slate-800 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-5 bg-emerald-500"></span>
                                        서비스 이용 방법
                                    </h3>
                                    {/* 스텝 프로세스 */}
                                    <div className="relative flex justify-between items-center gap-2 mb-8 before:content-[''] before:absolute before:left-0 before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-slate-200 before:z-0">
                                        {[
                                            { step: "1", name: "알림톡 확인" },
                                            { step: "2", name: "콜센터 신청" },
                                            { step: "3", name: "간호사 상담" },
                                            { step: "4", name: "서비스 제공" }
                                        ].map((item, idx) => (
                                            <div key={idx} className="relative z-10 flex flex-col items-center bg-white px-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs mb-1.5 shadow-md">
                                                    {item.step}
                                                </div>
                                                <span className="text-[10px] md:text-xs font-bold text-slate-700 whitespace-nowrap">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">GC케어 전용 헬스콜센터</div>
                                            <a href="tel:1577-1898" className="text-2xl md:text-3xl font-black text-emerald-600 hover:text-emerald-700 hover:underline">1577-1898</a>
                                        </div>
                                        <div className="text-[11px] font-semibold text-slate-500 sm:text-right">
                                            <div>평일 오전 9시 ~ 오후 6시</div>
                                            <div className="text-slate-400">토·일요일 및 법정 공휴일 휴무</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-6 mt-6">
                                    <p className="text-slate-400 text-[11px] leading-relaxed">※ 본 서비스는 소노아임레디 상조상품 가입 고객에 한해 제공되는 제휴 부가서비스입니다.<br />※ 월 납입 미납 또는 구좌 중도 해약 시 익월부터 즉시 서비스 제공이 중단되거나 서비스 등급이 변경될 수 있습니다.</p>
                                </div>
                            </div>
                        </div>

                        {/* 하단 바로가기 및 상세설명서 다운로드 버튼 그룹 */}
                        <div className="mt-16 pt-10 border-t border-emerald-950/30 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href="https://www.gccare.net/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30 px-6 py-3 rounded text-sm transition-all w-full sm:w-auto"
                            >
                                <span>GC헬스케어 홈페이지 바로가기</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <a 
                                href="https://gclifecare.com/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30 px-6 py-3 rounded text-sm transition-all w-full sm:w-auto"
                            >
                                <span>GC라이프케어몰 바로가기</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <a 
                                href="/hoon/(GC%EC%BC%80%EC%96%B4)%20%ED%97%AC%EC%8A%A4%EC%BC%80%EC%96%B4%EC%84%9C%EB%B9%84%EC%8A%A4%20%ED%95%B4%EC%84%A4%EC%A7%91%20(%EA%B5%90%EC%9C%A1%EC%9E%90%EB%A3%8C).pdf" 
                                download="(GC케어) 헬스케어서비스 해설집 (교육자료).pdf"
                                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded text-sm transition-all w-full sm:w-auto shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>GC헬스케어 상세설명서 다운로드</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* 소노그룹 멤버십 (밝은 연그레이 배경 + 6대 제휴사 카드 그리드 스타일 + 리조트 예약방법 안내박스 + 하단 대형 단일 버튼) */}
                <section className="py-20 md:py-32 bg-slate-50 border-t border-slate-200/60 text-slate-900 relative text-left">
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
                                        <span className="absolute bottom-4 right-4 bg-emerald-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow z-10">
                                            {item.highlight}
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
                            더 해피 450 ONE으로<br />어디에서도 볼 수 없는<br className="md:hidden" /> 혜택을 받아가세요
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
                                            <span>전환 전담 문의처: <strong>1588-2227</strong></span>
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
                                ) : hybridItems && hybridItems.length > 0 ? (
                                    <div className="space-y-6 text-left border-t border-gray-200 pt-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                            <h4 className="font-black text-base sm:text-lg md:text-xl text-slate-900">전환 가능 상품 목록 (총 {hybridItems.length}개)</h4>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                                                <span className="font-bold text-sono-primary border-b border-sono-primary">최신순</span>
                                                <span>•</span>
                                                <span>마감 임박순</span>
                                                <span>•</span>
                                                <span>인기순</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                             {hybridItems.map((subItem, subIdx) => {
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
                                    </div>
                                ) : null}
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

            <Footer partnerMode={partnerMode} productType="happy450" />

            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partnerName={partnerName}
                partnerId={partnerId}
                productType="happy450"
                showProductSelect={false}
                isPremiumMallMode={isPremiumMallMode}
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
