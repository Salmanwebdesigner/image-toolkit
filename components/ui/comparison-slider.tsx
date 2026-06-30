"use client";

import { useId, useMemo, useState } from "react";

interface ComparisonSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function ComparisonSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const clipPath = useMemo(() => `inset(0 ${100 - position}% 0 0)`, [position]);
  const sliderId = useId();

  return (
    <div className="glass-card overflow-hidden p-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950/5">
        <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 h-full w-full object-contain" />
        <div className="absolute inset-0" style={{ clipPath }}>
          <img src={afterSrc} alt={afterLabel} className="absolute inset-0 h-full w-full object-contain" />
        </div>
        <div className="absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow-lg" style={{ left: `${position}%` }} />
        <div className="absolute left-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white">
          {beforeLabel}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-900">
          {afterLabel}
        </div>
      </div>
      <label htmlFor={sliderId} className="mt-4 block text-sm font-medium text-slate-700">
        Compare output
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="mt-3 w-full accent-indigo-500"
      />
    </div>
  );
}
