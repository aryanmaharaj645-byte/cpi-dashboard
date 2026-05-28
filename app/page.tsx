'use client';

import { useEffect, useState, useCallback } from 'react';
import { ModelInputs, PredictionResult, TabId, MarketData } from '@/lib/types';
import { computePrediction } from '@/lib/prediction';
import { FALLBACK_DATA } from '@/lib/fetchMarketData';
import Header from '@/components/Header';
import MetricBar from '@/components/MetricBar';
import ForecastTab from '@/components/ForecastTab';
import InputsTab from '@/components/InputsTab';
import SignalsTab from '@/components/SignalsTab';
import BacktestTab from '@/components/BacktestTab';
import HistoryTab from '@/components/HistoryTab';

const TABS: { id: TabId; label: string }[] = [
  { id: 'forecast', label: 'Forecast' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'signals', label: 'Signals' },
  { id: 'backtest', label: 'Backtest' },
  { id: 'history', label: 'History' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('forecast');
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set<TabId>(['forecast']));

  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [inputs, setInputs] = useState<ModelInputs>(FALLBACK_DATA);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [animatePrediction, setAnimatePrediction] = useState(false);

  useEffect(() => {
    fetch('/api/market-data')
      .then((r) => r.json())
      .then((data: MarketData) => {
        setMarketData(data);
        setInputs(data);
      })
      .catch(() => {
        setMarketData(FALLBACK_DATA);
      })
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (marketData && !prediction) {
      const result = computePrediction(inputs);
      setPrediction(result);
      setAnimatePrediction(true);
    }
  }, [marketData, inputs, prediction]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set<TabId>([...Array.from(prev), tab]));
  };

  const handleGenerate = useCallback(async () => {
    setLoadingPrediction(true);
    setAnimatePrediction(false);
    await new Promise((r) => setTimeout(r, 300));
    const result = computePrediction(inputs);
    setPrediction(result);
    setAnimatePrediction(true);
    setLoadingPrediction(false);
    setActiveTab('forecast');
    setVisitedTabs((prev) => new Set<TabId>([...Array.from(prev), 'forecast']));
  }, [inputs]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <MetricBar data={marketData} loading={loadingData} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex border-b border-[#2e2e2e] mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={activeTab === 'forecast' ? 'block' : 'hidden'}>
          <ForecastTab
            prediction={prediction}
            inputs={inputs}
            isVisible={visitedTabs.has('forecast')}
            animate={animatePrediction}
          />
        </div>
        <div className={activeTab === 'inputs' ? 'block' : 'hidden'}>
          <InputsTab
            inputs={inputs}
            onChange={setInputs}
            onGenerate={handleGenerate}
            loading={loadingPrediction}
          />
        </div>
        <div className={activeTab === 'signals' ? 'block' : 'hidden'}>
          <SignalsTab
            prediction={prediction}
            isVisible={visitedTabs.has('signals')}
          />
        </div>
        <div className={activeTab === 'backtest' ? 'block' : 'hidden'}>
          <BacktestTab isVisible={visitedTabs.has('backtest')} />
        </div>
        <div className={activeTab === 'history' ? 'block' : 'hidden'}>
          <HistoryTab isVisible={visitedTabs.has('history')} />
        </div>
      </main>
    </div>
  );
}
