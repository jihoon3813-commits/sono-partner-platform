"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
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
            // 관리자 로그인 API 호출
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.success) {
                // 통합 세션 스토리지 사용 (partnerSession)
                localStorage.setItem("partnerSession", JSON.stringify(data.partner));
                // 통합 대시보드로 이동
                router.push("/partner-center/dashboard");
            } else {
                setError(data.message || "로그인 정보를 다시 확인해주세요.");
            }
        } catch (err) {
            console.error(err);
            setError("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6">
            <div className="w-full max-w-[440px]">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 rounded-[22px] bg-sono-primary flex items-center justify-center shadow-2xl shadow-sono-primary/20 mx-auto mb-6">
                        <span className="text-white font-bold text-3xl italic">A</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">관리자 시스템</h1>
                    <p className="text-gray-400 font-medium text-sm">SONO I&apos;M READY PLATFORM ADMIN</p>
                </div>

                <div className="bg-white rounded-[32px] p-10 md:p-12 shadow-2xl">
                    <h2 className="text-2xl font-bold text-sono-dark mb-10 text-center tracking-tight">로그인</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="10" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">ADMIN ID</label>
                            <input
                                type="text"
                                value={formData.loginId}
                                onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                className="w-full bg-[#f9fafb] border-none rounded-2xl py-4 px-5 text-sono-dark font-medium focus:ring-2 focus:ring-sono-primary"
                                placeholder="아이디"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">PASSWORD</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-[#f9fafb] border-none rounded-2xl py-4 px-5 text-sono-dark font-medium focus:ring-2 focus:ring-sono-primary"
                                placeholder="비밀번호"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-sono-dark text-white font-bold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                        >
                            {isLoading ? "확인 중..." : "시스템 접속"}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-gray-500 hover:text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        메인 페이지로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
