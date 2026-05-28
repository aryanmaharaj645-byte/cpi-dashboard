'use client';

import { useEffect, useState } from 'react';
import { PredictionResult } from '@/lib/types';
import SignalBadge from './SignalBadge';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const scenarios = [
  { name: 'Hot', range: '≥ 3.9%', cpi: '≥3.9', us30: 'Sell', gold: 'Sell', prob: 25, color: '#ef4444' },
  { name: 'In-line', range: '3.6–3.8%', cpi: '3.6–3.8', us30: 'Sell', gold: 'Sell', prob: 60, color: '#3b82f6' },
  { name: 'Soft', range: '≤ 3.5%', cpi: '≤3.5', us30: 'Buy', gold: 'Buy', prob: 15, color: '#22c55e' },
];

interface SignalsTabProps {
  prediction: PredictionResult | null;
  isVisible: boolean;
}

export default function SignalsTab({ prediction, isVisible }: SignalsTabProps) {
  const [chartInitialized, setChartInitialized] = useState(false);

  useEffect(() => {
    if (isVisible) setChartInitialized(true);
  }, [isVisible]);

  const regimeColor = prediction?.regime === 'Hot' ? '#ef4444' : prediction?.regime === 'Soft' ? '#22c55e' : '#3b82f6';

  const doughnutData = {
    labels: ['US30 Signal', 'Gold Signal', 'Divergence'],
    datasets: [{
      data: prediction
        ? prediction.us30Signal === prediction.goldSignal ? [45, 45, 10] : [35, 35, 30]
        : [33, 33, 34],
      backgroundColor: ['#3b82f6', '#f59e0b', '#6b7280'],
      borderColor: '#1a1a1a',
      borderWidth: 2,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#9ca3af', padding: 12 } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Regime Badge */}
      {prediction && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 flex items-center gap-4">
          <span className="text-gray-400">Current Macro Regime</span>
          <span className="text-xl font-bold px-4 py-1.5 rounded-lg border" style={{ color: regimeColor, borderColor: regimeColor + '40', backgroundColor: regimeColor + '15' }}>
            {prediction.regime}
            {prediction.stagflation && ' (STAGFLATION)'}
          </span>
          <SignalBadge signal={prediction.us30Signal} label="US30" />
          <SignalBadge signal={prediction.goldSignal} label="Gold" />
        </div>
      )}

      {/* Scenario Table */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2e2e2e]">
          <h3 className="text-white font-semibold">Scenario Probability Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e2e2e]">
                <th className="text-left text-gray-400 text-sm px-5 py-3">Scenario</th>
                <th className="text-left text-gray-400 text-sm px-5 py-3">CPI Range</th>
                <th className="text-left text-gray-400 text-sm px-5 py-3">US30</th>
                <th className="text-left text-gray-400 text-sm px-5 py-3">Gold</th>
                <th className="text-left text-gray-400 text-sm px-5 py-3">Probability</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.name} className="border-b border-[#2e2e2e] last:border-0">
                  <td className="px-5 py-4 font-semibold" style={{ color: s.color }}>{s.name}</td>
                  <td className="px-5 py-4 text-gray-300">{s.range}</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${s.us30 === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>{s.us30}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${s.gold === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>{s.gold}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#2e2e2e] rounded-full overflow-hidden max-w-24">
                        <div className="h-full rounded-full" style={{ width: `${s.prob}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="text-gray-300 text-sm font-medium">{s.prob}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Trade Setup */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">US30 Trade Setup</h3>
          <div className="space-y-3">
            {[
              { label: 'Stop Loss', value: '40 pts', color: '#ef4444', pct: 40 },
              { label: 'Take Profit', value: '130 pts', color: '#22c55e', pct: 100 },
              { label: 'Risk:Reward', value: '1:3.25', color: '#3b82f6', pct: 75 },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
                <div className="h-1.5 bg-[#2e2e2e] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-3 text-sm text-gray-300 space-y-1">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Entry Rules</p>
            <p>• Enter within 5 min of CPI release</p>
            <p>• Wait for 1-min candle confirmation</p>
            <p>• Size: 1% risk per trade max</p>
            <p>• Close if price action invalidates</p>
          </div>
        </div>

        {/* Doughnut chart */}
        {chartInitialized && (
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Gold vs US30 Alignment</h3>
            <div className="max-w-xs mx-auto">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
