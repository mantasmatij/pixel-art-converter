"use client";

interface PixelSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function PixelSizeSlider({ value, onChange }: PixelSizeSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">Pixel Size</label>
        <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
          {value}px
        </span>
      </div>
      <input
        type="range"
        min={2}
        max={64}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>2px (fine)</span>
        <span>64px (chunky)</span>
      </div>
    </div>
  );
}
