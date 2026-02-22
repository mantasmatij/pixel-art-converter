"use client";

import React from "react";
import { ColorAlgorithm } from "../lib/pixelArtConverter";

interface ColorAlgorithmSelectorProps {
  value: ColorAlgorithm;
  onChange: (algorithm: ColorAlgorithm) => void;
}

const ALGORITHMS: { value: ColorAlgorithm; label: string; description: string }[] = [
  {
    value: "euclidean",
    label: "RGB Euclidean",
    description: "Fast, equal-weight RGB distance",
  },
  {
    value: "weighted",
    label: "Weighted RGB",
    description: "Perceptual weights (emphasises green)",
  },
  {
    value: "ciede76",
    label: "CIE76 (Lab)",
    description: "Perceptually accurate Lab colour space",
  },
];

export default function ColorAlgorithmSelector({ value, onChange }: ColorAlgorithmSelectorProps) {
  return (
    <div className="space-y-2">
      {ALGORITHMS.map((algo) => (
        <label
          key={algo.value}
          className={`flex items-start gap-3 cursor-pointer rounded-xl border p-3 transition-colors ${
            value === algo.value
              ? "border-indigo-400 bg-indigo-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="colorAlgorithm"
            value={algo.value}
            checked={value === algo.value}
            onChange={() => onChange(algo.value)}
            className="mt-0.5 accent-indigo-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">{algo.label}</p>
            <p className="text-xs text-gray-500">{algo.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
