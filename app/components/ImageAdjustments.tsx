"use client";

export interface ImageAdjustmentValues {
  brightness: number;
  contrast: number;
  saturation: number;
}

interface ImageAdjustmentsProps {
  values: ImageAdjustmentValues;
  onChange: (values: ImageAdjustmentValues) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  display: (v: number) => string;
  onChange: (v: number) => void;
  onReset: () => void;
}

function SliderRow({ label, value, min, max, step, defaultValue, display, onChange, onReset }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {display(value)}
          </span>
          {value !== defaultValue && (
            <button
              onClick={onReset}
              title="Reset to default"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ↺
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );
}

export default function ImageAdjustments({ values, onChange }: ImageAdjustmentsProps) {
  return (
    <div className="space-y-4">
      <SliderRow
        label="Brightness"
        value={values.brightness}
        min={0}
        max={200}
        step={1}
        defaultValue={100}
        display={(v) => `${v}%`}
        onChange={(v) => onChange({ ...values, brightness: v })}
        onReset={() => onChange({ ...values, brightness: 100 })}
      />
      <SliderRow
        label="Contrast"
        value={values.contrast}
        min={0}
        max={200}
        step={1}
        defaultValue={100}
        display={(v) => `${v}%`}
        onChange={(v) => onChange({ ...values, contrast: v })}
        onReset={() => onChange({ ...values, contrast: 100 })}
      />
      <SliderRow
        label="Saturation"
        value={values.saturation}
        min={0}
        max={200}
        step={1}
        defaultValue={100}
        display={(v) => `${v}%`}
        onChange={(v) => onChange({ ...values, saturation: v })}
        onReset={() => onChange({ ...values, saturation: 100 })}
      />
    </div>
  );
}
