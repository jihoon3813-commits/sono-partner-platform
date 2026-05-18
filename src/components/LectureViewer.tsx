"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface Slide {
    id: string;
    content: React.ReactNode;
}

interface LectureViewerProps {
    slides: Slide[];
    productType: 'happy450' | 'smartcare';
}

type Tool = 'laser' | 'pen' | 'highlighter' | 'rect' | 'magnifier' | 'eraser';

interface DrawingPath {
    tool: Tool;
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

interface DrawingShape {
    tool: 'rect' | 'circle';
    start: { x: number; y: number };
    end: { x: number; y: number };
    color: string;
    width: number;
}

export default function LectureViewer({ slides, productType }: LectureViewerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeTool, setActiveTool] = useState<Tool>('laser');
    const [prevTool, setPrevTool] = useState<Tool>('pen');
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const [shapes, setShapes] = useState<DrawingShape[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
    
    const [isToolsVisible, setIsToolsVisible] = useState(true);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    
    const [magnifierPos, setMagnifierPos] = useState({ x: -1000, y: -1000 });
    const [magnifierRadius, setMagnifierRadius] = useState(150);
    const [magnifierZoom, setMagnifierZoom] = useState(2);
    const [showMagnifier, setShowMagnifier] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                setCurrentSlide(prev => Math.max(0, prev - 1));
            } else if (e.key.toLowerCase() === 'h') {
                setIsToolsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides.length]);

    // Clear canvas for new slide
    useEffect(() => {
        setPaths([]);
        setShapes([]);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [currentSlide]);

    // Handle canvas sizing
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                redraw();
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [paths, shapes]);

    const handlePdfDownload = async () => {
        setIsDownloadingPdf(true);
        try {
            // Load html2canvas dynamically
            if (!(window as any).html2canvas) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            
            // Load jsPDF dynamically
            if (!(window as any).jspdf) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            const html2canvasLib = (window as any).html2canvas;
            const { jsPDF } = (window as any).jspdf;

            const element = document.getElementById('lecture-pdf-container');
            if (!element) return;
            
            // Ensure container is briefly styled to be captured cleanly
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.display = 'block';

            // Find all pages to convert
            const pages = element.querySelectorAll('.pdf-export-page');
            if (pages.length === 0) {
                alert("인쇄할 페이지를 찾을 수 없습니다.");
                return;
            }

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1440, 1080],
                hotfixes: ["px_gstate"]
            });

            for (let i = 0; i < pages.length; i++) {
                const pageEl = pages[i] as HTMLElement;
                
                const canvas = await html2canvasLib(pageEl, {
                    scale: 2, // 2x scale for sharp text
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                if (i > 0) {
                    pdf.addPage([1440, 1080], 'landscape');
                }
                
                pdf.addImage(imgData, 'JPEG', 0, 0, 1440, 1080);
            }

            pdf.save(`${productType}_lecture.pdf`);
        } catch (e) {
            console.error("PDF generation failed", e);
            alert("PDF 다운로드 중 오류가 발생했습니다.");
        } finally {
            setIsDownloadingPdf(false);
            
            const element = document.getElementById('lecture-pdf-container');
            if (element) {
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
            }
        }
    };

    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw paths
        paths.forEach(path => {
            if (path.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.width;
            if (path.tool === 'highlighter') {
                ctx.globalAlpha = 0.3;
            } else {
                ctx.globalAlpha = 1.0;
            }
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();
        });

        // Draw shapes
        ctx.globalAlpha = 1.0;
        shapes.forEach(shape => {
            ctx.beginPath();
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.width;
            const w = shape.end.x - shape.start.x;
            const h = shape.end.y - shape.start.y;
            if (shape.tool === 'rect') {
                ctx.strokeRect(shape.start.x, shape.start.y, w, h);
            } else {
                const r = Math.sqrt(w*w + h*h);
                ctx.arc(shape.start.x, shape.start.y, r, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });
        ctx.globalAlpha = 1.0;
    }, [paths, shapes]);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (activeTool === 'laser' || activeTool === 'magnifier') return;
        setIsDrawing(true);
        const pos = getPos(e);
        
        if (activeTool === 'rect') {
            setShapes(prev => [...prev, {
                tool: activeTool,
                start: pos,
                end: pos,
                color: '#ff0000',
                width: 3
            }]);
        } else {
            setPaths(prev => [...prev, {
                tool: activeTool,
                points: [pos],
                color: activeTool === 'eraser' ? '#ffffff' : (activeTool === 'highlighter' ? '#ffff00' : '#ff0000'),
                width: activeTool === 'eraser' ? 20 : (activeTool === 'highlighter' ? 15 : 3)
            }]);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getPos(e);
        if (activeTool === 'laser') {
            setLaserPos(pos);
            return;
        }

        if (activeTool === 'magnifier') {
            setMagnifierPos(pos);
            setShowMagnifier(true);
            return;
        }

        if (!isDrawing) return;

        if (activeTool === 'rect') {
            setShapes(prev => {
                const newShapes = [...prev];
                newShapes[newShapes.length - 1].end = pos;
                return newShapes;
            });
        } else {
            setPaths(prev => {
                const newPaths = [...prev];
                const currentPath = newPaths[newPaths.length - 1];
                currentPath.points.push(pos);
                return newPaths;
            });
        }
        redraw();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setShowMagnifier(false);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (activeTool === 'laser') {
            setActiveTool(prevTool);
        } else {
            setPrevTool(activeTool);
            setActiveTool('laser');
        }
    };

    const clearCanvas = () => {
        setPaths([]);
        setShapes([]);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden select-none print:hidden">
                {/* 4:3 Aspect Ratio Container */}
                <div 
                    ref={containerRef}
                    className={`relative bg-white shadow-2xl overflow-hidden ${activeTool === 'laser' ? 'cursor-none' : 'cursor-crosshair touch-none'}`}
                    style={{
                        aspectRatio: '4 / 3',
                        width: 'min(100vw, (100vh * 4 / 3))',
                        height: 'min(100vh, (100vw * 3 / 4))'
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onContextMenu={handleContextMenu}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                >
                    {/* Content Layer */}
                    <div className={`absolute inset-0 ${activeTool !== 'laser' ? 'pointer-events-none select-none' : ''}`}>
                        {slides[currentSlide]?.content}
                    </div>

                    {/* Canvas Layer */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 z-10 pointer-events-none touch-none"
                    />

                    {/* Laser Pointer */}
                    {activeTool === 'laser' && (
                        <div 
                            className="absolute w-6 h-6 bg-red-500 rounded-full blur-[2px] opacity-80 pointer-events-none z-20 transition-transform duration-75"
                            style={{
                                left: laserPos.x,
                                top: laserPos.y,
                                transform: 'translate(-50%, -50%)',
                                boxShadow: '0 0 15px 5px rgba(239, 68, 68, 0.6)'
                            }}
                        >
                            <div className="absolute inset-0 bg-white rounded-full scale-50 opacity-40"></div>
                        </div>
                    )}

                    {/* Magnifier Lens */}
                    {activeTool === 'magnifier' && showMagnifier && containerRef.current && (
                        <div 
                            className="absolute pointer-events-none z-50 border-[6px] border-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden rounded-full bg-white"
                            style={{
                                left: magnifierPos.x - magnifierRadius,
                                top: magnifierPos.y - magnifierRadius,
                                width: magnifierRadius * 2,
                                height: magnifierRadius * 2,
                            }}
                        >
                            <div 
                                style={{
                                    position: 'absolute',
                                    left: -magnifierPos.x * magnifierZoom + magnifierRadius,
                                    top: -magnifierPos.y * magnifierZoom + magnifierRadius,
                                    width: containerRef.current.getBoundingClientRect().width,
                                    height: containerRef.current.getBoundingClientRect().height,
                                    transform: `scale(${magnifierZoom})`,
                                    transformOrigin: 'top left',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                            >
                                {slides[currentSlide]?.content}
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs (Top Left) */}
                    <div className="absolute top-6 left-6 z-30 flex gap-2">
                        <Link 
                            href="/lecture/happy450"
                            className={`px-5 py-2.5 rounded-full font-black text-sm transition-all shadow-lg ${productType === 'happy450' ? 'bg-sono-primary text-white scale-105' : 'bg-white/90 text-gray-500 hover:bg-white'}`}
                        >
                            더해피450 ONE
                        </Link>
                        <Link 
                            href="/lecture/smartcare"
                            className={`px-5 py-2.5 rounded-full font-black text-sm transition-all shadow-lg ${productType === 'smartcare' ? 'bg-sono-primary text-white scale-105' : 'bg-white/90 text-gray-500 hover:bg-white'}`}
                        >
                            스마트케어
                        </Link>
                    </div>

                    {/* PDF Download Button (Top Right) */}
                    {(currentSlide === 0 || currentSlide === slides.length - 1) && (
                        <button
                            onClick={handlePdfDownload}
                            disabled={isDownloadingPdf}
                            className={`absolute top-6 right-6 z-40 px-5 py-2.5 bg-[#e11d48] text-white rounded-full font-black text-sm shadow-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${isDownloadingPdf ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#be123c] cursor-pointer'}`}
                        >
                            {isDownloadingPdf ? (
                                <svg className="animate-spin w-[14px] h-[14px] flex-shrink-0 align-middle text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-[14px] h-[14px] flex-shrink-0 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            )}
                            <span className="whitespace-nowrap leading-none">{isDownloadingPdf ? '생성 중...' : 'PDF 다운로드'}</span>
                        </button>
                    )}

                    {/* Drawing Tools (Bottom Left) */}
                    <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2">
                        {/* Toggle Button (Far Left) */}
                        <button
                            onClick={() => setIsToolsVisible(prev => !prev)}
                            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 flex items-center justify-center hover:bg-white transition-all text-gray-400 hover:text-sono-primary"
                            title={isToolsVisible ? "도구 숨기기" : "도구 보이기"}
                        >
                            {isToolsVisible ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            )}
                        </button>

                        {/* Main Toolbar */}
                        <div className={`flex gap-1 bg-white p-1.5 rounded-2xl shadow-2xl border border-gray-100 transition-all duration-500 origin-left ${isToolsVisible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-10 opacity-0 scale-90 pointer-events-none'}`}>
                            {[
                                { 
                                    id: 'laser', 
                                    icon: (
                                        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="currentColor" stroke="none" />
                                    ), 
                                    label: '레이저' 
                                },
                                { 
                                    id: 'pen', 
                                    icon: <path d="M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-1.5 M15.8 10.8l-1.5-1.5 M2 22l5-1 12-12-4-4-12 12-1 5z" />, 
                                    label: '펜' 
                                },
                                { 
                                    id: 'highlighter', 
                                    icon: <path d="M21 11.5L12.5 3l-8.5 8.5L7 14.5l-3 3L7 21l3-3 3 3L21 11.5z M10 7.5l3.5 3.5" />, 
                                    label: '형광펜' 
                                },
                                { 
                                    id: 'rect', 
                                    icon: <rect x="3" y="3" width="18" height="18" rx="2" />, 
                                    label: '사각형' 
                                },
                                { 
                                    id: 'magnifier', 
                                    icon: (
                                        <>
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                            <line x1="11" y1="8" x2="11" y2="14" />
                                            <line x1="8" y1="11" x2="14" y2="11" />
                                        </>
                                    ), 
                                    label: '돋보기' 
                                },
                                { 
                                    id: 'eraser', 
                                    icon: <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z M17 17L7 7" />, 
                                    label: '지우개' 
                                },
                            ].map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveTool(tool.id as Tool)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTool === tool.id ? 'bg-sono-primary text-white scale-105 shadow-md' : 'hover:bg-gray-50 text-gray-400 hover:text-sono-dark'}`}
                                    title={tool.label}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        {tool.icon}
                                    </svg>
                                </button>
                            ))}
                            <div className="w-px h-6 bg-gray-100 self-center mx-1"></div>
                            <button
                                onClick={clearCanvas}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                                title="전체 지우기"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

                        {/* Magnifier Sub-Toolbar (Adjust size & zoom on the fly) */}
                        {activeTool === 'magnifier' && isToolsVisible && (
                            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-2 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-left-5 duration-300">
                                <span className="text-xs font-black text-gray-500 whitespace-nowrap">돋보기 크기</span>
                                <input 
                                    type="range" 
                                    min="60" 
                                    max="350" 
                                    value={magnifierRadius} 
                                    onChange={(e) => setMagnifierRadius(Number(e.target.value))}
                                    className="w-28 accent-sono-primary cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
                                />
                                <span className="text-xs font-black text-sono-primary min-w-[36px] text-center tabular-nums">{magnifierRadius * 2}px</span>
                                
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                
                                <span className="text-xs font-black text-gray-500 whitespace-nowrap font-sans">배율</span>
                                <select 
                                    value={magnifierZoom} 
                                    onChange={(e) => setMagnifierZoom(Number(e.target.value))}
                                    className="text-xs font-black text-sono-dark bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <option value={1.5}>1.5배</option>
                                    <option value={2}>2배</option>
                                    <option value={2.5}>2.5배</option>
                                    <option value={3}>3배</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Slide Info (Bottom Right) */}
                    <div className="absolute bottom-6 right-6 z-30 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/20">
                        <button 
                            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                            disabled={currentSlide === 0}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 text-sono-dark"
                        >
                            ◀
                        </button>
                        <span className="font-black text-lg text-sono-dark tabular-nums min-w-[60px] text-center">
                            {currentSlide + 1} / {slides.length}
                        </span>
                        <button 
                            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                            disabled={currentSlide === slides.length - 1}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 text-sono-dark"
                        >
                            ▶
                        </button>
                    </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                    Use Arrow Keys to Navigate • Right Click to Toggle Laser • Press 'H' to Toggle Tools
                </div>
            </div>

             {/* PDF Export Container */}
             <div 
                 id="lecture-pdf-container" 
                 className="fixed top-0 left-[-9999px] w-[1440px] flex flex-col pointer-events-none z-[-9999] bg-white opacity-0"
                 style={{ visibility: isDownloadingPdf ? 'visible' : 'hidden' }}
             >
                 {slides.map((slide, index) => {
                     const isAppliance = slide.id.includes("products");
                     
                     // Need to use React from global scope if we clone elements, but wait, we can just pass props if it's our ApplianceGridSlide.
                     // Actually, we don't even need to clone if the element is already structured, because we refactored ApplianceGridSlide to output exact .pdf-export-page chunks!
                     // Since ApplianceGridSlide returns multiple chunks formatted correctly, we just wrap it!
                     return (
                         <div key={slide.id}>
                             <div className={isAppliance ? 'w-[1440px] h-auto flex flex-col bg-[#f8fafc]' : 'w-[1440px] h-[1080px] pdf-export-page shrink-0 relative bg-white overflow-hidden'}>
                                 {slide.content}
                             </div>
                             {index < slides.length - 1 && <div className="html2pdf__page-break"></div>}
                         </div>
                     );
                 })}
             </div>
 
             {/* Global Print Styles */}
             <style>{`
                 #lecture-pdf-container .pdf-export-page {
                     height: 1080px !important;
                     min-height: 1080px !important;
                     max-height: 1080px !important;
                     box-sizing: border-box !important;
                     overflow: hidden !important;
                 }
                 
                 @media print {
                     body {
                         background: white !important;
                         color: black !important;
                         -webkit-print-color-adjust: exact !important;
                         print-color-adjust: exact !important;
                     }
                     
                     /* Hide interactive screen viewer */
                     .print\\:hidden {
                         display: none !important;
                     }
                     
                     /* Reset root / parent containers to display natural block flow */
                     html, body, #__next, body > div {
                         height: auto !important;
                         min-height: 0 !important;
                         overflow: visible !important;
                         position: static !important;
                         background: white !important;
                     }
                     
                     #lecture-print-container {
                         display: block !important;
                         width: 100% !important;
                         height: auto !important;
                         background: white !important;
                         position: absolute !important;
                         top: 0 !important;
                         left: 0 !important;
                         z-index: 99999 !important;
                     }
                     
                     .print-slide {
                         width: 100% !important;
                         height: 180mm !important;
                         overflow: hidden !important;
                         box-sizing: border-box !important;
                         page-break-after: always !important;
                         break-after: page !important;
                         background: white !important;
                         position: relative !important;
                         display: flex !important;
                         flex-direction: column !important;
                     }
                     
                     .print-slide-scrollable {
                         width: 100% !important;
                         height: auto !important;
                         min-height: 180mm !important;
                         overflow: visible !important;
                         box-sizing: border-box !important;
                         page-break-after: always !important;
                         break-after: page !important;
                         background: white !important;
                         position: relative !important;
                         display: block !important;
                     }
 
                     /* Override scrollable classes to expand full contents */
                     .print-slide-scrollable * {
                         overflow: visible !important;
                         max-height: none !important;
                         height: auto !important;
                     }
                     
                     /* Prevent product grid items from being cut in half horizontally */
                     .print-slide-scrollable .grid > div {
                         page-break-inside: avoid !important;
                         break-inside: avoid !important;
                     }
                     
                     .print-slide-scrollable p,
                     .print-slide-scrollable span,
                     .print-slide-scrollable table {
                         page-break-inside: avoid !important;
                         break-inside: avoid !important;
                     }
 
                     @page {
                         size: A4 landscape;
                         margin: 15mm !important;
                     }
                 }
             `}</style>
        </>
    );
}
