import { Header, Footer } from "@/components/layout";
import Link from "next/link";

export default function HomePage() {
    return (
        <>
            <Header />
            <main>
                {/* 히어로 섹션 */}
                <section
                    className="relative min-h-[95vh] flex items-center bg-sono-dark overflow-hidden pt-12"
                    style={{
                        backgroundImage: 'url("https://raw.githubusercontent.com/jihoon3813-commits/img_sono/ba129da43419b13c6e6fe3df92fc852b3f2e6abf/Generated%20Image%20January%2022%2C%202026%20-%203_23PM.jpeg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* 오버레이: 왼쪽 텍스트 영역을 더 어둡게 하여 대비 극대화 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sono-dark/80 via-sono-dark/40 to-transparent z-0"></div>
                    <div className="absolute inset-0 bg-black/20 z-0"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20 relative z-10 w-full">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="animate-fade-in">
                                <div className="inline-block bg-sono-primary text-white border border-white/20 mb-6 px-4 py-2 rounded-lg text-sm font-bold shadow-xl">
                                    상조를 넘어 라이프케어로
                                </div>
                                <h1 className="leading-[1.1] mb-8 tracking-tighter filter drop-shadow-2xl">
                                    <span className="block text-xl md:text-2xl lg:text-3xl mb-6 text-white/90 font-extrabold">소노아임레디 공식총판과 함께</span>
                                    <span className="text-3xl md:text-6xl lg:text-[4.5rem] font-black text-white drop-shadow-md block leading-[1.15]">
                                        <span className="block mb-2 whitespace-nowrap">파트너사의 비즈니스에</span>
                                        <span className="block mb-2">새로운 수익 모델을</span>
                                        <span className="block">도입하세요.</span>
                                    </span>
                                </h1>
                                <p className="text-xl md:text-2xl text-white mb-12 leading-relaxed max-w-2xl break-keep font-semibold drop-shadow-sm">
                                    소노아임레디 공식총판의 제휴파트너가 되어 파트너사의 회원들에게 최고의 혜택을 제공하고, 파트너사는 안정적인 수익을 확보할 수 있습니다.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <Link href="/partner/apply" className="bg-white text-sono-primary hover:bg-sono-gold hover:text-white px-10 py-5 rounded-2xl font-bold text-xl active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/20 text-center">
                                        제휴 파트너 신청하기
                                    </Link>
                                    <Link href="/products/smartcare" className="border-2 border-white/60 bg-white/10 text-white hover:bg-white/20 px-10 py-5 rounded-2xl font-bold text-xl active:scale-[0.98] transition-all duration-300 backdrop-blur-md text-center">
                                        상품 알아보기
                                    </Link>
                                </div>
                            </div>

                            <div className="hidden md:block lg:ml-auto">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-white/10 rounded-[40px] blur-2xl"></div>
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 relative z-10 animate-float rounded-[40px]">
                                        <div className="text-center mb-8">
                                            <div className="w-24 h-24 rounded-[30px] bg-white text-sono-primary mx-auto flex items-center justify-center mb-6 shadow-xl">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-white text-2xl font-bold">즉시 혜택</h3>
                                        </div>
                                        <div className="space-y-5">
                                            {[
                                                "최신 가전 지원",
                                                "제휴몰 포인트 지급",
                                                "납입금 100% 환급",
                                                "대명소노 멤버십"
                                            ].map((text, i) => (
                                                <div key={i} className="flex items-center gap-4 text-white font-bold text-lg">
                                                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <span>{text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 배경 요소 (Toss style dynamic background) */}
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                </section>

                {/* 회사소개 섹션 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6] relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">ABOUT US</span>
                            <h2 className="section-title leading-tight">
                                대명소노그룹의<br className="block md:hidden" /> 라이프케어 브랜드
                            </h2>
                            <p className="section-subtitle max-w-5xl mx-auto break-keep">
                                &quot;인생의 모든 순간이 준비될 때까지&quot;<br />
                                40년 이상의 레저 사업 노하우를 바탕으로 고객의 삶을 더욱 풍요롭게 만드는 토탈 라이프케어 서비스를 제공합니다.
                            </p>
                        </div>

                        {/* 브랜드 의미 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                            {[
                                { char: "S", label: "SONO", desc: "축적된 자산의 모든 서비스", color: "bg-sono-primary" },
                                { char: "I", label: "I'M", desc: "고객 맞춤형 서비스", color: "bg-sono-gold" },
                                { char: "R", label: "READY", desc: "항상 준비된 상태", color: "bg-sono-success" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-5 px-8 py-5 bg-white rounded-[24px] shadow-sm h-full">
                                    <span className={`w-14 h-14 rounded-[18px] ${item.color} flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                                        {item.char}
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-[#8b95a1] mb-0.5">{item.label}</p>
                                        <p className="font-bold text-sono-dark">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 주요 성과 카드 */}
                        {/* 주요 성과 카드 */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                            {[
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list01.jpg?raw=true",
                                    title: "고객 선수금 1조 돌파",
                                    subtitle: "2024 06월 기준"
                                },
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list03.jpg?raw=true",
                                    title: "자본금 100억원",
                                    subtitle: "법정 자본금(15억원)요건 6배"
                                },
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list04.jpg?raw=true",
                                    title: "대명소노그룹사",
                                    subtitle: "2024년 기준 대규모기업"
                                },
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list02.jpg?raw=true",
                                    title: "신용평가 1등급",
                                    subtitle: "기준: 2025.8.1~2025.7.31 / 상조보증공제조합"
                                }
                            ].map((item, i) => (
                                <div key={i} className="card !p-0 overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="p-6 bg-white">
                                        <p className="font-bold text-sono-dark text-lg mb-1">{item.title}</p>
                                        <p className="text-xs text-[#8b95a1] font-medium leading-relaxed">{item.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 브랜드 소개 텍스트 */}
                        <div className="max-w-4xl mx-auto mb-24 text-center">
                            <p className="text-[#4e5968] text-lg md:text-xl leading-relaxed font-medium break-keep">
                                지난 40년 이상 국내 레저사업을 이끌어온 대명소노그룹의 서비스 노하우를 바탕으로 설립된 (주)소노스테이션의 대표 브랜드 소노아임레디.
                                소노아임레디는 상조 서비스를 중심으로 여행, 교육, 웨딩 등 삶에 필요한 서비스를 제공하고 있습니다.
                                다양한 라이프케어 서비스를 소비자가 원하는 시점에 선택하여 이용할 수 있도록 항상 준비되어 있습니다.
                                소노아임레디를 통해 고객의 삶을 더욱 풍요롭게 하는 것이 우리 브랜드의 목표입니다.
                            </p>
                        </div>

                        {/* 주요 사업 영역 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {[
                                {
                                    category: "LIFE STYLE",
                                    title: "소노아임레디",
                                    desc: "상조 · 웨딩 · 여행 토탈라이프케어 서비스",
                                    logo: "https://www.sonoimready.com/assets/images/cs/logo_dm_h_dark.png"
                                },
                                {
                                    category: "HOTEL & RESORT",
                                    title: "소노호텔앤리조트",
                                    desc: "세계로 향하는 대한민국 대표 호스피탈리티 기업",
                                    logo: "https://www.sonoimready.com/assets/images/cs/logo_sono.png"
                                },
                                {
                                    category: "ENTERTAINMENTS",
                                    title: "비발디파크 오션월드/스키월드",
                                    desc: "대명소노그룹의 흥미로운 여행 액티비티\n대명소노그룹 골프, 승마, 요트, Pet, 소노 스카이거너스 프로농구단",
                                    logo: "https://www.sonoimready.com/assets/images/cs/logo_vivaldi_park.png"
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm flex flex-col min-h-[300px] text-left relative group hover:shadow-md transition-all">
                                    <div className="flex-1">
                                        <p className="text-sono-primary font-bold text-sm tracking-wider mb-3 leading-none">{item.category}</p>
                                        <h4 className="text-2xl font-black text-sono-dark mb-4 break-keep leading-tight">{item.title}</h4>
                                        <p className="text-[#8b95a1] text-sm font-medium leading-relaxed whitespace-pre-line break-keep">{item.desc}</p>
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <img src={item.logo} alt={item.title} className="h-8 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 경쟁력 - 혁신성 */}
                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            <div className="card-premium p-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-sono-gold" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                    업계 최초 혁신 서비스
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-sono-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-white font-semibold">결합상품 최초 도입</p>
                                            <p className="text-white/70 text-sm">가전+상조 결합 상품 업계 최초 출시</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-sono-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-white font-semibold">하이브리드(전환) 서비스</p>
                                            <p className="text-white/70 text-sm">상조→웨딩, 여행, 교육 등 유연한 전환</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-sono-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-white font-semibold">레디캐시</p>
                                            <p className="text-white/70 text-sm">납입금을 미리 사용할 수 있는 선지급 서비스</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="card p-8 border-2 border-sono-primary/10">
                                <h3 className="text-xl font-bold text-sono-primary mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-sono-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    주요 서비스 영역
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-sono-light rounded-lg p-4 text-center">
                                        <p className="text-2xl mb-2">🏠</p>
                                        <p className="font-semibold text-sono-primary text-sm">라이프케어</p>
                                        <p className="text-xs text-gray-500">상조, 웨딩, 여행, 교육</p>
                                    </div>
                                    <div className="bg-sono-light rounded-lg p-4 text-center">
                                        <p className="text-2xl mb-2">🏨</p>
                                        <p className="font-semibold text-sono-primary text-sm">멤버십</p>
                                        <p className="text-xs text-gray-500">소노호텔앤리조트</p>
                                    </div>
                                    <div className="bg-sono-light rounded-lg p-4 text-center">
                                        <p className="text-2xl mb-2">📺</p>
                                        <p className="font-semibold text-sono-primary text-sm">결합상품</p>
                                        <p className="text-xs text-gray-500">가전+상조 결합</p>
                                    </div>
                                    <div className="bg-sono-light rounded-lg p-4 text-center">
                                        <p className="text-2xl mb-2">💰</p>
                                        <p className="font-semibold text-sono-primary text-sm">전환 서비스</p>
                                        <p className="text-xs text-gray-500">다양한 용도로 전환</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CEO 메시지 */}
                        <div className="bg-gradient-to-r from-sono-primary to-sono-secondary rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 md:flex items-center gap-8">
                                <div className="flex-shrink-0 mb-6 md:mb-0">
                                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto md:mx-0">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-lg md:text-xl leading-relaxed mb-4 text-white/90">
                                        &quot;150만 고객의 신뢰를 바탕으로, 단순한 상조 기업을 넘어 <span className="text-sono-gold font-semibold">고객의 인생 전반을 함께하는 든든한 버팀목</span>이자 새로운 시도를 멈추지 않는 혁신 기업이 될 것입니다.&quot;
                                    </p>
                                    <p className="text-white/70 text-sm">— 최성훈 대표이사, (주)소노스테이션</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 상품 소개 섹션 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">PRODUCTS</span>
                            <h2 className="section-title">소노아임레디 상품 라인업</h2>
                            <p className="section-subtitle max-w-2xl mx-auto">
                                제휴 파트너 채널을 통해 판매 가능한 2가지 프리미엄 상품을 제공합니다.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            {/* 더 해피 450 ONE */}
                            <div className="card group border border-gray-100 hover:border-gray-200 bg-[#f9fafb] !p-10">
                                <div className="mb-8">
                                    <div className="w-16 h-16 rounded-[20px] bg-sono-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-sono-dark mb-3 tracking-tight">더 해피 450 ONE</h3>
                                    <span className="badge-primary">일반상조</span>
                                </div>
                                <p className="text-[#6b7684] text-lg mb-8 leading-relaxed font-medium">
                                    기본 상조 서비스와 함께 레디캐시, 소노그룹 멤버십,
                                    납입금 100% 환급 혜택을 제공하는 기본 상품입니다.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        "제휴몰 포인트 지급",
                                        "레디캐시 적립",
                                        "납입금 100% 환급 (만기 시)"
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sono-dark font-bold">
                                            <svg className="w-6 h-6 text-sono-success" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                                    <span className="text-lg font-bold text-[#8b95a1]">월 18,000원부터</span>
                                    <Link href="/products/happy450" className="text-sono-primary font-bold hover:brightness-110 transition-all flex items-center gap-1 text-lg">
                                        자세히 보기
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* 스마트케어 */}
                            <div className="card-premium group !p-10 relative overflow-hidden">
                                <div className="absolute top-6 right-6">
                                    <span className="badge bg-white/20 text-white backdrop-blur-md px-3 py-1.5 rounded-lg font-bold">BEST</span>
                                </div>
                                <div className="mb-8">
                                    <div className="w-16 h-16 rounded-[20px] bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">스마트케어</h3>
                                    <span className="badge-gold">가전결합상조</span>
                                </div>
                                <p className="text-white/80 text-lg mb-8 leading-relaxed font-medium">
                                    삼성/LG 최신 가전제품 지원과 함께 포인트, 상조 서비스,
                                    납입금 100% 환급까지 모든 혜택을 담은 프리미엄 상품입니다.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        "삼성/LG 최신 가전 지원",
                                        "제휴몰 포인트 지급",
                                        "납입금 100% 환급 (만기 시)",
                                        "4가지 플랜 (실속형~프리미엄)"
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-white font-bold">
                                            <svg className="w-6 h-6 text-sono-gold" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between items-center pt-8 border-t border-white/20">
                                    <span className="text-lg font-bold text-white/60">월 33,000원부터</span>
                                    <Link href="/products/smartcare" className="text-white font-bold hover:text-sono-gold transition-all flex items-center gap-1 text-lg">
                                        자세히 보기
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 중요정보 고지사항 */}
                <section className="py-20 bg-[#f9fafb]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#111] text-center mb-12">중요정보 고지사항</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* 환급기준 및 환급시기 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    환급기준 및 환급시기
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">중도해약에 대한 환급 기준은 상조서비스 약관 규정에 의해 환급됩니다.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">환급금은 신청완료일로부터 3영업일 이내에 수령하실 수 있습니다.</p>
                                    </li>
                                </ul>
                            </div>

                            {/* 총 고객환급의무액 및 자산 현황 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    총 고객환급의무액 및 자산 현황
                                </h3>
                                <div className="bg-blue-50/50 rounded-xl p-5 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:border-r sm:border-blue-100 sm:pr-6">
                                        <p className="text-xs font-bold text-gray-500 mb-1">총 고객환급의무액</p>
                                        <p className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">1,068,990,831천원</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-1">상조 관련 자산</p>
                                        <p className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">1,221,786,713천원</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">* 2024년 12월말 기준, 공인회계사 회계감사를 완료하였습니다.</p>
                            </div>

                            {/* 고객 불입금 관리방법 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    고객 불입금 관리방법
                                </h3>
                                <div className="flex items-start gap-3">
                                    <span className="w-1.5 h-14 bg-blue-100 rounded-full shrink-0 hidden sm:block"></span>
                                    <p className="text-gray-600 font-medium leading-relaxed break-keep">
                                        [할부거래에 관한 법률] 제18조에 의거 선불식 할부거래업 등록하였으며, 동법 제27조에 따라 고객 불입금의 50%는 상조보증공제조합에 소비자피해보상을 위한 공제계약을 체결하고 있습니다.
                                    </p>
                                </div>
                            </div>

                            {/* 소비자 유의사항 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    소비자 유의사항
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">장의차량 운행 시 발생되는 도로공사 비용(통행료) 및 주차비 등은 고객 부담입니다.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">장례식장 임대료 및 접객용 음식료 등은 상품 구성에서 제외되어 있습니다.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">회비 납입 도중 행사 발생 시, 발인 전까지 잔여 회비를 일시납 하셔야 합니다.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 제휴 혜택 섹션 */}
                <section id="partnership-guide" className="py-16 md:py-32 bg-[#f2f4f6]">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">BENEFITS</span>
                            <h2 className="section-title">파트너에게 드리는 혜택</h2>
                            <p className="section-subtitle max-w-2xl mx-auto">
                                소노아임레디 공식총판의 제휴파트너가 되시면 다양한 혜택을 제공해 드립니다.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                    title: "안정적인 수익",
                                    description: "계약 건당 수수료 지급, 매월 정산으로 안정적인 수익 확보",
                                },
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                                    title: "전용 플랫폼",
                                    description: "파트너 전용 상품 페이지와 관리 시스템 무료 제공",
                                },
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                                    title: "실시간 관리",
                                    description: "계약 현황, 정산 내역을 실시간으로 확인 가능",
                                },
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />,
                                    title: "마케팅 지원",
                                    description: "홍보 배너, 상품 이미지, 안내 자료 무료 제공",
                                },
                            ].map((benefit, index) => (
                                <div key={index} className="card group hover:bg-white/80 border border-transparent shadow-none hover:shadow-lg transition-all flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-5 md:gap-0 p-6 md:p-8">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] bg-sono-primary/10 text-sono-primary flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-6 group-hover:scale-110 transition-transform font-bold">
                                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {benefit.icon}
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg md:text-xl font-bold text-sono-dark mb-1 md:mb-3 tracking-tight">{benefit.title}</h3>
                                        <p className="text-sm md:text-base text-[#6b7684] font-medium leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 수익 창출 방법 섹션 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">HOW IT WORKS</span>
                            <h2 className="section-title">파트너는 어떻게 수익을 얻나요?</h2>
                            <p className="section-subtitle max-w-3xl mx-auto">
                                복잡한 교육이나 상담 업무 없이, 상품 홍보만 하세요.<br className="hidden md:block" />
                                나머지는 저희가 모두 책임집니다.
                            </p>
                        </div>

                        {/* 주요 포인트 강조 */}
                        <div className="card-premium !p-12 md:!p-20 mb-20 text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-8 font-bold text-white">
                                    <svg className="w-5 h-5 text-sono-gold" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    핵심 포인트
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold mb-8 tracking-tighter leading-tight">
                                    상품 <span className="text-sono-gold">홍보만</span> 하세요!<br />
                                    상담과 계약은 <span className="text-sono-gold">저희가 전담</span>합니다.
                                </h3>
                                <p className="text-white/80 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                                    상품 내용을 공부하거나 TM 교육을 할 필요가 전혀 없습니다.<br />
                                    전문 상담센터에서 정확한 상품설명과 친절한 가입 안내로 전환률을 최대화합니다.
                                </p>
                            </div>
                        </div>

                        {/* 수익 프로세스 */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                            {[
                                {
                                    step: "01",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
                                    title: "상품 등록",
                                    description: "파트너 쇼핑몰에 상품을 게시합니다",
                                    highlight: "홍보만 담당"
                                },
                                {
                                    step: "02",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
                                    title: "고객 문의",
                                    description: "회원이 상품에 관심을 갖고 문의합니다",
                                    highlight: "저희가 상담 진행"
                                },
                                {
                                    step: "03",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
                                    title: "계약 체결",
                                    description: "전문 상담센터가 계약까지 완료합니다",
                                    highlight: "저희가 계약 대행"
                                },
                                {
                                    step: "04",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                    title: "수수료 정산",
                                    description: "최종 계약 건에 대해 수수료를 받습니다",
                                    highlight: "매월 정기 정산"
                                },
                            ].map((item, index) => (
                                <div key={index} className="card bg-[#f9fafb] border-none group flex flex-row md:flex-col items-start md:items-center text-left md:text-center p-6 md:p-8 gap-4 md:gap-0">
                                    <div className="flex flex-col items-center flex-shrink-0 md:mb-6">
                                        <div className="text-sono-primary text-sm font-bold mb-2 md:mb-6">{item.step}</div>
                                        <div className="w-14 h-14 rounded-2xl bg-sono-primary/10 text-sono-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {item.icon}
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-sono-dark mb-2 md:mb-3">{item.title}</h3>
                                        <p className="text-[#6b7684] font-medium mb-4 md:mb-6 leading-relaxed text-sm md:text-base">{item.description}</p>
                                        <span className="badge-primary font-bold text-xs md:text-sm inline-block">
                                            {item.highlight}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 수수료 상세 안내 (Toss style side-by-side cards) */}
                        <div className="grid lg:grid-cols-2 gap-10">
                            <div className="bg-[#f2f4f6] rounded-[32px] p-10 md:p-14">
                                <h3 className="text-2xl font-bold text-sono-dark mb-10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sono-primary/10 flex items-center justify-center text-sono-primary">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </div>
                                    수수료 지급 방식
                                </h3>
                                <ul className="space-y-8">
                                    {[
                                        { title: "월 1회 정기 지급", desc: "매월 정해진 날짜에 정기적으로 정산" },
                                        { title: "투명한 정산 체계", desc: "파트너 전용 어드민에서 실시간 확인" },
                                        { title: "자유로운 운용", desc: "수령한 수수료는 파트너사가 자유롭게 운용" }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sono-primary flex-shrink-0" />
                                            <div>
                                                <p className="text-lg font-bold text-sono-dark mb-1">{item.title}</p>
                                                <p className="text-[#6b7684] font-medium">{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[32px] p-10 md:p-14 shadow-sm">
                                <h3 className="text-2xl font-bold text-sono-dark mb-10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sono-gold/10 flex items-center justify-center text-sono-gold">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    고객 포인트 페이백
                                </h3>
                                <div className="space-y-8">
                                    <div className="p-6 bg-[#f9fafb] rounded-2xl relative">
                                        <p className="text-[#4e5968] font-bold leading-relaxed">
                                            지급받은 수수료 중 일부를 고객에게 <span className="text-sono-primary">제휴몰 전용 포인트</span>로 지급하세요.
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-sm text-[#8b95a1] font-bold">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            포인트 금액은 파트너사에서 자율적으로 결정
                                        </div>
                                    </div>
                                    <div className="p-6 bg-sono-primary/5 rounded-2xl border border-sono-primary/10">
                                        <p className="text-sono-primary font-bold">
                                            제휴몰 포인트를 통해 자연스러운 <span className="underline decoration-sono-primary/30 underline-offset-4">쇼핑몰 재구매 유도</span>와 고객 충성도 확보가 가능합니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 제휴 프로세스 섹션 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">PROCESS</span>
                            <h2 className="section-title">제휴 파트너 등록 절차</h2>
                            <p className="section-subtitle max-w-2xl mx-auto">
                                간단한 5단계로 제휴 파트너가 되실 수 있습니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {[
                                { step: "01", title: "파트너 신청", desc: "온라인으로 간편하게 신청" },
                                { step: "02", title: "검토 및 승인", desc: "영업일 기준 3일 내 검토" },
                                { step: "03", title: "전용 페이지 제공", desc: "파트너 전용 URL 발급" },
                                { step: "04", title: "판매 시작", desc: "회원 대상 홍보 시작" },
                                { step: "05", title: "실시간 관리", desc: "현황 확인 및 정산" },
                            ].map((item, index) => (
                                <div key={index} className="flex flex-row md:flex-col items-center gap-5 md:gap-0 bg-gray-50 md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none text-left md:text-center">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-sono-primary text-white flex items-center justify-center flex-shrink-0 md:mb-6 text-lg md:text-xl font-bold shadow-lg shadow-sono-primary/20">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-sono-dark mb-1 md:mb-2 tracking-tight">{item.title}</h3>
                                        <p className="text-[#6b7684] font-medium text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-24">
                            <Link href="/partner/apply" className="btn-primary text-xl px-12 py-5">
                                지금 바로 제휴 신청하기
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ 섹션 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6]">
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">FAQ</span>
                            <h2 className="section-title">자주 묻는 질문</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "어떤 업체가 제휴 파트너가 될 수 있나요?",
                                    a: "회원제로 운영하는 폐쇄형 쇼핑몰, 기업 복지몰 등을 운영하는 업체라면 제휴 파트너로 신청하실 수 있습니다. 온라인 오픈 마켓이나 일반 오픈형 쇼핑몰은 제휴가 어렵습니다."
                                },
                                {
                                    q: "수수료 구조는 어떻게 되나요?",
                                    a: "계약 건당 수수료가 지급되며, 상세한 수수료율은 파트너 신청 승인 후 별도 안내드립니다. 매월 정산이 진행됩니다."
                                },
                                {
                                    q: "전용 페이지는 어떻게 제공되나요?",
                                    a: "파트너 승인이 완료되면 파트너 전용 URL과 함께 파트너 센터 로그인 정보가 제공됩니다. 전용 페이지에는 파트너 로고, 포인트 정보 등이 커스터마이징됩니다."
                                },
                                {
                                    q: "회원에게 제공되는 포인트는 누가 정하나요?",
                                    a: "제휴몰에서 제공하는 포인트 금액은 파트너사에서 직접 결정하시며, 해당 포인트는 파트너사 쇼핑몰에서 사용 가능한 포인트입니다."
                                }
                            ].map((faq, index) => (
                                <details key={index} className="card !p-0 group bg-white border border-transparent hover:border-gray-200 transition-all">
                                    <summary className="list-none cursor-pointer p-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-sono-dark pr-4 tracking-tight">{faq.q}</h3>
                                            <svg className="w-6 h-6 text-[#adb5bd] transition-transform group-open:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </summary>
                                    <div className="px-8 pb-8 text-[#6b7684] font-medium leading-relaxed border-t border-gray-50 pt-6">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA 섹션 */}
                <section className="py-16 md:py-32 bg-sono-dark text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sono-primary/10 to-transparent z-0"></div>
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-10 tracking-tighter leading-tight">
                            소노아임레디 공식총판의 제휴파트너가 되어<br />
                            <span className="text-gradient">새로운 수익의 기회</span>를 잡으세요
                        </h2>
                        <p className="text-xl text-white/60 mb-12 font-medium">
                            지금 바로 신청하시면 3영업일 내에 검토 결과를 안내드립니다.
                        </p>
                        <Link href="/partner/apply" className="btn-primary text-xl px-12 py-5 inline-block">
                            제휴 파트너 신청하기
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
