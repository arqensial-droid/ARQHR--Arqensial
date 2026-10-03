import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  RefreshCw,
  Maximize2,
} from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  cropShape?: 'round' | 'rect';
  aspectRatio?: number; // 1 for 1:1, etc.
  title?: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onClose: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  cropShape = 'round',
  aspectRatio = 1,
  title = 'Crop & Position Image',
  onCropComplete,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgElement(img);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw interactive preview canvas
  useEffect(() => {
    if (!isOpen || !imgElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Save state
    ctx.save();

    // Center and transform
    ctx.translate(size / 2 + position.x, size / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    const aspect = imgElement.width / imgElement.height;
    let drawWidth = size;
    let drawHeight = size;

    if (aspect > 1) {
      drawHeight = size / aspect;
    } else {
      drawWidth = size * aspect;
    }

    ctx.drawImage(imgElement, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Draw mask overlay
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)'; // Slate 900 semi-transparent

    ctx.beginPath();
    ctx.rect(0, 0, size, size);

    if (cropShape === 'round') {
      ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2, true);
    } else {
      ctx.rect(12, 12, size - 24, size - 24);
    }
    ctx.fill('evenodd');

    // Outline
    ctx.strokeStyle = '#14B8A6'; // Teal accent
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    if (cropShape === 'round') {
      ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
    } else {
      ctx.strokeRect(12, 12, size - 24, size - 24);
    }
    ctx.stroke();
    ctx.restore();
  }, [isOpen, imgElement, scale, rotation, position, cropShape]);

  if (!isOpen) return null;

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Generate cropped output
  const handleApply = () => {
    if (!imgElement) return;
    setIsProcessing(true);

    try {
      const outputCanvas = document.createElement('canvas');
      const outputSize = 512; // 512x512 high-res output
      outputCanvas.width = outputSize;
      outputCanvas.height = outputSize;

      const ctx = outputCanvas.getContext('2d');
      if (!ctx) return;

      // Circle clip if round
      if (cropShape === 'round') {
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      ctx.save();
      // Map coordinates from 320 preview to 512 output
      const ratio = outputSize / 320;
      ctx.translate(outputSize / 2 + position.x * ratio, outputSize / 2 + position.y * ratio);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale * ratio, scale * ratio);

      const aspect = imgElement.width / imgElement.height;
      let drawWidth = 320;
      let drawHeight = 320;
      if (aspect > 1) {
        drawHeight = 320 / aspect;
      } else {
        drawWidth = 320 * aspect;
      }

      ctx.drawImage(imgElement, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const dataUrl = outputCanvas.toDataURL('image/png', 0.95);
      outputCanvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) {
            onCropComplete(blob, dataUrl);
            onClose();
          }
        },
        'image/png',
        0.95
      );
    } catch (err) {
      setIsProcessing(false);
      console.error('Crop failed:', err);
    }
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-bold">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Drag to reposition, slider to zoom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Workspace */}
        <div className="p-6 flex flex-col items-center bg-slate-900 select-none">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-move rounded-xl shadow-lg border border-slate-700 max-w-full"
            style={{ width: '320px', height: '320px' }}
          />

          <span className="text-[10px] text-slate-400 mt-2 font-mono">
            {cropShape === 'round' ? 'Circular Profile Crop' : 'Rectangular Format Crop'}
          </span>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3 bg-white dark:bg-[#0F172A]">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-[#0F766E] cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-mono font-semibold w-10 text-right text-slate-600 dark:text-slate-300">
              {scale.toFixed(1)}x
            </span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isProcessing}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
