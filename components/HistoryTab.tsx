'use client';

import { useEffect, useState } from 'react';
import { CpiRelease } from '@/lib/types';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HISTORY: CpiRelease[] = [
  { date: 'May 2024', yoy: 3.3, mom: 0.3 },
  { date: 'Jun 2024', yoy: 3.0, mom: -0.1 },
  { date: 'Jul 2024', yoy: 2.9, mom: 0.2 },
  { date: 'Aug 2024', yoy: 2.5, mom: 0.2 },
  { date: 'Sep 2024', yoy: 2.4, mom: 0.0 },
  { date: 'Oct 2024', yoy: 2.6, mom: 0.2 },
  { date: 'Nov 2024', yoy: 2.7, mom: 0.3 },
  { date: 'Dec 2024', yoy: 2.9, mom: 0.4 },
  { date: 'Jan 2025', yoy: 3.0, mom: 0.5 },
  { date: 'Feb 2025', yoy: 2.8, mom: 0.2 },
  { date: 'Mar 2025', yoy: 2.4, mom: -0.1 },
  { date: 'Apr 2025', yoy: 2.3, mom: -0.1 },
];

interface HistoryTabProps {
  isVisible: boolean;
}

export default function HistoryTab({ isVisible }: HistoryTabProps) {
  const [chartInitialized, setChartInitialized] = useState(false);

  useEffect(() => {
    if (isVisible) setChartInitialized(true);
  }, [isVisible]);

  const chartData = {
    labels: HISTORY.map((h) => h.date),
    datasets: [{
      label: 'CPI YoY %',
      data: HISTORY.map((h) => h.yoy),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { color: '#2e2e2e' } },
      y: {
        ticks: { color: '#6b7280', callback: (v: number | string) => `${v}%` },
        grid: { color: '#2e2e2e' },
        min: 1.5,
        max: 4.5,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart */}
      {chartInitialized && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">12-Month CPI YoY Trend</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2e2e2e]">
          <h3 className="text-white font-semibold">Last 12 CPI Releases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e2e2e]">
                <th className="text-left text-gray-400 text-sm px-5 py-3">Month</th>
                <th className="text-right text-gray-400 text-sm px-5 py-3">YoY %</th>
                <th className="text-right text-gray-400 text-sm px-5 py-3">MoM %</th>
                <th className="text-right text-gray-400 text-sm px-5 py-3">vs Prior</th>
              </tr>
            </thead>
            <tbody>
              {[...HISTORY].reverse().map((release, i) => {
                const prior = [...HISTORY].reverse()[i + 1];
                const diff = prior ? release.yoy - prior.yoy : 0;
                return (
                  <tr key={release.date} className="border-b border-[#2e2e2e] last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white">{release.date}</td>
                    <td className="px-5 py-3 text-right font-bold text-white">{release.yoy.toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right" style={{ color: release.mom >= 0 ? '#ef4444' : '#22c55e' }}>
                      {release.mom >= 0 ? '+' : ''}{release.mom.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3 text-right">
                      {prior ? (
                        <span style={{ color: diff > 0 ? '#ef4444' : diff < 0 ? '#22c55e' : '#6b7280' }}>
                          {diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} {Math.abs(diff).toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
