import { MarketData } from './types';

const FRED_KEY = process.env.FRED_API_KEY;
const EIA_KEY = process.env.EIA_API_KEY;

async function fetchFredSeries(seriesId: string): Promise<number | null> {
  if (!FRED_KEY) return null;
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=2`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const obs = data.observations?.filter((o: { value: string }) => o.value !== '.') ?? [];
    return obs.length > 0 ? parseFloat(obs[0].value) : null;
  } catch {
    return null;
  }
}

async function fetchFredYoY(seriesId: string): Promise<number | null> {
  if (!FRED_KEY) return null;
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=14`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const obs = (data.observations ?? []).filter((o: { value: string }) => o.value !== '.');
    if (obs.length < 13) return null;
    const latest = parseFloat(obs[0].value);
    const yearAgo = parseFloat(obs[12].value);
    return Math.round(((latest - yearAgo) / yearAgo) * 10000) / 100;
  } catch {
    return null;
  }
}

async function fetchFredMoM(seriesId: string): Promise<number | null> {
  if (!FRED_KEY) return null;
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=3`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const obs = (data.observations ?? []).filter((o: { value: string }) => o.value !== '.');
    if (obs.length < 2) return null;
    const latest = parseFloat(obs[0].value);
    const prev = parseFloat(obs[1].value);
    return Math.round(((latest - prev) / prev) * 10000) / 100;
  } catch {
    return null;
  }
}

async function fetchBlsCpi(): Promise<number | null> {
  try {
    const body = {
      seriesid: ['CUUR0000SA0'],
      startyear: '2023',
      endyear: '2025',
    };
    const res = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const series = data.Results?.series?.[0]?.data ?? [];
    if (series.length < 13) return null;
    const latest = parseFloat(series[0].value);
    const yearAgo = parseFloat(series[12].value);
    return Math.round(((latest - yearAgo) / yearAgo) * 10000) / 100;
  } catch {
    return null;
  }
}

async function fetchBlsPpi(): Promise<number | null> {
  try {
    const body = {
      seriesid: ['WPSFD4'],
      startyear: '2024',
      endyear: '2025',
    };
    const res = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const series = data.Results?.series?.[0]?.data ?? [];
    if (series.length < 2) return null;
    const latest = parseFloat(series[0].value);
    const prev = parseFloat(series[1].value);
    return Math.round(((latest - prev) / prev) * 10000) / 100;
  } catch {
    return null;
  }
}

async function fetchEiaOil(): Promise<number | null> {
  if (!EIA_KEY) return null;
  try {
    const url = `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${EIA_KEY}&frequency=daily&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1&facets[series][]=RCLC1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.data?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

async function fetchEiaGas(): Promise<number | null> {
  if (!EIA_KEY) return null;
  try {
    const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_KEY}&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1&facets[product][]=EPM0&facets[duoarea][]=NUS`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.data?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

export const FALLBACK_DATA: MarketData = {
  oil: 82.5,
  gas: 3.42,
  ppi: 0.4,
  wages: 4.1,
  prevCpi: 3.5,
  coreCpiPrev: 0.3,
  fedRate: 5.33,
  importPrices: 0.4,
  umichSentiment: 69.1,
  inflExp: 3.1,
  nfp: 175,
  m2: 2.8,
};

export async function fetchMarketData(): Promise<MarketData> {
  const [oil, gas, ppi, fedRate, m2, umich, inflExp, importPrices, wages, blsCpi] = await Promise.all([
    fetchEiaOil(),
    fetchEiaGas(),
    fetchBlsPpi(),
    fetchFredSeries('FEDFUNDS'),
    fetchFredYoY('M2SL'),
    fetchFredSeries('UMCSENT'),
    fetchFredSeries('MICH'),
    fetchFredMoM('IR'),
    fetchFredYoY('CES0500000003'),
    fetchBlsCpi(),
  ]);

  return {
    oil: oil ?? FALLBACK_DATA.oil,
    gas: gas ?? FALLBACK_DATA.gas,
    ppi: ppi ?? FALLBACK_DATA.ppi,
    wages: wages ?? FALLBACK_DATA.wages,
    prevCpi: blsCpi ?? FALLBACK_DATA.prevCpi,
    coreCpiPrev: FALLBACK_DATA.coreCpiPrev,
    fedRate: fedRate ?? FALLBACK_DATA.fedRate,
    importPrices: importPrices ?? FALLBACK_DATA.importPrices,
    umichSentiment: umich ?? FALLBACK_DATA.umichSentiment,
    inflExp: inflExp ?? FALLBACK_DATA.inflExp,
    nfp: FALLBACK_DATA.nfp,
    m2: m2 ?? FALLBACK_DATA.m2,
  };
}
