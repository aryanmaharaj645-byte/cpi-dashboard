'use client';

import { useEffect, useState } from 'react';

interface ConfidenceBarProps {
  value: number;
  animate?: boolean;
}

export default function ConfidenceBar({ value, animate = false }: ConfidenceBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      setWidth(0);
      const timer = setTimeout(() => setWidth(value), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(value);
    }
  }, [value, animate]);

  const color = value >= 70 ? '#22c55e' : value >= 50 ? '#3b82f6' : '#ef4444';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Model Confidence</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-3 bg-[#2e2e2e] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
