"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    const convex = useMemo(() => {
        if (!convexUrl) return null;
        return new ConvexReactClient(convexUrl);
    }, [convexUrl]);

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
