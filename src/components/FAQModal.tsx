"use client";

import { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    category: string;
    items: FAQItem[];
}

const faqData: FAQCategory[] = [
    {
        category: "가입 및 일반",
        items: [
            { question: "가입 시 나이 제한이 있나요?", answer: "만 19세부터 만 70세까지 가입 가능합니다. 단, 상품에 따라 가입 연령이 다를 수 있으므로 상세 페이지를 확인해 주시기 바랍니다." },
            { question: "본인이 아닌 가족이나 타인의 이름으로 가입할 수 있나요?", answer: "네, 가능합니다. 계약자와 피계약자(대상자)를 다르게 지정하여 가입하실 수 있습니다." },
            { question: "가입 후 증서와 약관은 언제 받을 수 있나요?", answer: "가입 완료 후 영업일 기준 7~10일 이내에 우편으로 발송해 드립니다. 모바일 증서는 가입 즉시 확인 가능합니다." },
            { question: "소노아임레디 상품 가입 시 혜택은 무엇인가요?", answer: "소노호텔앤리조트 객실 및 부대시설 할인 혜택이 포함된 멤버십 서비스와 장례, 웨딩, 여행, 어학연수 등 원하는 서비스로 바꾸어 사용할 수 있는 하이브리드 서비스 혜택을 제공합니다." },
            { question: "가입 후 바로 서비스를 이용할 수 있나요?", answer: "멤버십 서비스는 가입 즉시 이용 가능합니다. 상조 등 주요 서비스는 가입 후 일정 기간 또는 납입 회차 충족 시 이용 가능하며, 중도 이용 시 잔여 납입금을 일시불로 납부하셔야 합니다." },
            { question: "법인 명의로도 가입이 가능한가요?", answer: "네, 법인 가입도 가능합니다. 법인 가입 시에는 별도의 서류(사업자등록증 등)가 필요하므로 고객센터(1588-8511)로 문의해 주시기 바랍니다." },
            { question: "여러 개의 상품을 동시에 가입할 수 있나요?", answer: "네, 1인당 최대 가입 수량 제한 범위 내에서 여러 상품 가입이 가능합니다." },
            { question: "가입 신청을 취소하고 싶어요.", answer: "가입 증서를 받은 날로부터 14일 이내에 청약철회를 하실 수 있습니다. 고객센터를 통해 신청 가능합니다." },
            { question: "연락처나 주소가 변경되었는데 어떻게 수정하나요?", answer: "홈페이지 '마이페이지'에서 직접 수정하시거나 고객센터(1588-8511)를 통해 변경 요청을 하실 수 있습니다." },
            { question: "상품 가입 확인은 어디서 하나요?", answer: "홈페이지 로그인 후 '마이페이지 > 가입내역 조회' 메뉴에서 확인 가능합니다." }
        ]
    },
    {
        category: "결제 및 납입",
        items: [
            { question: "납입금 자동이체 계좌를 변경하고 싶습니다.", answer: "홈페이지 '마이페이지 > 결제수단 변경' 메뉴에서 본인인증 후 직접 변경하시거나, 고객센터를 통해 변경 가능합니다." },
            { question: "신용카드로 납입 방법을 변경할 수 있나요?", answer: "네, 가능합니다. 카드 자동결제로 변경을 원하시면 마이페이지 또는 고객센터를 이용해 주세요." },
            { question: "납입을 일시 정지할 수 있나요?", answer: "납입 일시 정지 기능은 제공되지 않습니다. 미납 시 서비스 이용 및 멤버십 혜택에 제한이 있을 수 있습니다." },
            { question: "미납금이 발생했는데 어떻게 납부하나요?", answer: "다음 결제일에 합산 청구되거나, 즉시 납부를 원하실 경우 가상계좌 입금 또는 고객센터를 통한 카드 결제가 가능합니다." },
            { question: "납입 증명서(영수증) 발급이 가능한가요?", answer: "네, 마이페이지에서 납입 내역 확인 후 출력하시거나 고객센터에 요청하여 팩스 또는 이메일로 받으실 수 있습니다." },
            { question: "연말정산 시 소득공제 혜택을 받을 수 있나요?", answer: "상조 납입금은 현행법상 소득공제 대상에 해당하지 않습니다." },
            { question: "납입 기간을 연장하거나 단축할 수 있나요?", answer: "가입하신 상품의 규정된 회차에 따라 납입하셔야 하며, 임의로 기간 조정은 어렵습니다. 단, 잔여금을 일시 납부하는 것은 가능합니다." },
            { question: "카드 한도 초과로 결제가 안 되었을 때는 어떻게 되나요?", answer: "한도 초과로 결제 실패 시 재청구가 진행됩니다. 빠른 납부를 원하시면 결제 카드를 변경하시거나 상담원을 통해 결제해 주세요." },
            { question: "자동이체 날짜를 변경할 수 있나요?", answer: "네, 5일, 10일, 15일, 20일, 25일 중 선택하여 변경하실 수 있습니다." },
            { question: "현금영수증 발행이 되나요?", answer: "상조 서비스 납입금은 부가세 면세 대상으로 현금영수증 발행 대상이 아닙니다." }
        ]
    },
    {
        category: "멤버십 및 하이브리드 서비스",
        items: [
            { question: "소노호텔앤리조트 객실 예약은 어떻게 하나요?", answer: "소노아임레디 홈페이지 또는 소노호텔앤리조트 홈페이지를 통해 예약 가능합니다. (멤버십 번호 필요)" },
            { question: "멤버십 카드 발급은 어떻게 받나요?", answer: "실물 카드는 발급되지 않으며, 소노아임레디 모바일 앱 또는 웹에서 모바일 바코드 형태의 카드를 확인하여 사용하실 수 있습니다." },
            { question: "하이브리드 서비스(전환 서비스)란 무엇인가요?", answer: "가입하신 상조 서비스 대신 웨딩, 여행, 어학연수, 골프 등 다른 서비스로 바꾸어 사용할 수 있는 소노아임레디만의 차별화된 서비스입니다." },
            { question: "하이브리드 서비스 신청은 언제 해야 하나요?", answer: "서비스 이용 희망일 최소 1~3개월 전에 신청하셔야 하며, 상품별로 신청 기한이 다를 수 있으니 상세 내용을 확인해 주세요." },
            { question: "멤버십 혜택을 가족이 대신 쓸 수 있나요?", answer: "멤버십 혜택은 원칙적으로 가입자 본인 및 등록된 피계약자 범위 내에서 사용 가능합니다." },
            { question: "전환 서비스 이용 시 추가 비용이 발생하나요?", answer: "선택하신 서비스의 총액이 가입 상품의 금액을 초과하거나 별도의 옵션을 추가할 경우 차액이 발생할 수 있습니다." },
            { question: "오션월드나 스키장 할인 혜택은 어떻게 받나요?", answer: "현장 매표소에서 소노아임레디 모바일 멤버십 카드를 제시하시면 할인된 가격으로 이용하실 수 있습니다." },
            { question: "가입 상품별로 멤버십 혜택이 다른가요?", answer: "네, 가입하신 상품(프리미엄, 스탠다드 등)에 따라 제공되는 멤버십 할인율과 쿠폰 혜택이 상이합니다." },
            { question: "리조트 객실 할인은 1년에 몇 번까지 가능한가요?", answer: "상품별로 연간 이용 횟수 제한이 있을 수 있으며, 통상적으로 연 10~20박 범위 내에서 제공됩니다." },
            { question: "골프 서비스로 전환하고 싶습니다.", answer: "고객센터를 통해 골프 하이브리드 서비스 신청을 하시면 담당 부서에서 상담 및 예약을 도와드립니다." }
        ]
    },
    {
        category: "해약 및 변경",
        items: [
            { question: "중도 해약 시 환급금은 얼마인가요?", answer: "해약 환급금은 공정거래위원회 '선불식 할부계약의 해약환급금 산정기준'에 따르며, 납입 회차에 따라 차등 적용됩니다. (가입 초기 해지 시 환급금이 없을 수 있습니다.)" },
            { question: "해약 신청 시 필요한 서류는 무엇인가요?", answer: "본인 신분증 사본, 통장 사본, 해약 신청서 등이 필요합니다." },
            { question: "명의 변경(양도/양수)이 가능한가요?", answer: "네, 양도인과 양수인 모두의 동의가 있으면 가능하며 소정의 수수료가 발생할 수 있습니다." },
            { question: "개명을 했는데 성함 변경은 어떻게 하나요?", answer: "초본 등 증빙 서류를 고객센터로 제출해 주시면 변경 처리해 드립니다." },
            { question: "상품을 변경(업그레이드 또는 다운그레이드)할 수 있나요?", answer: "기존 상품 해약 후 재가입 방식으로 진행되거나, 상품에 따라 제한적으로 변경 가능할 수 있으니 상담이 필요합니다." },
            { question: "납입을 완료했는데 해약하면 전액 돌려받나요?", answer: "만기 완납 후 일정 기간이 경과해야 100% 환급이 가능한 상품이 많으므로, 가입하신 약관의 환급금 표를 반드시 확인하시기 바랍니다." },
            { question: "해약 환급금은 언제 입금되나요?", answer: "서류 접수 완료 후 영업일 기준 3일 이내에 지정하신 계좌로 입금됩니다." },
            { question: "청약철회와 해약의 차이점이 무엇인가요?", answer: "청약철회는 가입 초기(14일 이내)에 계약을 무효화하고 전액 환불받는 것이며, 해약은 그 이후에 계약을 종료하는 것으로 위약금이 발생할 수 있습니다." },
            { question: "미납 상태에서도 해약할 수 있나요?", answer: "가능합니다. 다만 미납된 금액을 제외한 실제 납입 금액을 기준으로 환급금이 산정됩니다." },
            { question: "온라인으로 직접 해약 신청을 할 수 있나요?", answer: "본인 확인 및 환급금 안내를 위해 해약은 고객센터 상담원 연결을 통해서만 가능합니다." }
        ]
    },
    {
        category: "장례 및 긴급 상황",
        items: [
            { question: "장례가 발생했을 때 어디로 연락해야 하나요?", answer: "24시간 긴급 장례 접수 번호(1588-2227)로 연락하시면 즉시 장례 지도사가 출동합니다." },
            { question: "장례 서비스 이용 시 어떤 것들이 제공되나요?", answer: "전문 장례 지도사, 도우미 파견, 수의, 관, 장구류 일체, 고인 전용 운구 차량 등이 상품 구성에 따라 제공됩니다." },
            { question: "장지(장묘) 안내 서비스도 받을 수 있나요?", answer: "네, 수도권 및 전국 주요 장지(봉안당, 수목장 등)에 대한 정보 제공 및 할인 연계 상담을 지원합니다." },
            { question: "타 상조 상품과 중복 사용이 가능한가요?", answer: "장례 서비스 자체는 1회 행사로 마무리되므로 중복 사용은 어렵지만, 각각 다른 피계약자를 지정하여 사용하실 수는 있습니다." },
            { question: "제공되는 물품 중 사용하지 않은 품목은 환불되나요?", answer: "상품에 따라 미사용 물품에 대한 공제 혜택이 있을 수 있으나, 패키지 구성상 환불이 불가한 항목도 있으니 행사 시 확인 바랍니다." },
            { question: "장례 도우미 추가 시 비용은 얼마인가요?", answer: "규정된 시간 외 추가 시 또는 인원 추가 시 시간당/인당 추가 비용이 발생합니다." },
            { question: "관이나 수의를 본인이 준비한 경우 차감 혜택이 있나요?", answer: "네, 규정에 따라 일정 금액을 차감해 드립니다." },
            { question: "전국 어디서나 서비스 이용이 가능한가요?", answer: "네, 도서산간 지역을 제외한 전국 어디서나 동일한 서비스를 제공합니다." },
            { question: "종교별로 장례 절차가 다른데 맞춰주시나요?", answer: "기독교, 불교, 천주교 등 각 종교에 맞는 전문 장례 절차와 비품을 준비해 드립니다." },
            { question: "소노아임레디 가입자가 아니어도 서비스를 이용할 수 있나요?", answer: "가입자가 지정한 피계약자라면 누구든 이용 가능합니다. 비가입자의 경우 즉시 가입 상품을 통해 이용하실 수 있습니다." }
        ]
    },
    {
        category: "홈페이지 및 앱 이용",
        items: [
            { question: "아이디와 비밀번호를 잊어버렸습니다.", answer: "로그인 화면의 '아이디 찾기' 및 '비밀번호 재설정' 기능을 통해 본인인증 후 찾으실 수 있습니다." },
            { question: "홈페이지에서 가입 내역이 조회가 안 됩니다.", answer: "오프라인이나 제휴처를 통해 가입하신 경우 홈페이지 회원가입 및 본인인증을 완료해야 내역 조회가 가능합니다." },
            { question: "모바일 앱은 어디서 다운로드 하나요?", answer: "구글 플레이스토어 또는 애플 앱스토어에서 '소노아임레디'를 검색하여 설치하실 수 있습니다." },
            { question: "회원 탈퇴를 하고 싶습니다.", answer: "홈페이지 '마이페이지 > 회원탈퇴' 메뉴에서 가능합니다. 단, 상품 가입 고객은 탈퇴 전 해약 여부를 확인하셔야 합니다." },
            { question: "비밀번호를 변경하고 싶어요.", answer: "'마이페이지 > 개인정보수정' 메뉴에서 안전한 비밀번호로 변경 가능합니다." },
            { question: "사이트 이용 중 오류가 발생합니다.", answer: "사용 중인 브라우저의 캐시를 삭제하거나, 크롬(Chrome) 브라우저 사용을 권장합니다. 지속될 경우 고객센터로 문의 바랍니다." },
            { question: "이메일 수신 동의/거부는 어떻게 하나요?", answer: "개인정보수정 메뉴에서 마케팅 수신 동의 여부를 변경하실 수 있습니다." },
            { question: "1:1 상담 문의 답변은 어디서 확인하나요?", answer: "'마이페이지 > 1:1 상담 내역'에서 확인 가능하며, 답변 완료 시 알림 문자(LMS)를 보내드립니다." },
            { question: "홈페이지 결제는 안전한가요?", answer: "네, 암호화된 보안 솔루션과 공인된 결제창을 사용하여 고객님의 금융 정보를 안전하게 보호합니다." },
            { question: "법인 회원은 홈페이지 이용이 불가능한가요?", answer: "현재 홈페이지 서비스는 개인 회원 위주로 구성되어 있어, 법인 가입 고객은 고객센터를 통해 안내받으시는 것이 정확합니다." }
        ]
    },
    {
        category: "기타 및 상세 안내",
        items: [
            { question: "'버킷마켓'을 통해 가입했는데 혜택이 동일한가요?", answer: "네, 버킷마켓은 소노아임레디의 공식 제휴 가입 채널로 제공되는 서비스 혜택은 동일합니다." },
            { question: "신규 상품 출시 알림을 받고 싶습니다.", answer: "카카오톡 플러스친구 '소노아임레디'를 추가하시면 신규 상품 및 이벤트 소식을 빠르게 받으실 수 있습니다." },
            { question: "상조 가입 시 사은품(가전 등)을 받았는데 해지하면 어떻게 되나요?", answer: "가전 결합 상품의 경우 중도 해지 시 가전제품에 대한 잔여 할부금을 일시에 납부하셔야 합니다." },
            { question: "소노아임레디는 믿을 수 있는 회사인가요?", answer: "네, 소노아임레디는 상조보증공사와의 예치 계약을 통해 고객 납입금을 안전하게 보호하고 있으며, 대명소노그룹의 계열사로 탄탄한 자본력을 갖추고 있습니다." },
            { question: "상담원 연결 가능 시간은 언제인가요?", answer: "평일 오전 9시부터 오후 6시까지 운영됩니다. (주말 및 공휴일 제외)" },
            { question: "해외 거주자도 가입할 수 있나요?", answer: "한국 내 결제 수단(계좌, 카드)과 본인인증이 가능한 휴대전화가 있다면 가입 가능하지만, 서비스 이용은 국내로 제한될 수 있습니다." },
            { question: "만기 납입 후 서비스를 이용하지 않으면 어떻게 되나요?", answer: "만기 완납 후 서비스를 이용하지 않고 해약 신청을 하시면, 상품 규정에 따라 납입 원금 전액(100%)을 환급받으실 수 있습니다." },
            { question: "이벤트 경품은 언제 배송되나요?", answer: "이벤트별로 상이하나 통상 당첨자 발표 후 2주 이내에 발송됩니다." },
            { question: "제휴 카드 할인 혜택은 어떻게 받나요?", answer: "전용 제휴 카드를 발급받아 납입금을 자동결제하고 전월 실적 조건을 충족하면 청구 할인 혜택이 적용됩니다." },
            { question: "소노아임레디 고객센터 전화번호가 무엇인가요?", answer: "대표 번호 1588-8511 입니다." }
        ]
    }
];

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>(faqData[0].category);

    if (!isOpen) return null;

    const toggleAccordion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
            <div 
                className="absolute inset-0 bg-sono-dark/60 backdrop-blur-sm animate-fade-in" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-sono-dark tracking-tight">자주하는 질문</h2>
                        <p className="text-[#8b95a1] font-bold text-sm mt-1">궁금하신 내용을 카테고리별로 확인해 보세요.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-gray-50 text-[#8b95a1] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 카테고리 탭 */}
                <div className="flex overflow-x-auto no-scrollbar border-b border-gray-100 bg-gray-50/50 px-4 py-2">
                    {faqData.map((cat) => (
                        <button
                            key={cat.category}
                            onClick={() => setActiveCategory(cat.category)}
                            className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-black transition-all ${
                                activeCategory === cat.category 
                                ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20" 
                                : "text-[#8b95a1] hover:text-sono-primary hover:bg-white"
                            }`}
                        >
                            {cat.category}
                        </button>
                    ))}
                </div>

                {/* 리스트 영역 */}
                <div className="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar">
                    <div className="space-y-4">
                        {faqData.find(c => c.category === activeCategory)?.items.map((item, idx) => {
                            const id = `${activeCategory}-${idx}`;
                            const isOpen = openIndex === id;

                            return (
                                <div 
                                    key={id}
                                    className={`group border rounded-2xl transition-all duration-300 ${
                                        isOpen ? "border-sono-primary bg-sono-primary/[0.02] shadow-sm" : "border-gray-100 hover:border-gray-200"
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleAccordion(id)}
                                        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className={`text-lg font-black mt-0.5 ${isOpen ? "text-sono-primary" : "text-[#8b95a1]"}`}>Q.</span>
                                            <span className={`text-base md:text-lg font-bold leading-snug break-keep ${isOpen ? "text-sono-dark" : "text-[#4e5968] group-hover:text-sono-dark"}`}>
                                                {item.question}
                                            </span>
                                        </div>
                                        <div className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-sono-primary" : "text-[#8b95a1]"}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="px-5 md:px-6 pb-6 animate-fade-in">
                                            <div className="flex items-start gap-4 pt-4 border-t border-sono-primary/10">
                                                <span className="text-lg font-black text-sono-gold mt-0.5">A.</span>
                                                <p className="text-sm md:text-base text-[#6b7684] font-medium leading-relaxed break-keep">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 푸터 */}
                <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[#8b95a1] text-sm font-bold">
                        찾으시는 내용이 없으신가요? 
                        <span className="text-sono-primary ml-2">고객센터(1588-8511)</span>로 문의해 주시면 친절히 안내해 드리겠습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
