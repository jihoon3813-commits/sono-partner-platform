/**
 * 파일 크기를 읽기 쉬운 단위(B, KB, MB, GB)로 변환합니다.
 */
export function formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * 녹취 파일 다운로드 시 사용할 파일명 생성
 * 규칙: 등록일시_상위파트너_파트너_고객명_전화번호_시간.확장자
 * 예: 20261019_소노_강남지사_홍길동_01012345678_10분25초.mp3
 */
export function generateRecordingDownloadFileName({
    uploadedAt,
    parentPartnerName,
    partnerName,
    customerName,
    customerPhone,
    duration,
    originalFileName,
}: {
    uploadedAt?: string;
    parentPartnerName?: string;
    partnerName?: string;
    customerName?: string;
    customerPhone?: string;
    duration?: number;
    originalFileName: string;
}): string {
    // 1. 등록일자 및 시각 추출
    let dateStr = "20261019";
    let timeStr = "00시00분";
    if (uploadedAt) {
        try {
            const d = new Date(uploadedAt);
            if (!isNaN(d.getTime())) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                const hh = String(d.getHours()).padStart(2, "0");
                const min = String(d.getMinutes()).padStart(2, "0");
                dateStr = `${yyyy}${mm}${dd}`;
                timeStr = `${hh}시${min}분`;
            }
        } catch {
            // fallback
        }
    }

    // 2. 상위 파트너 (없으면 '본사')
    const parentClean = (parentPartnerName && parentPartnerName.trim() !== "" ? parentPartnerName : "본사")
        .trim()
        .replace(/[\/\\:*?"<>|\s]/g, "");

    // 3. 파트너사
    const partnerClean = (partnerName && partnerName.trim() !== "" ? partnerName : "본사")
        .trim()
        .replace(/[\/\\:*?"<>|\s]/g, "");

    // 4. 고객명
    const nameClean = (customerName && customerName.trim() !== "" ? customerName : "고객")
        .trim()
        .replace(/[\/\\:*?"<>|\s]/g, "");

    // 5. 전화번호 (숫자만)
    const phoneClean = (customerPhone || "").replace(/[^0-9]/g, "") || "연락처없음";

    // 6. 시간 (음성 재생길이가 있으면 'N분N초', 없으면 업로드 시각 'HH시MM분')
    let durationOrTime = timeStr;
    if (duration && duration > 0) {
        const m = Math.floor(duration / 60);
        const s = Math.floor(duration % 60);
        durationOrTime = m > 0 ? `${m}분${String(s).padStart(2, "0")}초` : `${s}초`;
    }

    // 7. 확장자 추출 (.mp3, .m4a 등)
    const extMatch = (originalFileName || "").match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : ".mp3";

    return `${dateStr}_${parentClean}_${partnerClean}_${nameClean}_${phoneClean}_${durationOrTime}${ext}`;
}

/**
 * 브라우저 크로스 도메인 다운로드 시에도 커스텀 파일명을 100% 보장하는 다운로드 실행기
 */
export async function downloadFileWithCustomName(url: string, fileName: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.warn("Direct blob download failed, falling back to window.open link:", err);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
