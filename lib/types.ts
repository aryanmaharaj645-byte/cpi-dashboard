export interface ModelInputs {
  oil: number;
  gas: number;
  ppi: number;
  wages: number;
  prevCpi: number;
  coreCpiPrev: number;
  fedRate: number;
  importPrices: number;
  umichSentiment: number;
  inflExp: number;
  nfp: number;
  m2: number;
}

export interface DriverBreakdown {
  name: string;
  contribution: number;
  weight: number;
}

export interface PredictionResult {
  headline: number;
  coreMoM: number;
  bear: number;
  base: number;
  bull: number;
  us30Signal: 'Buy' | 'Sell' | 'Neutral';
  goldSignal: 'Buy' | 'Sell' | 'Neutral';
  direction: 'higher' | 'lower' | 'in-line';
  confidence: number;
  regime: 'Hot' | 'Neutral' | 'Soft';
  stagflation: boolean;
  drivers: DriverBreakdown[];
}

export interface MarketData {
  oil: number;
  gas: number;
  ppi: number;
  wages: number;
  prevCpi: number;
  fedRate: number;
  importPrices: number;
  umichSentiment: number;
  inflExp: number;
  m2: number;
  coreCpiPrev: number;
  nfp: number;
}

export interface CpiRelease {
  date: string;
  yoy: number;
  mom: number;
}

export type TabId = 'forecast' | 'inputs' | 'signals' | 'backtest' | 'history';
