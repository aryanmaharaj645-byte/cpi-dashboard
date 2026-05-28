'use client';

import { MarketData } from '@/lib/types';

interface MetricBarProps {
  data: MarketData | null;
  loading: boolean;
}

interface Metric {
  label: string;
  value: string;
  color?: string;
}

function n(v: unknown): number { return Number(v) || 0; }

export default function MetricBar({ data, loading }: MetricBarProps) {
  const metrics: Metric[] = data ? [
    { label: 'Crude Oil', value: `$${n(data.oil).toFixed(2)}/bbl` },
    { label: 'Retail Gas', value: `$${n(data.gas).toFixed(2)}/gal` },
    { label: 'PPI MoM', value: `${n(data.ppi) > 0 ? '+' : ''}${n(data.ppi).toFixed(1)}%`, color: n(data.ppi) > 0 ? '#ef4444' : '#22c55e' },
    { label: 'Wages YoY', value: `${n(data.wages).toFixed(1)}%` },
    { label: 'Fed Funds', value: `${n(data.fedRate).toFixed(2)}%` },
    { label: 'Prev CPI YoY', value: `${n(data.prevCpi).toFixed(1)}%`, color: n(data.prevCpi) >= 3.7 ? '#ef4444' : n(data.prevCpi) <= 3.2 ? '#22c55e' : '#3b82f6' },
  ] : [];

  return (
    <div className="bg-[#1a1a1a] border-b border-[#2e2e2e]">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {loading ? (
            <span className="text-gray-500 text-sm animate-pulse">Loading live data...</span>
          ) : metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{m.label}</span>
              <span className="font-semibold" style={{ color: m.color ?? '#fff' }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
