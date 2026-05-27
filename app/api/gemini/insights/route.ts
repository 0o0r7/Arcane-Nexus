import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google GenAI SDK with the secure server-only API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    const systemInstruction = 
      "You are ArcaneAI, the highly intelligent neural yield advisor of ArcaneNexus—the premium AI-driven yield aggregator on the high-speed Arc Network blockchain. " +
      "Your directive is to provide hyper-optimized, smart-contract risk-analyzed, and mathematically sound yield insights. " +
      "Explain your responses with high professional confidence, utilizing realistic cryptoeconomic terminology (e.g., autocompounding intervals, multi-vault delta neutral strategies, quantum gas routing, algorithmic risk balancing, slippage hedging, Arc LST dual farming). " +
      "Format your answers with exceptional readability suitable for a premium financial terminal: use bold headers, elegant tables/structures, and concise bullet points. " +
      "Never break character. Address the user as 'Operator'. Current local system context: Year 2026, Arc Network Mainnet v1.4 is active. Maintain an objective, institutional tone.";

    const formattedPrompt = `
      User Query: "${prompt}"
      Current Portfolio Context: ${JSON.stringify(context || {})}
      
      Generate a premium financial-grade yield optimization strategy, explaining the logic, risk score (1-10 scale), gas cost index, and next actionable steps. Keep it under 250 words, highly condensed and impactful.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: formattedPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const resultText = response.text || "Failed to generate algorithmic yield intelligence.";

    return NextResponse.json({ text: resultText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error?.message || "An error occurred inside ArcaneAI Core." },
      { status: 500 }
    );
  }
}
