import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { inputs, prediction } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ analysis: generateFallback(inputs, prediction) });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a macro economist. Given these CPI model inputs and prediction, write exactly 3 sentences (max 70 words total):
1. Why CPI will print at ${prediction.headline}% YoY
2. The single key driver
3. US30 signal is ${prediction.us30Signal}, Gold signal is ${prediction.goldSignal} — explain the trade reasoning briefly

Inputs: Oil $${inputs.oil}/bbl, Gas $${inputs.gas}/gal, PPI MoM ${inputs.ppi}%, Wages YoY ${inputs.wages}%, Fed Rate ${inputs.fedRate}%, Prev CPI ${inputs.prevCpi}%`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ analysis: generateFallback(null, null) });
  }
}

function generateFallback(inputs: Record<string, number> | null, prediction: Record<string, unknown> | null): string {
  if (!inputs || !prediction) {
    return 'AI analysis unavailable — add a GEMINI_API_KEY to enable it.';
  }
  const headline = prediction.headline as number;
  const us30 = prediction.us30Signal as string;
  const gold = prediction.goldSignal as string;
  const driver = inputs.oil > 85 ? 'elevated energy prices' : inputs.wages > 4.5 ? 'persistent wage growth' : 'sticky core inflation';
  const direction = headline >= 3.7 ? 'above' : headline <= 3.2 ? 'below' : 'near';

  return `CPI is forecast at ${headline.toFixed(1)}% YoY, ${direction} the Fed's target, driven by ${driver} feeding through to consumer prices. The dominant factor is ${driver}, which is contributing the most to the above-trend reading in this cycle. ${us30 === gold ? `Both US30 and Gold signal ${us30} — markets will likely price in ${us30 === 'Sell' ? 'tighter-for-longer Fed policy' : 'rate cut expectations'} on the print.` : `US30 signals ${us30} while Gold signals ${gold}, a stagflation divergence suggesting growth pressure without inflation relief.`}`;
}
