"use client";

import React, { useCallback, useState } from "react";
import { Palette, parsePaletteFile } from "../lib/paletteParser";

interface PaletteUploaderProps {
  palette: Palette | null;
  onPaletteLoad: (palette: Palette | null) => void;
}

export default function PaletteUploader({ palette, onPaletteLoad }: PaletteUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const parsed = await parsePaletteFile(file);
        if (parsed.colors.length === 0) {
          setError("No colors found in palette file. Please check the file format.");
          return;
        }
        setError(null);
        onPaletteLoad(parsed);
      } catch {
        setError("Failed to parse palette file. Supported formats: GPL, PAL, ACT, HEX, ASE, JSON.");
      }
    },
    [onPaletteLoad]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-purple-400 rounded-xl p-6 text-center cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-colors"
        onClick={() => document.getElementById("palette-upload-input")?.click()}
      >
        <svg
          className="mx-auto mb-2 w-8 h-8 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        <p className="text-purple-700 font-medium text-sm">
          {palette ? `✓ ${palette.name} (${palette.colors.length} colors)` : "Drop palette file or click to upload"}
        </p>
        <p className="text-xs text-gray-400 mt-1">GPL · PAL · ACT · HEX · ASE · JSON (Lospec)</p>
        <input
          id="palette-upload-input"
          type="file"
          accept=".gpl,.pal,.act,.hex,.ase,.json"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {palette && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Palette Preview
            </span>
            <button
              onClick={() => onPaletteLoad(null)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg border">
            {palette.colors.map((color, i) => (
              <div
                key={i}
                title={color.name ?? `rgb(${color.r}, ${color.g}, ${color.b})`}
                className="w-6 h-6 rounded-sm border border-gray-200 flex-shrink-0 cursor-default"
                style={{ backgroundColor: `rgb(${color.r},${color.g},${color.b})` }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{palette.colors.length} colors</p>
        </div>
      )}
    </div>
  );
}
