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

type Tool = 'laser' | 'pen' | 'highlighter' | 'rect' | 'circle' | 'eraser';

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
        if (activeTool === 'laser') return;
        setIsDrawing(true);
        const pos = getPos(e);
        
        if (activeTool === 'rect' || activeTool === 'circle') {
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

        if (!isDrawing) return;

        if (activeTool === 'rect' || activeTool === 'circle') {
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
                            onClick={() => window.print()}
                            className="absolute top-6 right-6 z-40 px-6 py-3 bg-[#e11d48] text-white rounded-full font-black text-sm shadow-xl hover:bg-[#be123c] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            PDF 다운로드
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
                                    id: 'circle', 
                                    icon: <circle cx="12" cy="12" r="10" />, 
                                    label: '원' 
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

            {/* Print Container */}
            <div id="lecture-print-container" className="hidden print:block bg-white text-black w-full">
                {slides.map((slide) => {
                    const isScrollable = 
                        slide.id.includes("product") || 
                        slide.id.includes("benefit") || 
                        slide.id.includes("detail") || 
                        slide.id.includes("table") || 
                        slide.id.includes("disclosure");
                    return (
                        <div 
                            key={slide.id} 
                            className={isScrollable ? "print-slide-scrollable bg-white" : "print-slide bg-white"}
                        >
                            {slide.content}
                        </div>
                    );
                })}
            </div>

            {/* Global Print Styles */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Hide everything in root except print container */
                    body > div:first-of-type {
                        display: none !important;
                    }
                    
                    #lecture-print-container {
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                    }
                    
                    .print-slide {
                        width: 297mm !important;
                        height: 210mm !important;
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
                        width: 297mm !important;
                        height: auto !important;
                        min-height: 210mm !important;
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
                    
                    .print-slide-scrollable p,
                    .print-slide-scrollable span,
                    .print-slide-scrollable table {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                }
            `}</style>
        </>
    );
}
