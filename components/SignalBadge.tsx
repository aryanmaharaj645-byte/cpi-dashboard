'use client';

interface SignalBadgeProps {
  signal: 'Buy' | 'Sell' | 'Neutral';
  label: string;
  size?: 'sm' | 'lg';
}

export default function SignalBadge({ signal, label, size = 'sm' }: SignalBadgeProps) {
  const colorMap = {
    Buy: 'bg-green-500/20 text-green-400 border-green-500/40',
    Sell: 'bg-red-500/20 text-red-400 border-red-500/40',
    Neutral: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  };

  const sizeClass = size === 'lg'
    ? 'text-2xl font-bold px-6 py-3'
    : 'text-sm font-semibold px-3 py-1.5';

  return (
    <div className={`inline-flex flex-col items-center gap-1 rounded-lg border ${colorMap[signal]} ${size === 'lg' ? 'p-4' : 'p-2'}`}>
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`${sizeClass} rounded font-bold`}>{signal}</span>
    </div>
  );
}
