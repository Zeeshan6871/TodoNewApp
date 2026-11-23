"use client";

import { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { formatFileSize } from "@/lib/date-utils";

export function ImageLightbox({ attachment, onClose }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!attachment) return null;

  const fileUrl = `/api/attachments/${attachment.id}`;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent text-white">
        <div className="min-w-0 pr-4">
          <p className="text-sm font-medium truncate">{attachment.originalName}</p>
          <p className="text-xs text-white/70">{formatFileSize(attachment.size)} • Stored in MongoDB</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <a
            href={fileUrl}
            download={attachment.originalName}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Download Image"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white ml-2 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image Preview Container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={fileUrl}
          alt={attachment.originalName}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: "transform 0.15s ease-out",
          }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
        />
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 bg-black/40 px-3 py-1.5 rounded-full pointer-events-none">
        Click outside or press ESC to close
      </div>
    </div>
  );
}

