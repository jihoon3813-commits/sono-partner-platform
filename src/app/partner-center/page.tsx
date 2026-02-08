"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PartnerCenterLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        loginId: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/partner-center/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("partnerSession", JSON.stringify(data.partner));
                router.push("/partner-center/dashboard");
            } else {
                setError(data.message || "로그인 정보를 다시 확인해주세요.");
            }
        } catch {
            setError("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f2f4f6] flex items-center justify-center p-6">
            <div className="w-full max-w-[440px] animate-fade-in">
                {/* 로고 및 제목 */}
                <div className="text-center mb-12">
                    <Link href="/partner-center/dashboard" className="inline-block group">
                        <img
                            src="https://github.com/jihoon3813-commits/img_sono/blob/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_W.png?raw=true"
                            alt="SONO Partner Center"
                            className="h-16 w-auto object-contain mx-auto mb-6 transition-transform group-hover:scale-105 brightness-0"
                        />
                        <h1 className="text-3xl font-bold text-sono-dark tracking-tighter mb-2">파트너 센터</h1>
                        <p className="text-[#6b7684] font-medium">소노아임레디 비즈니스 파트너 전용</p>
                    </Link>
                </div>

                {/* 로그인 카드 */}
                <div className="card bg-white !p-10 md:!p-12 shadow-xl shadow-sono-primary/5">
                    <h2 className="text-2xl font-bold text-sono-dark mb-10 text-center tracking-tight">로그인</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">아이디</label>
                            <input
                                type="text"
                                value={formData.loginId}
                                onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                placeholder="아이디를 입력하세요"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">비밀번호</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                placeholder="비밀번호를 입력하세요"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-4 text-lg shadow-lg shadow-sono-primary/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    확인 중...
                                </span>
                            ) : "로그인"}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-[#8b95a1] font-medium">
                            아직 파트너가 아니신가요?{" "}
                            <Link href="/partner/apply" className="text-sono-primary font-bold hover:underline ml-1">
                                제휴 신청하기
                            </Link>
                        </p>
                    </div>
                </div>

                {/* 하단 링크 */}
                <div className="mt-12 text-center space-y-4">
                    <p className="text-[#adb5bd] text-sm font-medium">
                        테스트 계정: <span className="text-[#6b7684]">demo</span> / <span className="text-[#6b7684]">demo1234</span>
                    </p>
                    <div>
                        <Link href="/admin" className="text-[#adb5bd] hover:text-[#4e5968] font-bold text-sm transition-colors block mb-4">
                            관리자 전용 로그인
                        </Link>
                        <Link href="/" className="text-[#8b95a1] hover:text-[#4e5968] font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            메인 페이지로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
