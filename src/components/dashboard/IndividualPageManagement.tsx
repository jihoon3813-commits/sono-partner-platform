"use client";

import { useState } from "react";
import { AdminIcon } from "./AdminIcons";

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
        <div className="space-y-4">
            <section className="adm-panel overflow-hidden">
                <div className="adm-panel-head">
                    <div>
                        <h2 className="adm-panel-title">개별 랜딩페이지 관리</h2>
                        <p className="adm-panel-sub">특정 파트너나 캠페인을 위해 생성된 단독 랜딩페이지 목록입니다.</p>
                    </div>
                </div>

                <div className="p-5 grid gap-3.5">
                    {individualPages.map((page) => (
                        <div key={page.path} className="adm-note-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-[#162438]">{page.title}</h3>
                                    <span className="adm-pill green">Standalone</span>
                                </div>
                                <p className="text-xs text-[#5a6b82]">{page.description}</p>
                                <div className="bg-white px-3 py-2 rounded-[8px] border border-[#e1e7f0] font-mono text-xs text-[#163a6b] font-semibold truncate">
                                    {baseUrl}{page.path}
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleCopy(page.path)}
                                    className={`flex-1 md:flex-none adm-btn ${
                                        copySuccess === page.path ? "primary" : "sage"
                                    }`}
                                >
                                    <AdminIcon name={copySuccess === page.path ? "check" : "copy"} />
                                    <span>{copySuccess === page.path ? "복사완료" : "주소 복사"}</span>
                                </button>
                                <a
                                    href={page.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none adm-btn primary"
                                >
                                    <span>페이지 이동</span>
                                    <AdminIcon name="external" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="adm-section-note">
                <AdminIcon name="info" />
                <div>
                    <strong className="mr-1.5">안내사항:</strong>
                    <span>
                        개별 랜딩페이지는 특정 파트너의 요청에 따라 고정된 디자인과 URL로 제공되는 특별 페이지입니다. 신규 개별 페이지 생성이 필요한 경우 개발팀에 문의해 주세요.
                    </span>
                </div>
            </div>
        </div>
    );
}
