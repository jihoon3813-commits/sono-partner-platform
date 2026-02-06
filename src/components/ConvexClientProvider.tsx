"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo, useState, useEffect } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

    useEffect(() => {
        console.log("ConvexClientProvider mounting...");
        setMounted(true);
    }, []);

    const convex = useMemo(() => {
        if (!convexUrl) return null;
        try {
            return new ConvexReactClient(convexUrl);
        } catch (e) {
            console.error("Convex initialization failed:", e);
            return null;
        }
    }, [convexUrl]);

    if (!mounted) {
        return (
            <div style={{ background: 'white', color: 'blue', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                로딩 중 (Mounting)...
            </div>
        );
    }

    if (!convexUrl || !convex) {
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', color: 'red', padding: '40px', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>환경 변수(ENV) 오류</h1>
                <p style={{ fontSize: '20px' }}>NEXT_PUBLIC_CONVEX_URL을 찾을 수 없습니다.</p>
                <div style={{ background: '#eee', padding: '15px', borderRadius: '10px', color: 'black' }}>
                    <strong>현재 설정된 값:</strong> <pre>{JSON.stringify(convexUrl)}</pre>
                </div>
                <p>로컬 개발 시 <code>.env.local</code> 파일을 확인해 주세요.</p>
            </div>
        );
    }

    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
