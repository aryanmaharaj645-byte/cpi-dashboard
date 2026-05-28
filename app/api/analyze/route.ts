import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { inputs, prediction } = await req.json();

    const prompt = `You are a macro economist. Given these CPI model inputs and prediction, provide exactly 3 sentences (max 70 words total):
1. Why CPI will print at ${prediction.headline}% YoY
2. The single key driver
3. US30 signal is ${prediction.us30Signal}, Gold signal is ${prediction.goldSignal} — explain the trade reasoning

Key inputs: Oil $${inputs.oil}/bbl, Gas $${inputs.gas}/gal, PPI MoM ${inputs.ppi}%, Wages YoY ${inputs.wages}%, Fed Rate ${inputs.fedRate}%, Prev CPI ${inputs.prevCpi}%`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ analysis: 'AI analysis unavailable. Check your ANTHROPIC_API_KEY.' }, { status: 200 });
  }
}
