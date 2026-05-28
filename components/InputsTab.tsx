'use client';

import { ModelInputs } from '@/lib/types';

interface InputField {
  key: keyof ModelInputs;
  label: string;
  unit: string;
  step: number;
  min: number;
  max: number;
}

const INPUT_FIELDS: InputField[] = [
  { key: 'oil', label: 'Crude Oil', unit: '$/bbl', step: 0.5, min: 30, max: 150 },
  { key: 'gas', label: 'Retail Gas', unit: '$/gal', step: 0.01, min: 1.5, max: 7 },
  { key: 'ppi', label: 'PPI MoM', unit: '%', step: 0.1, min: -3, max: 5 },
  { key: 'wages', label: 'Avg Wages YoY', unit: '%', step: 0.1, min: 0, max: 10 },
  { key: 'prevCpi', label: 'Previous CPI YoY', unit: '%', step: 0.1, min: 0, max: 10 },
  { key: 'coreCpiPrev', label: 'Core CPI prev MoM', unit: '%', step: 0.01, min: 0, max: 2 },
  { key: 'fedRate', label: 'Fed Funds Rate', unit: '%', step: 0.25, min: 0, max: 10 },
  { key: 'importPrices', label: 'Import Prices MoM', unit: '%', step: 0.1, min: -5, max: 5 },
  { key: 'umichSentiment', label: 'UMich Sentiment', unit: 'index', step: 0.1, min: 30, max: 110 },
  { key: 'inflExp', label: '1yr Inflation Exp', unit: '%', step: 0.1, min: 0, max: 10 },
  { key: 'nfp', label: 'NFP', unit: 'k jobs', step: 10, min: -500, max: 1000 },
  { key: 'm2', label: 'M2 YoY', unit: '%', step: 0.1, min: -5, max: 20 },
];

interface InputsTabProps {
  inputs: ModelInputs;
  onChange: (inputs: ModelInputs) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function InputsTab({ inputs, onChange, onGenerate, loading }: InputsTabProps) {
  const handleChange = (key: keyof ModelInputs, val: string) => {
    const num = parseFloat(val.replace(',', '.'));
    if (!isNaN(num)) onChange({ ...inputs, [key]: num });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Model Inputs <span className="text-gray-500 text-sm font-normal ml-2">— auto-fetched on load, editable</span></h3>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {INPUT_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm text-gray-400 flex justify-between">
                <span>{field.label}</span>
                <span className="text-gray-600">{field.unit}</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={inputs[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating Prediction...
          </>
        ) : (
          '⚡ Generate Prediction'
        )}
      </button>
    </div>
  );
}
