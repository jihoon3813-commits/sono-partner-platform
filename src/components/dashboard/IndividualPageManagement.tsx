"use client";

import { useState } from "react";

export default function IndividualPageManagement() {
    const [baseUrl] = useState(typeof window !== "undefined" ? window.location.origin : "");
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    const individualPages = [
        {
            title: "더해피450 (니오라 전용)",
            path: "/neora/happy450",
            description: "니오라 파트너를 위한 단독 더해피450 랜딩페이지입니다.",
        },
        {
            title: "스마트케어 (니오라 전용)",
            path: "/neora/smartcare",
            description: "니오라 파트너를 위한 단독 스마트케어 랜딩페이지입니다.",
        }
    ];

    const handleCopy = (path: string) => {
        const url = `${baseUrl}${path}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(path);
            setTimeout(() => setCopySuccess(null), 2000);
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-sono-dark tracking-tighter">개별 랜딩페이지 관리</h2>
                <p className="text-sm text-gray-400 mt-1 font-medium">특정 파트너나 캠페인을 위해 생성된 단독 랜딩페이지 목록입니다.</p>
            </div>

            <div className="grid gap-4">
                {individualPages.map((page) => (
                    <div key={page.path} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-black text-sono-dark group-hover:text-sono-primary transition-colors">{page.title}</h3>
                                    <span className="bg-sono-primary/10 text-sono-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Standalone</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">{page.description}</p>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono text-sm text-sono-primary truncate">
                                    {baseUrl}{page.path}
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleCopy(page.path)}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                        copySuccess === page.path
                                            ? "bg-green-500 text-white"
                                            : "bg-sono-primary/10 text-sono-primary hover:bg-sono-primary hover:text-white"
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    {copySuccess === page.path ? "복사완료" : "주소 복사"}
                                </button>
                                <a
                                    href={page.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sono-dark text-white font-bold text-sm hover:bg-black transition-all shadow-lg shadow-black/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    페이지 이동
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                <div className="flex gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl h-fit">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 mb-1">안내사항</h4>
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            개별 랜딩페이지는 특정 파트너의 요청에 따라 고정된 디자인과 URL로 제공되는 특별 페이지입니다.<br />
                            신규 개별 페이지 생성이 필요한 경우 개발팀에 문의해 주세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
