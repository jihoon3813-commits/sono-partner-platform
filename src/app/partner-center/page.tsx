"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminIcon } from "@/components/dashboard/AdminIcons";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        loginId: searchParams.get("id") || "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const id = searchParams.get("id");
        const key = searchParams.get("k");

        // 1. 관리자 바로가기(자동 로그인: id, k 파라미터가 있는 경우) 최우선 처리
        if (id && key) {
            handleAutoLogin(id, key);
            return;
        }

        // 2. 파라미터가 없는 순수 접속이고 개발 환경(localhost)인 경우에만 총괄 관리자로 자동 로그인
        const isDev =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1" ||
                window.location.hostname.endsWith(".local"));

        if (isDev) {
            const devAdminSession = {
                partnerId: "admin",
                name: "총괄 관리자",
                customUrl: "admin",
                level: "admin",
            };
            localStorage.setItem("partnerSession", JSON.stringify(devAdminSession));
            sessionStorage.setItem("partnerSession", JSON.stringify(devAdminSession));
            router.replace("/partner-center/dashboard");
            return;
        }
    }, [searchParams, router]);

    const handleAutoLogin = async (id: string, key: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/partner-center/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loginId: id, masterKey: key, password: "" }),
            });

            const data = await response.json();

            if (response.ok && data.success && data.partner) {
                const sessionStr = JSON.stringify(data.partner);
                sessionStorage.setItem("partnerSession", sessionStr);
                localStorage.setItem("partnerSession", sessionStr);
                router.replace("/partner-center/dashboard");
            } else {
                setError(data.message || "자동 로그인에 실패했습니다.");
                setIsLoading(false);
            }
        } catch {
            setError("서버와 통신 중 오류가 발생했습니다.");
            setIsLoading(false);
        }
    };

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
        <div className="adm-panel p-8 sm:p-10 shadow-[0_14px_45px_rgba(25,63,57,0.06)]">
            <div className="mb-7">
                <span className="adm-pill green mb-3">PARTNER &amp; ADMIN PORTAL</span>
                <h2 className="text-[22px] font-bold text-[#263d36] tracking-tight">
                    워크스페이스 로그인
                </h2>
                <p className="text-xs text-[#86918a] mt-1.5 leading-relaxed">
                    본사 관리자 및 파트너사·상담원 계정으로 접속하세요.
                </p>
            </div>

            {error && (
                <div className="bg-[#faeae5] border border-[#ebd2ca] text-[#a65544] px-4 py-3 rounded-[10px] mb-6 text-xs font-semibold flex items-center gap-2.5">
                    <AdminIcon name="info" className="!w-4 !h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-[#5b6d5c] mb-2">
                        아이디
                    </label>
                    <input
                        type="text"
                        value={formData.loginId}
                        onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                        className="w-full px-3.5 py-3 bg-[#f9faf7] border border-[#dfe5d9] rounded-[9px] text-sm text-[#263d36] placeholder:text-[#9ca795] focus:bg-white focus:border-[#295e52] outline-none transition-all"
                        placeholder="아이디를 입력하세요"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#5b6d5c] mb-2">
                        비밀번호
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3.5 py-3 bg-[#f9faf7] border border-[#dfe5d9] rounded-[9px] text-sm text-[#263d36] placeholder:text-[#9ca795] focus:bg-white focus:border-[#295e52] outline-none transition-all"
                        placeholder="비밀번호를 입력하세요"
                        required
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="adm-btn primary w-full !py-3.5 !text-sm !rounded-[9px]"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                확인 중...
                            </span>
                        ) : (
                            <>
                                <span>로그인</span>
                                <AdminIcon name="arrow-right" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-7 pt-6 border-t border-[#edf0e7] flex items-center justify-between text-xs text-[#86918a]">
                <span>아직 파트너가 아니신가요?</span>
                <Link
                    href="/partner/apply"
                    className="text-[#295e52] font-bold hover:underline inline-flex items-center gap-1"
                >
                    <span>입점/제휴 신청하기</span>
                    <AdminIcon name="arrow-up-right" className="!w-3.5 !h-3.5" />
                </Link>
            </div>
        </div>
    );
}

export default function PartnerCenterLoginPage() {
    return (
        <div className="min-h-screen bg-[#f5f6f3] flex flex-col lg:flex-row">
            {/* Left Brand Panel (Desktop) */}
            <aside className="hidden lg:flex lg:w-[440px] xl:w-[480px] bg-[#193f39] text-[#d6e2dc] p-12 flex-col justify-between shrink-0 border-r border-[#13312c]">
                <div>
                    <div className="adm-brand !p-0">
                        <span className="adm-brand-emblem">
                            S<span>•</span>
                        </span>
                        <span>
                            <small>SONO I&apos;M READY</small>
                            <strong>파트너센터</strong>
                        </span>
                    </div>
                    <div className="mt-14 space-y-4">
                        <span className="inline-block text-[10px] tracking-[0.18em] uppercase text-[#a6b6a1] font-semibold">
                            INTEGRATED SALES ADMIN
                        </span>
                        <h1 className="text-[30px] font-bold text-white leading-[1.32] tracking-tight">
                            소노아임레디의 모든 영업을
                            <br />
                            하나의 워크스페이스에서.
                        </h1>
                        <p className="text-sm text-[#a6bab0] leading-relaxed pt-1">
                            스마트케어, 더 해피 450 ONE, 마음든든 상품의 상담 접수부터
                            녹취·본사 접수·연체 관리까지 일관된 기준으로 운영합니다.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6 text-xs text-[#8fa89c]">
                    <div className="flex items-center justify-between">
                        <span>지원 상품</span>
                        <span className="text-[#dbe5dd] font-semibold">스마트케어 · 더해피450 · 마음든든</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>운영 환경</span>
                        <span className="text-[#dbe5dd] font-semibold">본사 총괄 · 상위/일반 파트너 · TM</span>
                    </div>
                </div>
            </aside>

            {/* Right Login Area */}
            <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
                <div className="w-full max-w-[430px]">
                    {/* Mobile Brand Header */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#193f39] text-white">
                            <span className="adm-brand-emblem !w-8 !h-9 !text-2xl">
                                S<span>•</span>
                            </span>
                            <div className="text-left">
                                <small className="block text-[8px] tracking-[1.8px] text-[#b2c5b9]">
                                    SONO I&apos;M READY
                                </small>
                                <strong className="text-lg font-bold tracking-tight">파트너센터</strong>
                            </div>
                        </div>
                    </div>

                    <Suspense
                        fallback={
                            <div className="adm-panel p-10 text-center text-xs text-[#86918a]">
                                로그인 화면을 준비하고 있습니다...
                            </div>
                        }
                    >
                        <LoginForm />
                    </Suspense>

                    <div className="mt-8 text-center space-y-3">
                        <p className="text-[#96a093] text-xs">
                            테스트 계정: <strong className="text-[#566859]">demo</strong> /{" "}
                            <strong className="text-[#566859]">demo1234</strong>
                        </p>
                        <div>
                            <Link
                                href="/"
                                className="text-[#6d7c6e] hover:text-[#295e52] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                            >
                                <span>← 공식 메인 페이지로 돌아가기</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
