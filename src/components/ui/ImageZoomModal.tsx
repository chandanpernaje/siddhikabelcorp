import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Move,
  ShieldCheck,
} from "lucide-react";

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText: string;
  title?: string;
  brand?: string;
  partNo?: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  altText,
  title,
  brand,
  partNo,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-" || e.key === "_") handleZoomOut();
      if (e.key === "0") handleResetZoom();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, scale]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.35, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md transition-all select-none p-2 sm:p-4 animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3 text-white min-w-0 pr-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-amber-400">
              {brand && <span className="font-bold">{brand}</span>}
              {partNo && (
                <>
                  <span>·</span>
                  <span className="text-slate-300 font-bold">{partNo}</span>
                </>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
              {title || altText}
            </h3>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 transition-colors shadow-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-rose-900/40 hover:border-rose-700/60 transition-colors shadow-sm"
            aria-label="Close zoom viewer"
            title="Close viewer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
          scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="relative max-w-full max-h-[80vh] flex items-center justify-center"
        >
          <img
            src={imageSrc}
            alt={altText}
            referrerPolicy="no-referrer"
            draggable={false}
            className="max-w-[90vw] max-h-[75vh] object-contain drop-shadow-2xl rounded-2xl pointer-events-none"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/images/card-olflex.jpg";
            }}
          />
        </div>
      </div>

      {/* Floating Bottom Zoom Controls Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900/90 border border-slate-700/90 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className="p-2.5 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-colors font-bold flex items-center gap-1 text-xs"
          title="Zoom Out (-)"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
          <span className="hidden sm:inline font-mono">Zoom -</span>
        </button>

        {/* Current Scale Percentage Badge */}
        <div className="px-3 py-1 font-mono text-xs font-bold text-amber-400 bg-slate-950 rounded-lg border border-slate-800 min-w-[56px] text-center tabular-nums">
          {Math.round(scale * 100)}%
        </div>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className="p-2.5 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-colors font-bold flex items-center gap-1 text-xs"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
          <span className="hidden sm:inline font-mono">Zoom +</span>
        </button>

        <div className="h-5 w-px bg-slate-700 mx-1" />

        <button
          onClick={handleResetZoom}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          className="p-2.5 text-slate-300 hover:text-amber-400 disabled:opacity-40 disabled:hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-colors font-bold flex items-center gap-1 text-xs"
          title="Reset View (100%)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {scale > 1 && (
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400 pl-2 pr-1">
            <Move className="w-3 h-3 text-amber-400" />
            <span>Drag to Pan</span>
          </div>
        )}
      </div>
    </div>
  );
};
