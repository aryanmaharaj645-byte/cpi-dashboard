import { ModelInputs, PredictionResult, DriverBreakdown } from './types';

export function computePrediction(inputs: ModelInputs): PredictionResult {
  const { oil, gas, ppi, wages, prevCpi, coreCpiPrev, fedRate, importPrices, inflExp, nfp, m2 } = inputs;

  const oilContrib = Math.max(0, (oil - 75) * 0.008);
  const gasContrib = Math.max(0, (gas - 3.0) * 0.18);
  const energyScore = (oilContrib + gasContrib) * 0.28;

  const trendScore = prevCpi * 0.20;
  const ppiScore = ppi * 0.4 * 0.15;
  const shelterScore = (Math.max(0, 4.5 - fedRate * 0.3) + 0.2) * 0.12;
  const wageScore = Math.max(0, wages - 3.0) * 0.25 * 0.10;
  const expScore = inflExp * 0.12 * 0.08;
  const importScore = importPrices * 0.15 * 0.05;
  const m2Score = Math.max(0, m2 - 2.0) * 0.05 * 0.02;

  let headline = 2.5 + energyScore + trendScore + ppiScore +
    shelterScore + wageScore + expScore + importScore + m2Score;

  headline = Math.min(Math.max(headline, 1.5), 6.5);
  headline = Math.round(headline * 100) / 100;

  const coreMoM = Math.round((coreCpiPrev * 0.6 + (wages > 3 ? (wages - 3) * 0.04 : 0) + 0.15) * 100) / 100;

  const bear = Math.round((headline - 0.3) * 100) / 100;
  const base = headline;
  const bull = Math.round((headline + 0.2) * 100) / 100;

  const prevDiff = headline - prevCpi;
  let direction: 'higher' | 'lower' | 'in-line';
  if (prevDiff > 0.1) direction = 'higher';
  else if (prevDiff < -0.1) direction = 'lower';
  else direction = 'in-line';

  const stagflation = headline >= 3.7 && nfp < 100;

  let us30Signal: 'Buy' | 'Sell' | 'Neutral';
  let goldSignal: 'Buy' | 'Sell' | 'Neutral';

  if (stagflation) {
    us30Signal = 'Sell';
    goldSignal = 'Buy';
  } else if (headline >= 3.7 || coreMoM >= 0.35) {
    us30Signal = 'Sell';
    goldSignal = 'Sell';
  } else if (headline <= 3.2) {
    us30Signal = 'Buy';
    goldSignal = 'Buy';
  } else {
    us30Signal = 'Neutral';
    goldSignal = 'Neutral';
  }

  let regime: 'Hot' | 'Neutral' | 'Soft';
  if (headline >= 3.7) regime = 'Hot';
  else if (headline <= 3.2) regime = 'Soft';
  else regime = 'Neutral';

  const scores = [energyScore, trendScore, ppiScore, shelterScore, wageScore, expScore, importScore, m2Score];
  const totalScore = scores.reduce((a, b) => a + b, 0);

  const driverNames = [
    'Energy / Oil', 'CPI Trend', 'PPI Passthrough', 'Shelter / OER',
    'Wages / Labor', 'Inflation Expectations', 'Import Prices', 'M2 Money Supply'
  ];
  const driverWeights = [28, 20, 15, 12, 10, 8, 5, 2];

  const drivers: DriverBreakdown[] = driverNames.map((name, i) => ({
    name,
    contribution: totalScore > 0 ? Math.round((scores[i] / totalScore) * 100) : driverWeights[i],
    weight: driverWeights[i],
  }));

  const maxScore = 6.5 - 2.5;
  const normalizedScore = (headline - 2.5) / maxScore;
  const componentAgreement = 1 - (Math.max(...scores) - Math.min(...scores)) / (Math.max(...scores) + 0.01);
  const confidence = Math.round(Math.min(95, Math.max(40, (normalizedScore * 30 + componentAgreement * 40 + 50))) * 10) / 10;

  return { headline, coreMoM, bear, base, bull, us30Signal, goldSignal, direction, confidence, regime, stagflation, drivers };
}
