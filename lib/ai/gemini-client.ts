import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const GEMINI_MODELS = {
  MAIN: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  FAST: 'gemini-1.5-flash',
} as const;

export const GENERATION_CONFIG = {
  DEFAULT: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  JSON_OUTPUT: {
    temperature: 0.2,
    topP: 0.85,
    topK: 20,
    maxOutputTokens: 16384,
  },
} as const;

export const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT' as const, threshold: 'BLOCK_ONLY_HIGH' as const },
  { category: 'HARM_CATEGORY_HATE_SPEECH' as const, threshold: 'BLOCK_ONLY_HIGH' as const },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as const, threshold: 'BLOCK_MEDIUM_AND_ABOVE' as const },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as const, threshold: 'BLOCK_ONLY_HIGH' as const },
];

export function getModel(
  modelName: keyof typeof GEMINI_MODELS = 'MAIN',
  configType: keyof typeof GENERATION_CONFIG = 'DEFAULT'
): GenerativeModel {
  return genAI.getGenerativeModel({
    model: GEMINI_MODELS[modelName],
    generationConfig: GENERATION_CONFIG[configType],
    safetySettings: SAFETY_SETTINGS as any,
  });
}

export async function generateText(
  prompt: string,
  options: {
    model?: keyof typeof GEMINI_MODELS;
    systemInstruction?: string;
  } = {}
): Promise<string> {
  const { model = 'MAIN', systemInstruction } = options;

  const genModel = genAI.getGenerativeModel({
    model: GEMINI_MODELS[model],
    generationConfig: GENERATION_CONFIG.DEFAULT,
    safetySettings: SAFETY_SETTINGS as any,
    systemInstruction,
  });

  const result = await genModel.generateContent(prompt);
  return result.response.text();
}

export async function generateJSON<T>(
  prompt: string,
  options: {
    model?: keyof typeof GEMINI_MODELS;
    systemInstruction?: string;
  } = {}
): Promise<T> {
  const { model = 'MAIN', systemInstruction } = options;

  const enhancedPrompt = prompt + '\n\nIMPORTANT: Respond with valid JSON only. No markdown code blocks, no explanations. Just pure JSON.';

  const genModel = genAI.getGenerativeModel({
    model: GEMINI_MODELS[model],
    generationConfig: GENERATION_CONFIG.JSON_OUTPUT,
    safetySettings: SAFETY_SETTINGS as any,
    systemInstruction,
  });

  const result = await genModel.generateContent(enhancedPrompt);
  const text = result.response.text();

  const cleanedText = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  return JSON.parse(cleanedText) as T;
}

export async function* generateStream(
  prompt: string,
  options: {
    model?: keyof typeof GEMINI_MODELS;
    systemInstruction?: string;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const { model = 'MAIN', systemInstruction } = options;

  const genModel = genAI.getGenerativeModel({
    model: GEMINI_MODELS[model],
    generationConfig: GENERATION_CONFIG.DEFAULT,
    safetySettings: SAFETY_SETTINGS as any,
    systemInstruction,
  });

  const result = await genModel.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

export async function safeGenerate<T>(
  fn: () => Promise<T>,
  fallback: T,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if ((error as any)?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  console.error('All attempts failed:', lastError);
  return fallback;
}
