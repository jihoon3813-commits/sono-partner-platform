import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 분단위 지정 시각 자동 동기화 (매 1분마다 KST 시각 체크 후 해당 분 시각 설정 플랜 자동 실행)
crons.interval(
    "minute-level-auto-update-checker",
    { minutes: 1 },
    internal.products.runAutoUpdateCron,
    {}
);

export default crons;
