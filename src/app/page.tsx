import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import ImportantNotice from "@/components/common/ImportantNotice";

export default function HomePage() {
    return (
        <>
            <Header />
            <main className="bg-[#f8fafc] text-slate-900 font-sans antialiased">

                {/* =========================================================================
                    SECTION 1: HERO SHOWCASE (Dark Ultra-Luxe Architectural Image Banner)
                   ========================================================================= */}
                <section
                    className="relative min-h-[92vh] flex items-center bg-[#090d16] text-white overflow-hidden pt-20 border-b border-neutral-800"
                    style={{
                        backgroundImage: 'url("https://res.cloudinary.com/lyjyvy54/image/upload/v1785823512/cd512f0c-e032-48ef-80d4-ffa6c9ede92f_v5lqff.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* 오버레이: 텍스트 대비 및 럭셔리 다크 그라데이션 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/85 to-transparent z-0"></div>
                    <div className="absolute inset-0 bg-black/40 z-0"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 relative z-10 w-full">
                        <div className="max-w-3xl">
                            
                            {/* Hero Text Content */}
                            <div className="inline-block bg-sono-primary text-white border border-white/20 mb-6 px-4 py-1.5 rounded-none text-xs font-bold tracking-wider uppercase">
                                상조를 넘어 라이프케어로
                            </div>
                            <h1 className="leading-[1.12] mb-8 tracking-tight">
                                <span className="block text-lg sm:text-xl md:text-2xl mb-4 text-slate-300 font-bold tracking-normal">
                                    소노아임레디 공식총판과 함께
                                </span>
                                <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white block leading-[1.15]">
                                    파트너사의 비즈니스에<br />
                                    <span className="text-sono-gold">새로운 수익 모델</span>을<br />
                                    도입하세요.
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl font-normal break-keep">
                                소노아임레디 공식총판의 제휴파트너가 되어 파트너사의 회원들에게 최고 수준의 라이프케어 혜택을 제공하고, 파트너사는 매월 안정적인 지속 수수료 수익을 확보할 수 있습니다.
                            </p>

                            {/* Sharp Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    href="/partner/apply" 
                                    className="bg-sono-primary text-white hover:bg-blue-600 px-9 py-4 font-bold text-lg rounded-none transition-colors duration-200 text-center shadow-md border border-sono-primary"
                                >
                                    제휴 파트너 신청하기
                                </Link>
                                <Link 
                                    href="/products/smartcare" 
                                    className="border border-white/40 bg-white/10 text-white hover:bg-white/20 px-9 py-4 font-bold text-lg rounded-none backdrop-blur-sm transition-colors duration-200 text-center"
                                >
                                    상품 알아보기
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>


                {/* =========================================================================
                    SECTION 2: ABOUT US - BRAND & KEY STRENGTHS (Matching Image 1 Design)
                   ========================================================================= */}
                <section className="py-20 bg-[#edf2f8] border-b border-slate-200">
                    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        {/* Header: Badge, Title & Subtitle */}
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <div className="inline-block bg-[#dbeafe] text-[#2563eb] px-5 py-1.5 rounded-full font-extrabold text-xs tracking-wider uppercase mb-5 shadow-sm">
                                ABOUT US
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1e293b] tracking-tight mb-5 leading-tight">
                                <span className="block sm:inline">대명소노그룹의 </span>
                                <span className="block sm:inline">라이프케어 브랜드</span>
                            </h2>
                            <p className="text-[#334155] font-bold text-lg sm:text-xl mb-3">
                                &quot;인생의 모든 순간이 준비될 때까지&quot;
                            </p>
                            <p className="text-[#64748b] font-medium text-sm sm:text-base leading-relaxed break-keep">
                                40년 이상의 레저 사업 노하우를 바탕으로 고객의 삶을 더욱 풍요롭게 만드는 토탈 라이프케어 서비스를 제공합니다.
                            </p>
                        </div>

                        {/* S - I - R Key Cards (Mobile Touch Horizontal Slider / Desktop 3-Column Grid) */}
                        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 mb-12 scrollbar-none md:grid md:grid-cols-3 md:gap-5 md:pb-0">
                            {/* S Card */}
                            <div className="bg-white rounded-none border border-slate-200 shadow-sm flex flex-col group hover:border-slate-400 transition-all duration-300 overflow-hidden min-w-[85%] sm:min-w-[70%] md:min-w-0 snap-center shrink-0 md:shrink">
                                <div className="h-44 relative overflow-hidden bg-slate-50 flex items-center justify-center">
                                    <img 
                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785823506/eb192e28-e468-428b-ba67-2c6d9c96255e_ebwfd0.png" 
                                        alt="SONO" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-5 bg-white border-t border-slate-200 flex-1 flex flex-col justify-center">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">SONO</span>
                                    <h4 className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">축적된 자산의 모든 서비스</h4>
                                </div>
                            </div>

                            {/* I Card */}
                            <div className="bg-white rounded-none border border-slate-200 shadow-sm flex flex-col group hover:border-slate-400 transition-all duration-300 overflow-hidden min-w-[85%] sm:min-w-[70%] md:min-w-0 snap-center shrink-0 md:shrink">
                                <div className="h-44 relative overflow-hidden bg-slate-50 flex items-center justify-center">
                                    <img 
                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785823502/9cced908-f000-46c7-89d1-2d890e0472d7_ypcjb1.png" 
                                        alt="I'M" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-5 bg-white border-t border-slate-200 flex-1 flex flex-col justify-center">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">I&apos;M</span>
                                    <h4 className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">고객 맞춤형 서비스</h4>
                                </div>
                            </div>

                            {/* R Card */}
                            <div className="bg-white rounded-none border border-slate-200 shadow-sm flex flex-col group hover:border-slate-400 transition-all duration-300 overflow-hidden min-w-[85%] sm:min-w-[70%] md:min-w-0 snap-center shrink-0 md:shrink">
                                <div className="h-44 relative overflow-hidden bg-slate-50 flex items-center justify-center">
                                    <img 
                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785823489/2ea1375d-28ff-495e-8839-8ce821fc153b_jgkord.png" 
                                        alt="READY" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-5 bg-white border-t border-slate-200 flex-1 flex flex-col justify-center">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">READY</span>
                                    <h4 className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">항상 준비된 상태</h4>
                                </div>
                            </div>
                        </div>

                        {/* 4 Visual Photographic Grid Cards (2x2 on Mobile, 4-Column on Desktop) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-14">
                            {[
                                {
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785823467/photo_story_company01_zx8zsa.jpg",
                                    title: "고객 선수금 1조 돌파",
                                    sub: "2024년 06월 기준"
                                },
                                {
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785823468/photo_story_company02_zws1lr.jpg",
                                    title: "자본금 100억원",
                                    sub: "법정 자본금(15억원)요건 6배"
                                },
                                {
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785823470/photo_story_company03_c80m69.jpg",
                                    title: "대명소노그룹사",
                                    sub: "2024년 기준 대규모기업"
                                },
                                {
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785823471/photo_story_company04_zokcwv.jpg",
                                    title: "신용평가 1등급",
                                    sub: "기준: 2025.8.1~2025.7.31 / 상조보증공제조합"
                                }
                            ].map((card, index) => (
                                <div 
                                    key={index}
                                    className="bg-white rounded-none overflow-hidden shadow-sm border border-slate-200 flex flex-col group hover:border-slate-400 transition-all duration-300"
                                >
                                    <div className="relative w-full aspect-[5/4] overflow-hidden bg-slate-900">
                                        <img 
                                            src={card.image} 
                                            alt={card.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200 flex-1 flex flex-col justify-center">
                                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-lg mb-1 tracking-tight">
                                            {card.title}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-normal break-keep">
                                            {card.sub}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Full Description Paragraph */}
                        <div className="max-w-4xl mx-auto text-center px-4">
                            <p className="text-[#64748b] text-xs sm:text-sm md:text-base leading-relaxed font-normal break-keep">
                                지난 40년 이상 국내 레저사업을 이끌어온 대명소노그룹의 서비스 노하우를 바탕으로 설립된 (주)소노스테이션의 대표 브랜드 소노아임레디. 소노아임레디는 상조 서비스를 중심으로 여행, 교육, 웨딩 등 삶에 필요한 서비스를 제공하고 있습니다. 다양한 라이프케어 서비스를 소비자가 원하는 시점에 선택하여 이용할 수 있도록 항상 준비되어 있습니다. 소노아임레디를 통해 고객의 삶을 더욱 풍요롭게 하는 것이 우리 브랜드의 목표입니다.
                            </p>
                        </div>

                    </div>
                </section>


                {/* =========================================================================
                    SECTION 3: ABOUT SONO BRAND ARCHITECTURE (Cool Slate Gray Section)
                   ========================================================================= */}
                <section className="py-20 bg-[#f1f5f9] border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        {/* 3 Major Business Domain Image Cards (Mobile Touch Horizontal Slider / Desktop 3-Column Grid) */}
                        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 scrollbar-none md:grid md:grid-cols-3 md:gap-8 md:pb-0">
                            {[
                                {
                                    category: "LIFE STYLE",
                                    title: "소노아임레디",
                                    desc: "상조 · 웨딩 · 여행 · 교육을 아우르는 토탈 라이프케어 프리미엄 서비스",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785824926/fa0a2022-695f-4fbd-a657-e95363d25ce7_z4iyeb.png",
                                    brandLogo: "https://www.sonoimready.com/assets/images/cs/logo_dm_h_dark.png"
                                },
                                {
                                    category: "HOTEL & RESORT",
                                    title: "소노호텔앤리조트",
                                    desc: "대한민국 대표 호스피탈리티 기업 (전국 17개 직영 리조트 보유)",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785824714/sono-img-1_ipustu.jpg",
                                    brandLogo: "https://www.sonoimready.com/assets/images/cs/logo_sono.png"
                                },
                                {
                                    category: "ENTERTAINMENTS",
                                    title: "비발디파크 & 오션월드",
                                    desc: "골프, 스키, 요트, 승마, 펫 리조트 등 풍부한 익스트림 액티비티 혜택",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785824803/01_r4liap.jpg",
                                    brandLogo: "https://www.sonoimready.com/assets/images/cs/logo_vivaldi_park.png"
                                }
                            ].map((domain, i) => (
                                <div 
                                    key={i} 
                                    className="bg-white border border-slate-200 rounded-none overflow-hidden flex flex-col group hover:border-slate-400 transition-all duration-300 w-[calc(100vw-3.5rem)] max-w-[340px] sm:max-w-none sm:w-auto md:min-w-0 snap-center shrink-0 md:shrink"
                                >
                                    <div className="h-48 sm:h-56 relative overflow-hidden">
                                        <img 
                                            src={domain.image} 
                                            alt={domain.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40"></div>
                                        <span className="absolute top-4 left-4 bg-sono-primary text-white text-xs px-3 py-1 font-bold rounded-none uppercase tracking-wider">
                                            {domain.category}
                                        </span>
                                    </div>
                                    <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">{domain.title}</h3>
                                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal break-keep">{domain.desc}</p>
                                        </div>
                                        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400">대명소노그룹</span>
                                            <img src={domain.brandLogo} alt={domain.title} className="h-5 sm:h-6 w-auto object-contain opacity-80" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>


                {/* =========================================================================
                    NEW SECTION: INNOVATION & KEY SERVICE AREAS (Matching Page Design System)
                   ========================================================================= */}
                <section className="py-24 bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-8 border-b border-slate-200">
                            <div>
                                <span className="text-sono-primary text-xs font-black tracking-widest uppercase block mb-2">
                                    INNOVATION & SERVICES
                                </span>
                                <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                                    혁신 서비스 &amp; 주요 사업 영역
                                </h2>
                            </div>
                            <p className="text-slate-600 font-normal text-xs sm:text-base md:text-lg max-w-md mt-3 md:mt-0 break-keep">
                                업계 최초로 도입된 혁신적인 서비스 시스템과 소노아임레디의 핵심 라이프케어 영역입니다.
                            </p>
                        </div>

                        {/* 2 Column Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            
                            {/* Left Box: 업계 최초 혁신 서비스 (Dark Luxe Navy Card) */}
                            <div className="bg-[#0f1a36] border border-neutral-800 rounded-none p-6 sm:p-10 text-white shadow-xl flex flex-col justify-between relative">
                                <div>
                                    <span className="text-sono-gold text-[11px] sm:text-xs font-extrabold tracking-widest uppercase block mb-2">
                                        INDUSTRY FIRST
                                    </span>
                                    <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-6 pb-4 border-b border-white/10 whitespace-nowrap">
                                        업계 최초 혁신 서비스
                                    </h3>

                                    {/* Checklist Items */}
                                    <div className="space-y-6 sm:space-y-7">
                                        
                                        {/* Item 1 */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sono-primary text-white flex items-center justify-center font-bold text-xs rounded-none shrink-0 mt-0.5 border border-blue-400">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-base sm:text-xl font-bold text-white mb-0.5">
                                                    결합상품 최초 도입
                                                </h4>
                                                <p className="text-slate-300 text-[11px] sm:text-xs font-normal leading-relaxed">
                                                    가전+상조 결합 상품 업계 최초 출시
                                                </p>
                                            </div>
                                        </div>

                                        {/* Item 2 */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sono-primary text-white flex items-center justify-center font-bold text-xs rounded-none shrink-0 mt-0.5 border border-blue-400">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-base sm:text-xl font-bold text-white mb-0.5">
                                                    하이브리드(전환) 서비스
                                                </h4>
                                                <p className="text-slate-300 text-[11px] sm:text-xs font-normal leading-relaxed">
                                                    상조→웨딩, 여행, 교육 등 유연한 전환
                                                </p>
                                            </div>
                                        </div>

                                        {/* Item 3 */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sono-primary text-white flex items-center justify-center font-bold text-xs rounded-none shrink-0 mt-0.5 border border-blue-400">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-base sm:text-xl font-bold text-white mb-0.5">
                                                    레디캐시
                                                </h4>
                                                <p className="text-slate-300 text-[11px] sm:text-xs font-normal leading-relaxed">
                                                    납입금을 미리 사용할 수 있는 선지급 서비스
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Right Box: 주요 서비스 영역 (Crisp White Card) */}
                            <div className="bg-slate-50 border border-slate-200 rounded-none p-6 sm:p-10 flex flex-col justify-between">
                                <div>
                                    <span className="text-sono-primary text-[11px] sm:text-xs font-extrabold tracking-widest uppercase block mb-2">
                                        SERVICE DOMAINS
                                    </span>
                                    <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-6 pb-4 border-b border-slate-200 whitespace-nowrap">
                                        주요 서비스 영역
                                    </h3>

                                    {/* 4 Service Grid Cards */}
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        
                                        {/* Card 1: 라이프케어 */}
                                        <div className="bg-white border border-slate-200 rounded-none p-4 sm:p-6 text-center flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] group hover:border-slate-400 transition-colors shadow-sm">
                                            <div className="w-9 h-9 sm:w-11 sm:h-11 mb-2.5 bg-slate-900 text-white rounded-none flex items-center justify-center">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                            <h4 className="text-slate-900 font-bold text-sm sm:text-lg mb-0.5 tracking-tight">
                                                라이프케어
                                            </h4>
                                            <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
                                                상조, 웨딩, 여행, 교육
                                            </p>
                                        </div>

                                        {/* Card 2: 멤버십 */}
                                        <div className="bg-white border border-slate-200 rounded-none p-4 sm:p-6 text-center flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] group hover:border-slate-400 transition-colors shadow-sm">
                                            <div className="w-9 h-9 sm:w-11 sm:h-11 mb-2.5 bg-slate-900 text-white rounded-none flex items-center justify-center">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V5m0 0h4m-4 0H9" />
                                                </svg>
                                            </div>
                                            <h4 className="text-slate-900 font-bold text-sm sm:text-lg mb-0.5 tracking-tight">
                                                멤버십
                                            </h4>
                                            <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
                                                소노호텔앤리조트
                                            </p>
                                        </div>

                                        {/* Card 3: 결합상품 */}
                                        <div className="bg-white border border-slate-200 rounded-none p-4 sm:p-6 text-center flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] group hover:border-slate-400 transition-colors shadow-sm">
                                            <div className="w-9 h-9 sm:w-11 sm:h-11 mb-2.5 bg-slate-900 text-white rounded-none flex items-center justify-center">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-slate-900 font-bold text-sm sm:text-lg mb-0.5 tracking-tight">
                                                결합상품
                                            </h4>
                                            <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
                                                가전+상조 결합
                                            </p>
                                        </div>

                                        {/* Card 4: 전환 서비스 */}
                                        <div className="bg-white border border-slate-200 rounded-none p-4 sm:p-6 text-center flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] group hover:border-slate-400 transition-colors shadow-sm">
                                            <div className="w-9 h-9 sm:w-11 sm:h-11 mb-2.5 bg-slate-900 text-white rounded-none flex items-center justify-center">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-slate-900 font-bold text-sm sm:text-lg mb-0.5 tracking-tight">
                                                전환 서비스
                                            </h4>
                                            <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
                                                다양한 용도로 전환
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </section>


                {/* =========================================================================
                    SECTION 4: PRODUCT LINEUP (Deep Premium Navy Section)
                   ========================================================================= */}
                <section className="py-24 bg-[#0b1329] text-white border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
                            <span className="text-sono-gold text-xs font-black tracking-widest uppercase block mb-2">
                                PRODUCTS LINEUP
                            </span>
                            <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 whitespace-nowrap">
                                제휴 파트너 채널 전용 상품
                            </h2>
                            <p className="text-slate-300 text-xs sm:text-lg leading-relaxed font-normal break-keep">
                                파트너사의 고객들에게 강력한 구매 유인이 되는 소노아임레디의 프리미엄 상품 라인업을 제공합니다.
                            </p>
                        </div>

                        {/* Product Cards Grid */}
                        <div className="grid md:grid-cols-2 gap-8 sm:gap-10">

                            {/* Product 1: 더 해피 450 ONE */}
                            <div className="border border-neutral-700 bg-[#0f1a36] rounded-none overflow-hidden relative flex flex-col">
                                {/* Disabled Overlay Banner */}
                                <div className="absolute inset-0 bg-[#090d16]/75 backdrop-blur-[2px] z-20 flex items-center justify-center p-6 text-center">
                                    <div className="bg-[#0b1329] border border-white/30 text-white px-6 py-4 sm:px-8 sm:py-5 rounded-none shadow-2xl">
                                        <p className="font-bold text-base sm:text-lg mb-1 text-sono-gold">인증 제휴사 전용 상품</p>
                                        <p className="text-[11px] sm:text-xs text-slate-300 font-medium">(별도 문의 후 이용 가능)</p>
                                    </div>
                                </div>

                                <div className="h-40 sm:h-56 relative overflow-hidden">
                                    <img 
                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785308928/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_29%EC%9D%BC_%EC%98%A4%ED%9B%84_03_38_13_1_1_mpokg4.png" 
                                        alt="더 해피 450 ONE" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a36] to-transparent"></div>
                                    <span className="absolute top-4 left-4 bg-white/20 text-white text-xs px-3 py-1 font-bold rounded-none uppercase">
                                        일반 상조 플랜
                                    </span>
                                </div>

                                <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">더 해피 450 ONE</h3>
                                        <p className="text-slate-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed font-normal">
                                            기본 상조 서비스와 함께 레디캐시, 소노그룹 멤버십, 만기 시 납입금 100% 환급 혜택을 제공하는 스탠다드 상조 서비스입니다.
                                        </p>
                                        <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-8 border-t border-neutral-700/60 pt-4 sm:pt-6">
                                            {["제휴몰 포인트 지급", "레디캐시 적립 서비스", "만기 시 납입금 100% 환급"].map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2.5 text-slate-200 text-[11px] sm:text-sm font-medium">
                                                    <span className="w-1.5 h-1.5 bg-sono-primary inline-block"></span>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 sm:pt-6 border-t border-neutral-700/60 flex items-center justify-between">
                                        <span className="text-xs sm:text-sm font-bold text-slate-400">월 18,000원부터</span>
                                        <span className="text-[11px] sm:text-xs text-slate-500 font-bold">인증 제휴 전용</span>
                                    </div>
                                </div>
                            </div>

                            {/* Product 2: 스마트케어 (BEST) */}
                            <div className="border-2 border-sono-gold bg-[#111f42] rounded-none overflow-hidden relative flex flex-col shadow-xl">
                                <div className="h-40 sm:h-56 relative overflow-hidden">
                                    <img 
                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785825079/2024112600085_0_vbmtin.jpg" 
                                        alt="스마트케어 가전결합" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111f42] to-transparent"></div>
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-sono-gold text-slate-900 text-xs px-3 py-1 font-black rounded-none uppercase">
                                            BEST POPULAR
                                        </span>
                                        <span className="bg-sono-primary text-white text-xs px-3 py-1 font-bold rounded-none uppercase">
                                            가전 결합 상품
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">스마트케어</h3>
                                        <p className="text-slate-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed font-normal">
                                            삼성/LG 최신 프리미엄 가전제품 렌탈금 전액 지원과 상조 서비스, 만기 100% 환급까지 모든 혜택이 결합된 베스트셀러 상품입니다.
                                        </p>
                                        <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-8 border-t border-neutral-700/60 pt-4 sm:pt-6">
                                            {[
                                                "삼성/LG 최신 가전 렌탈 지원금 전액 제공",
                                                "소노아임레디 토탈 라이프케어 서비스 제공",
                                                "만기 후 익월 해약 시 납입금 100% 전액 환급",
                                                "실속형부터 프리미엄까지 4가지 맞춤 플랜"
                                            ].map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2.5 text-white text-[11px] sm:text-sm font-medium">
                                                    <span className="w-1.5 h-1.5 bg-sono-gold inline-block"></span>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 sm:pt-6 border-t border-neutral-700/60 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm font-bold text-slate-300">월 33,000원부터</span>
                                            <span className="text-[11px] sm:text-xs text-sono-gold font-bold">월 납입 지원 혜택</span>
                                        </div>
                                        <Link 
                                            href="/products/smartcare" 
                                            className="w-full bg-sono-gold text-slate-900 hover:bg-yellow-400 py-3 font-bold text-xs sm:text-sm rounded-none transition-colors duration-200 text-center block"
                                        >
                                            스마트케어 자세히 보기
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>




                {/* =========================================================================
                    SECTION 6: PARTNER BENEFITS & REVENUE MODEL (Cool Slate Gray Section)
                   ========================================================================= */}
                <section className="py-24 bg-[#f8fafc] border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
                            <span className="text-sono-primary text-xs font-black tracking-widest uppercase block mb-2 sm:mb-3">
                                PARTNER BENEFITS
                            </span>
                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-5 leading-tight">
                                <span className="block sm:inline">제휴 파트너에게 드리는 </span>
                                <span className="block sm:inline">4가지 핵심 혜택</span>
                            </h2>
                            <p className="text-slate-600 text-xs sm:text-lg leading-relaxed font-normal break-keep">
                                무리한 마케팅 비용이나 복잡한 CS 응대 없이, 파트너사는 고객 노출만 담당하세요.
                            </p>
                        </div>

                        {/* 4 Photo-Driven Feature Cards (No Icons) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: "안정적인 지속 수수료",
                                    desc: "계약 건당 수수료 지급 및 매월 투명한 정산 프로세스로 안정적이고 장기적인 사업 수익 확보",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829521/380b1318-55b9-46e2-9789-cf4bf89763a3.png"
                                },
                                {
                                    title: "파트너 전용 웹 플랫폼",
                                    desc: "파트너사의 브랜드 로고가 커스텀 적용된 상품 안내 웹 랜딩페이지 및 간편 신청 폼 무료 제공",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829523/d1f7e06c-7b68-4fd6-bc09-f0deee5daaf3.png"
                                },
                                {
                                    title: "실시간 어드민 트래킹",
                                    desc: "전용 파트너 센터 어드민을 통해 실시간으로 접수 현황, 계약 진행 상태 및 정산 금액 확인 가능",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829525/96803397-5ba1-444e-ba3d-6b13150813c7.png"
                                },
                                {
                                    title: "100% 마케팅 리소스 지원",
                                    desc: "쇼핑몰 배너, 디지털 카탈로그, 홍보용 상세페이지 이미지 및 프로모션 안내 자료 무료 제공",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829527/75d4d7bd-1f08-4191-bf3f-a2abe96861dc.png"
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-none overflow-hidden flex flex-col group hover:border-slate-400 transition-colors duration-300">
                                    <div className="h-48 relative overflow-hidden">
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 bg-slate-900/20"></div>
                                        <span className="absolute top-3 left-3 bg-sono-primary text-white text-xs font-bold px-2.5 py-1 rounded-none">
                                            BENEFIT 0{idx + 1}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h3>
                                            <p className="text-slate-600 text-sm leading-relaxed font-normal">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>


                {/* =========================================================================
                    SECTION 7: HOW IT WORKS & REVENUE MODEL (Luxury Dark Editorial Section)
                   ========================================================================= */}
                <section className="py-24 bg-[#111827] text-white border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-sono-gold text-xs font-black tracking-widest uppercase block mb-3">
                                HOW IT WORKS
                            </span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                                파트너는 홍보만 하세요.<br />상담과 계약은 전담 센터가 진행합니다.
                            </h2>
                            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal break-keep">
                                복잡한 상품 교육이나 별도의 전문 영업 인력 채용이 필요하지 않습니다.
                            </p>
                        </div>

                        {/* 4 Step Process Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    step: "01",
                                    title: "상품 배너 등록",
                                    desc: "제휴 파트너사의 쇼핑몰, 앱, 회원 커뮤니티에 전용 안내 배너 등록",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829860/e49fa7b1-5c76-4907-9f1d-88a3434c522c.png"
                                },
                                {
                                    step: "02",
                                    title: "고객 문의 접수",
                                    desc: "관심 회원이 전용 신청 폼을 통해 이름과 연락처를 남김",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829883/d38165a5-2e43-4558-939d-6b7ddc6b7bcb.png"
                                },
                                {
                                    step: "03",
                                    title: "전문 상담 & 계약",
                                    desc: "소노아임레디 전담 전문 상담센터에서 상세 설명 및 최종 가입 완료",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829867/bb25cad6-e1ad-4b5d-90a0-6190747ebc63.png"
                                },
                                {
                                    step: "04",
                                    title: "익월 수수료 정산",
                                    desc: "완료된 계약 건에 대하여 지정된 매월 정산일에 정기 수수료 지급",
                                    image: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785829876/40af88b4-e8be-4dc9-b7a7-9272cb2e71f5.png"
                                }
                            ].map((proc, idx) => (
                                <div key={idx} className="border border-neutral-800 bg-[#0d1527] rounded-none overflow-hidden flex flex-col">
                                    <div className="h-40 relative overflow-hidden">
                                        <img src={proc.image} alt={proc.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40"></div>
                                        <span className="absolute top-3 left-3 bg-sono-primary text-white text-xs font-black px-3 py-1 rounded-none">
                                            STEP {proc.step}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-2">{proc.title}</h4>
                                            <p className="text-slate-400 text-xs leading-relaxed">{proc.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>


                {/* =========================================================================
                    SECTION 8: PARTNERSHIP PROCESS (Pure White Crisp Section)
                   ========================================================================= */}
                <section className="py-24 bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-sono-primary text-xs font-black tracking-widest uppercase block mb-3">
                                PROCESS
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                제휴 파트너 등록 절차
                            </h2>
                            <p className="text-slate-600 text-base mt-3">
                                간단한 5단계 온라인 절차로 제휴 파트너 등록이 진행됩니다.
                            </p>
                        </div>

                        {/* 5 Step Sharp Rectangle Process */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[
                                { num: "01", title: "온라인 신청", desc: "기본 파트너 정보 입력 및 제휴 신청서 작성" },
                                { num: "02", title: "검토 및 승인", desc: "영업일 기준 3일 이내 자격 요건 심사" },
                                { num: "03", title: "전용 URL 발급", desc: "파트너 전용 가입 페이지 및 브랜드 템플릿 생성" },
                                { num: "04", title: "홍보 개시", desc: "파트너 회원 대상 상품 안내 및 배너 게시" },
                                { num: "05", title: "실시간 정산", desc: "어드민을 통한 실시간 실적 관리 및 수수료 입금" }
                            ].map((st, i) => (
                                <div key={i} className="border border-slate-200 p-6 rounded-none bg-slate-50 flex flex-col justify-between">
                                    <div>
                                        <span className="text-2xl font-black text-sono-primary block mb-3">
                                            {st.num}
                                        </span>
                                        <h3 className="font-bold text-slate-900 text-base mb-2">{st.title}</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed font-normal">{st.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-16">
                            <Link 
                                href="/partner/apply" 
                                className="bg-sono-primary text-white hover:bg-blue-600 px-10 py-4 font-bold text-lg rounded-none transition-colors duration-200 inline-block shadow-md"
                            >
                                제휴 파트너 지금 신청하기
                            </Link>
                        </div>

                    </div>
                </section>


                {/* =========================================================================
                    SECTION 9: FREQUENTLY ASKED QUESTIONS (Cool Slate Gray Section)
                   ========================================================================= */}
                <section className="py-24 bg-[#f8fafc] border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
                        
                        <div className="text-center mb-16">
                            <span className="text-sono-primary text-xs font-black tracking-widest uppercase block mb-3">
                                FAQ
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                자주 묻는 질문
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "어떤 업체가 제휴 파트너로 참여할 수 있나요?",
                                    a: "회원제로 운영되는 폐쇄형 쇼핑몰, 기업 임직원 복지몰, 특정 커뮤니티 회원 기반 플랫폼을 운영하는 업체라면 손쉽게 제휴 파트너로 신청하실 수 있습니다."
                                },
                                {
                                    q: "수수료 지급 및 정산 일정은 어떻게 되나요?",
                                    a: "최종 가입 완료 건당 정해진 대당 수수료가 책정되며, 파트너 어드민을 통해 실시간 실적 확인 후 매월 지정된 정산일에 안전하게 입금됩니다."
                                },
                                {
                                    q: "파트너 전용 가입 페이지 커스터마이징이 가능한가요?",
                                    a: "네, 제휴 파트너 승인이 완료되면 파트너사의 전용 브랜드 로고, 대표 문구 및 고객 포인트 혜택 안내문이 반영된 전용 URL이 발급됩니다."
                                },
                                {
                                    q: "고객에게 지급할 포인트 금액은 어떻게 결정되나요?",
                                    a: "제휴몰에서 지급되는 회원 포인트 금액은 파트너사에서 자율적으로 결정하며, 지급된 포인트는 파트너사의 자체 쇼핑몰에서 재구매용으로 활용됩니다."
                                }
                            ].map((faq, index) => (
                                <details key={index} className="border border-slate-200 bg-white rounded-none group transition-all">
                                    <summary className="list-none cursor-pointer p-6 font-bold text-slate-900 text-base md:text-lg flex items-center justify-between">
                                        <span>{faq.q}</span>
                                        <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 ml-4">+</span>
                                    </summary>
                                    <div className="px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-normal">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>

                    </div>
                </section>


                {/* =========================================================================
                    SECTION 10: FINAL CTA BANNER (Dark Luxury Architectural Banner)
                   ========================================================================= */}
                <section 
                    className="py-24 bg-[#090d16] text-white relative overflow-hidden"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="absolute inset-0 bg-[#090d16]/90 z-0"></div>
                    
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
                        <span className="text-sono-gold text-xs font-black tracking-widest uppercase block mb-4">
                            START PARTNERSHIP TODAY
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black mb-8 tracking-tight leading-tight">
                            소노아임레디 공식총판의 제휴파트너가 되어<br />
                            <span className="text-sono-gold">안정적인 새로운 수익 모델</span>을 구축하세요
                        </h2>
                        <p className="text-slate-300 text-base sm:text-lg mb-10 font-normal">
                            지금 신청하시면 영업일 기준 3일 이내에 담당자가 파트너 자격 검토 결과를 안내드립니다.
                        </p>
                        <Link 
                            href="/partner/apply" 
                            className="bg-sono-primary text-white hover:bg-blue-600 px-12 py-5 font-bold text-xl rounded-none transition-colors duration-200 inline-block shadow-xl border border-sono-primary"
                        >
                            제휴 파트너 신청하기
                        </Link>
                    </div>
                </section>

                {/* FINANCIAL INTEGRITY & LEGAL DISCLOSURES */}
                <ImportantNotice />

            </main>
            <Footer />
        </>
    );
}
