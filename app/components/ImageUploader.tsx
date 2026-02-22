"use client";

import React, { useCallback, useState } from "react";

interface ImageUploaderProps {
  onImageLoad: (dataUrl: string) => void;
}

export default function ImageUploader({ onImageLoad }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageLoad(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageLoad]
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
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-400 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
        onClick={() => document.getElementById("image-upload-input")?.click()}
      >
        <svg
          className="mx-auto mb-3 w-10 h-10 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-indigo-700 font-medium">Drop an image here or click to upload</p>
        <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF, WebP, BMP, SVG…</p>
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
