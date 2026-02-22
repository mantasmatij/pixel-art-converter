"use client";

import React, { useState, useRef, useCallback } from "react";
import ImageUploader from "./components/ImageUploader";
import PaletteUploader from "./components/PaletteUploader";
import PixelSizeSlider from "./components/PixelSizeSlider";
import ColorAlgorithmSelector from "./components/ColorAlgorithmSelector";
import ImageAdjustments, { ImageAdjustmentValues } from "./components/ImageAdjustments";
import PixelArtCanvas, { PixelArtCanvasHandle } from "./components/PixelArtCanvas";
import { Palette } from "./lib/paletteParser";
import { ColorAlgorithm } from "./lib/pixelArtConverter";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [pixelSize, setPixelSize] = useState(8);
  const [algorithm, setAlgorithm] = useState<ColorAlgorithm>("euclidean");
  const [adjustments, setAdjustments] = useState<ImageAdjustmentValues>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });
  const canvasRef = useRef<PixelArtCanvasHandle>(null);

  const handleImageLoad = useCallback((dataUrl: string) => {
    setImageSrc(dataUrl);
  }, []);

  const handleDownload = () => {
    canvasRef.current?.download();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            🎮 Pixel Art Converter
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            Convert any image to pixel art — entirely in your browser, no upload to any server.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls panel */}
          <div className="lg:col-span-1 space-y-5">
            {/* Image upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                1 · Upload Image
              </h2>
              <ImageUploader onImageLoad={handleImageLoad} />
              {imageSrc && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">Original preview</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Uploaded"
                    className="w-full rounded-lg border border-gray-200 object-contain max-h-40"
                  />
                </div>
              )}
            </div>

            {/* Palette upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                2 · Palette (optional)
              </h2>
              <PaletteUploader palette={palette} onPaletteLoad={setPalette} />
            </div>

            {/* Pixel size */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                3 · Pixel Size
              </h2>
              <PixelSizeSlider value={pixelSize} onChange={setPixelSize} />
            </div>

            {/* Color algorithm */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                4 · Colour Algorithm
              </h2>
              <ColorAlgorithmSelector value={algorithm} onChange={setAlgorithm} />
            </div>

            {/* Image adjustments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                5 · Adjustments
              </h2>
              <ImageAdjustments values={adjustments} onChange={setAdjustments} />
            </div>

            {/* Download button */}
            {imageSrc && (
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold py-3 px-6 rounded-xl shadow transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Pixel Art
              </button>
            )}
          </div>

          {/* Output canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 min-h-80 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Pixel Art Preview
                </h2>
                {imageSrc && (
                  <span className="text-xs text-gray-400">
                    Right-click the image to save
                  </span>
                )}
              </div>

              {imageSrc ? (
                <div className="flex-1 flex items-center justify-center overflow-auto">
                  <PixelArtCanvas
                    ref={canvasRef}
                    imageSrc={imageSrc}
                    pixelSize={pixelSize}
                    palette={palette?.colors ?? null}
                    algorithm={algorithm}
                    adjustments={adjustments}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-300">
                  <div className="text-center">
                    <svg
                      className="mx-auto w-16 h-16 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium">Upload an image to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* Info badges */}
            {imageSrc && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                  Pixel size: {pixelSize}px
                </span>
                {palette ? (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                    Palette: {palette.name} ({palette.colors.length} colors)
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
                    No palette — using original colors
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-gray-400">
          All processing happens locally in your browser. No data is sent to any server.
        </footer>
      </div>
    </main>
  );
}
