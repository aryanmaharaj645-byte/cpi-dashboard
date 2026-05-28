'use client';

import { useEffect, useRef, useState } from 'react';
import { PredictionResult, ModelInputs } from '@/lib/types';
import SignalBadge from './SignalBadge';
import ConfidenceBar from './ConfidenceBar';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const historicalCpi = [
  { month: 'May 24', value: 3.3 }, { month: 'Jun 24', value: 3.0 },
  { month: 'Jul 24', value: 2.9 }, { month: 'Aug 24', value: 2.5 },
  { month: 'Sep 24', value: 2.4 }, { month: 'Oct 24', value: 2.6 },
  { month: 'Nov 24', value: 2.7 }, { month: 'Dec 24', value: 2.9 },
  { month: 'Jan 25', value: 3.0 }, { month: 'Feb 25', value: 2.8 },
  { month: 'Mar 25', value: 2.4 }, { month: 'Apr 25', value: 2.3 },
];

interface ForecastTabProps {
  prediction: PredictionResult | null;
  inputs: ModelInputs | null;
  isVisible: boolean;
  animate: boolean;
}

export default function ForecastTab({ prediction, inputs, isVisible, animate }: ForecastTabProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [chartInitialized, setChartInitialized] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isVisible) setChartInitialized(true);
  }, [isVisible]);

  useEffect(() => {
    if (!prediction || !inputs || hasFetched.current) return;
    hasFetched.current = true;
    setLoadingAnalysis(true);
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, prediction }),
    })
      .then((r) => r.json())
      .then((d) => setAnalysis(d.analysis ?? ''))
      .catch(() => setAnalysis('AI analysis unavailable.'))
      .finally(() => setLoadingAnalysis(false));
  }, [prediction, inputs]);

  if (!prediction) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Run a prediction to see forecast
      </div>
    );
  }

  const directionColor = prediction.direction === 'higher' ? '#ef4444' : prediction.direction === 'lower' ? '#22c55e' : '#3b82f6';
  const directionArrow = prediction.direction === 'higher' ? '↑' : prediction.direction === 'lower' ? '↓' : '→';

  const chartLabels = [...historicalCpi.map((d) => d.month), 'Forecast'];
  const chartValues = [...historicalCpi.map((d) => d.value), null];
  const forecastPoint = [...historicalCpi.map(() => null), prediction.headline];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'CPI YoY %',
        data: chartValues,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        spanGaps: false,
      },
      {
        label: 'Forecast',
        data: forecastPoint,
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        pointRadius: 8,
        pointStyle: 'star',
        spanGaps: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#9ca3af' } }, tooltip: { mode: 'index' as const } },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { color: '#2e2e2e' } },
      y: { ticks: { color: '#6b7280', callback: (v: number | string) => `${v}%` }, grid: { color: '#2e2e2e' }, min: 1.5, max: 5 },
    },
  };

  return (
    <div className="space-y-6">
      {/* Main prediction */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">CPI YoY Forecast</p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black text-white">{prediction.headline.toFixed(1)}<span className="text-3xl text-gray-400">%</span></span>
              <span className="text-2xl font-bold" style={{ color: directionColor }}>{directionArrow} {prediction.direction}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm">
                Bear {prediction.bear.toFixed(1)}%
              </span>
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                Base {prediction.base.toFixed(1)}%
              </span>
              <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-sm">
                Bull {prediction.bull.toFixed(1)}%
              </span>
              <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full text-sm">
                Core MoM {prediction.coreMoM.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <SignalBadge signal={prediction.us30Signal} label="US30" size="lg" />
            <SignalBadge signal={prediction.goldSignal} label="Gold" size="lg" />
          </div>
        </div>
        <div className="mt-6">
          <ConfidenceBar value={prediction.confidence} animate={animate} />
        </div>
      </div>

      {/* Driver breakdown */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Key Drivers</h3>
        <div className="space-y-3">
          {prediction.drivers.map((driver, i) => (
            <div key={driver.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{driver.name}</span>
                <span className="text-gray-400">{driver.contribution}% <span className="text-gray-600">({driver.weight}% weight)</span></span>
              </div>
              <div className="h-2 bg-[#2e2e2e] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: animate ? `${driver.contribution}%` : '0%',
                    backgroundColor: '#3b82f6',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
        {loadingAnalysis ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Generating analysis...
          </div>
        ) : analysis ? (
          <p className="text-gray-300 leading-relaxed">{analysis}</p>
        ) : (
          <p className="text-gray-500 italic">Generate a prediction to see AI analysis.</p>
        )}
      </div>

      {/* CPI Chart */}
      {chartInitialized && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">CPI Trend + Forecast</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
