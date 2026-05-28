'use client';

import { useEffect, useState } from 'react';

function getNextCpiDate(): Date {
  // CPI releases roughly on the 10th-15th each month, ~2-3 weeks after month end
  // We'll compute the 2nd Wednesday of each month as approximation
  const now = new Date();
  const candidates: Date[] = [];

  for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    // Find 2nd Wednesday
    let wedCount = 0;
    for (let day = 1; day <= 28; day++) {
      const candidate = new Date(d.getFullYear(), d.getMonth(), day);
      if (candidate.getDay() === 3) {
        wedCount++;
        if (wedCount === 2) {
          candidates.push(candidate);
          break;
        }
      }
    }
  }

  for (const c of candidates) {
    if (c > now) return c;
  }
  return candidates[candidates.length - 1];
}

export default function Header() {
  const [daysUntil, setDaysUntil] = useState<number>(0);
  const [nextDate, setNextDate] = useState<string>('');

  useEffect(() => {
    const next = getNextCpiDate();
    const now = new Date();
    const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysUntil(diff);
    setNextDate(next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }, []);

  return (
    <header className="border-b border-[#2e2e2e] bg-[#0f0f0f] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">CPI Trading Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Next CPI Release:</span>
          <span className="text-white font-medium">{nextDate}</span>
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full text-xs font-bold">
            {daysUntil}d
          </span>
        </div>
      </div>
    </header>
  );
}
