// 브라우저 클라이언트 음성파일 압축 모듈
// 통화 녹취 음성에 최적화: 22.05kHz, Mono(1채널), 32kbps MP3 인코딩
// 10분 통화(11MB m4a) 기준 -> 약 2.3MB (약 75~80% 용량 절감)

export interface CompressionResult {
    compressedFile: File;
    originalSize: number;
    compressedSize: number;
    reductionPercent: number; // 절감률 (%)
    duration: number; // 음성 길이 (초)
}

export interface ProgressInfo {
    stage: string;
    percent: number;
}

/**
 * 음성 파일을 통화 녹취에 최적화된 MP3로 압축 변환합니다.
 */
export async function compressAudioFile(
    file: File,
    onProgress?: (info: ProgressInfo) => void
): Promise<CompressionResult> {
    if (typeof window === "undefined") {
        throw new Error("브라우저 환경에서만 오디오 압축을 실행할 수 있습니다.");
    }

    onProgress?.({ stage: "음성 파일 분석 및 디코딩 중...", percent: 10 });

    // 1. ArrayBuffer 읽기
    const arrayBuffer = await file.arrayBuffer();

    // 2. Web Audio API로 오디오 디코딩
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
        throw new Error("해당 브라우저가 Web Audio API를 지원하지 않습니다.");
    }

    const audioCtx = new AudioContextClass();
    let audioBuffer: AudioBuffer;
    try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (decodeErr) {
        audioCtx.close().catch(() => {});
        throw new Error("오디오 파일 디코딩에 실패했습니다. 유효한 음성 파일인지 확인해주세요.");
    }

    const duration = audioBuffer.duration;
    onProgress?.({ stage: "통화 음성 대역으로 리샘플링 중...", percent: 30 });

    // 3. 통화 음성에 최적화된 리샘플링 (Mono, 22,050Hz)
    // 사람 목소리 통화 녹음은 22,050Hz 모노로 충분히 고음질이며 용량을 크게 아낍니다.
    const targetSampleRate = 22050;
    const targetChannels = 1;
    const targetBitrate = 32; // 32kbps (10분 통화 기준 약 2.3MB)

    const OfflineAudioCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const offlineCtx = new OfflineAudioCtxClass(
        targetChannels,
        Math.ceil(duration * targetSampleRate),
        targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const resampledBuffer = await offlineCtx.startRendering();
    audioCtx.close().catch(() => {});

    onProgress?.({ stage: "고음질 MP3 인코딩 중...", percent: 50 });

    // 4. Float32Array PCM을 16-bit Int16Array PCM으로 변환
    const floatSamples = resampledBuffer.getChannelData(0);
    const totalSamples = floatSamples.length;
    const pcm16 = new Int16Array(totalSamples);

    for (let i = 0; i < totalSamples; i++) {
        const s = Math.max(-1, Math.min(1, floatSamples[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // 5. LAME MP3 인코더 로드 및 인코딩
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const lamejs = require("./lame.min.js");
    const mp3encoder = new lamejs.Mp3Encoder(targetChannels, targetSampleRate, targetBitrate);

    const mp3Chunks: Uint8Array[] = [];
    const chunkSize = 1152; // LAME 내부 표준 버퍼 크기
    let processedSamples = 0;

    for (let i = 0; i < totalSamples; i += chunkSize) {
        const chunk = pcm16.subarray(i, Math.min(i + chunkSize, totalSamples));
        const mp3buf = mp3encoder.encodeBuffer(chunk);
        if (mp3buf.length > 0) {
            mp3Chunks.push(new Uint8Array(mp3buf));
        }

        processedSamples += chunk.length;
        if (i % (chunkSize * 50) === 0 || processedSamples >= totalSamples) {
            const currentPercent = 50 + Math.round((processedSamples / totalSamples) * 45);
            onProgress?.({ stage: "고음질 MP3 인코딩 중...", percent: currentPercent });
        }
    }

    const flushBuf = mp3encoder.flush();
    if (flushBuf.length > 0) {
        mp3Chunks.push(new Uint8Array(flushBuf));
    }

    onProgress?.({ stage: "압축 파일 생성 완료", percent: 100 });

    // 6. MP3 Blob 및 File 생성
    const blob = new Blob(mp3Chunks as any, { type: "audio/mpeg" });

    // 확장자 변환: .m4a / .wav -> .mp3
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const newFileName = `${baseName}.mp3`;
    const compressedFile = new File([blob], newFileName, {
        type: "audio/mpeg",
        lastModified: Date.now(),
    });

    const originalSize = file.size;
    const compressedSize = compressedFile.size;
    const reductionPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

    return {
        compressedFile,
        originalSize,
        compressedSize,
        reductionPercent,
        duration,
    };
}
