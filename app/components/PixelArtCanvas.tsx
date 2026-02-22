"use client";

import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Color } from "../lib/paletteParser";
import { convertToPixelArt, ColorAlgorithm } from "../lib/pixelArtConverter";
import { ImageAdjustmentValues } from "./ImageAdjustments";

interface PixelArtCanvasProps {
  imageSrc: string;
  pixelSize: number;
  palette: Color[] | null;
  algorithm: ColorAlgorithm;
  adjustments: ImageAdjustmentValues;
  onReady?: () => void;
}

export interface PixelArtCanvasHandle {
  download: () => void;
  getDataUrl: () => string | null;
}

const PixelArtCanvas = forwardRef<PixelArtCanvasHandle, PixelArtCanvasProps>(
  ({ imageSrc, pixelSize, palette, algorithm, adjustments, onReady }, ref) => {
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const outputCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const drawSourceWithAdjustments = useCallback(() => {
      const source = sourceCanvasRef.current;
      const img = imgRef.current;
      if (!source || !img) return;
      const ctx = source.getContext("2d");
      if (!ctx) return;
      const clamp = (v: number, min: number, max: number) =>
        Math.min(max, Math.max(min, isFinite(v) ? v : 100));
      const brightness = clamp(adjustments.brightness, 0, 200);
      const contrast = clamp(adjustments.contrast, 0, 200);
      const saturation = clamp(adjustments.saturation, 0, 200);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.clearRect(0, 0, source.width, source.height);
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";
    }, [adjustments]);

    const render = useCallback(() => {
      const source = sourceCanvasRef.current;
      const output = outputCanvasRef.current;
      if (!source || !output) return;
      drawSourceWithAdjustments();
      convertToPixelArt(source, output, pixelSize, palette, algorithm);
      onReady?.();
    }, [pixelSize, palette, algorithm, onReady, drawSourceWithAdjustments]);

    // Load image into source canvas
    useEffect(() => {
      const source = sourceCanvasRef.current;
      if (!source || !imageSrc) return;

      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        source.width = img.naturalWidth;
        source.height = img.naturalHeight;
        render();
      };
      img.src = imageSrc;
    }, [imageSrc, render]);

    // Re-render when pixelSize, palette, or adjustments change
    useEffect(() => {
      if (!imageSrc) return;
      const source = sourceCanvasRef.current;
      if (source && source.width > 0) {
        render();
      }
    }, [pixelSize, palette, adjustments, render, imageSrc]);

    useImperativeHandle(ref, () => ({
      download: () => {
        const canvas = outputCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "pixel-art.png";
        link.click();
      },
      getDataUrl: () => {
        return outputCanvasRef.current?.toDataURL("image/png") ?? null;
      },
    }));

    return (
      <div className="relative">
        {/* Hidden source canvas */}
        <canvas ref={sourceCanvasRef} className="hidden" />
        {/* Output canvas - visible */}
        <canvas
          ref={outputCanvasRef}
          className="max-w-full rounded-lg shadow-lg border border-gray-200"
          style={{ imageRendering: "pixelated" }}
          title="Right-click to save image"
        />
      </div>
    );
  }
);

PixelArtCanvas.displayName = "PixelArtCanvas";
export default PixelArtCanvas;
