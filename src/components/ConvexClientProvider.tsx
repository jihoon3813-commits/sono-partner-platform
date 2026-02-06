"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo, useState, useEffect } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    useEffect(() => {
        setMounted(true);
    }, []);

    const convex = useMemo(() => {
        if (!convexUrl) return null;
        return new ConvexReactClient(convexUrl);
    }, [convexUrl]);

    // 서버 사이드 렌더링 시에는 자식만 렌더링 (또는 빈 상태)
    // 클라이언트 사이드에서 환경 변수 누락 시 에러 표시
    // Prevent useQuery errors by not rendering children until provider is ready
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin w-10 h-10 border-4 border-sono-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!convexUrl || !convex) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-600 p-10 flex-col gap-4">
                <h1 className="text-2xl font-bold">Configuration Error</h1>
                <p>
                    Missing <code>NEXT_PUBLIC_CONVEX_URL</code> environment variable.
                </p>
                <p className="text-sm text-gray-600">
                    If you are the developer, please check your .env.local file or deployment settings.
                </p>
            </div>
        );
    }

    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
