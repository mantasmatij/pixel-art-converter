"use client";

import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Color } from "../lib/paletteParser";
import { convertToPixelArt, ColorAlgorithm } from "../lib/pixelArtConverter";

interface PixelArtCanvasProps {
  imageSrc: string;
  pixelSize: number;
  palette: Color[] | null;
  algorithm: ColorAlgorithm;
  onReady?: () => void;
}

export interface PixelArtCanvasHandle {
  download: () => void;
  getDataUrl: () => string | null;
}

const PixelArtCanvas = forwardRef<PixelArtCanvasHandle, PixelArtCanvasProps>(
  ({ imageSrc, pixelSize, palette, algorithm, onReady }, ref) => {
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const outputCanvasRef = useRef<HTMLCanvasElement>(null);

    const render = useCallback(() => {
      const source = sourceCanvasRef.current;
      const output = outputCanvasRef.current;
      if (!source || !output) return;
      convertToPixelArt(source, output, pixelSize, palette, algorithm);
      onReady?.();
    }, [pixelSize, palette, algorithm, onReady]);

    // Load image into source canvas
    useEffect(() => {
      const source = sourceCanvasRef.current;
      if (!source || !imageSrc) return;

      const img = new Image();
      img.onload = () => {
        source.width = img.naturalWidth;
        source.height = img.naturalHeight;
        const ctx = source.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        render();
      };
      img.src = imageSrc;
    }, [imageSrc, render]);

    // Re-render when pixelSize or palette changes
    useEffect(() => {
      if (!imageSrc) return;
      // Only re-render if source canvas already has content
      const source = sourceCanvasRef.current;
      if (source && source.width > 0) {
        render();
      }
    }, [pixelSize, palette, render, imageSrc]);

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
