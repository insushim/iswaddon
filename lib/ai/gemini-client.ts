import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Gemini 2.0 Flash 모델 사용 (최신 버전)
export const GEMINI_MODELS = {
  MAIN: 'gemini-2.0-flash',
  FAST: 'gemini-2.0-flash',
  ANALYSIS: 'gemini-2.0-flash',
} as const;

export const GENERATION_CONFIG = {
  DEFAULT: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  JSON_OUTPUT: {
    temperature: 0.3,
    topP: 0.9,
    topK: 30,
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
  console.log(`[Gemini] Using model: ${GEMINI_MODELS[modelName]}`);
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
  const modelName = GEMINI_MODELS[model];

  console.log(`[Gemini] generateText called with model: ${modelName}`);
  console.log(`[Gemini] Prompt length: ${prompt.length} chars`);

  try {
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: GENERATION_CONFIG.DEFAULT,
      safetySettings: SAFETY_SETTINGS as any,
      systemInstruction,
    });

    const result = await genModel.generateContent(prompt);
    const text = result.response.text();
    console.log(`[Gemini] Response length: ${text.length} chars`);
    return text;
  } catch (error) {
    console.error(`[Gemini] generateText error:`, error);
    throw error;
  }
}

export async function generateJSON<T>(
  prompt: string,
  options: {
    model?: keyof typeof GEMINI_MODELS;
    systemInstruction?: string;
  } = {}
): Promise<T> {
  const { model = 'MAIN', systemInstruction } = options;
  const modelName = GEMINI_MODELS[model];

  console.log(`[Gemini] generateJSON called with model: ${modelName}`);
  console.log(`[Gemini] Prompt preview: ${prompt.substring(0, 200)}...`);

  const enhancedPrompt = prompt + `

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON - no markdown, no code blocks, no explanations
2. Do not include \`\`\`json or \`\`\` markers
3. Ensure all JSON keys and string values are properly quoted
4. Do not add any text before or after the JSON object`;

  try {
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: GENERATION_CONFIG.JSON_OUTPUT,
      safetySettings: SAFETY_SETTINGS as any,
      systemInstruction,
    });

    const result = await genModel.generateContent(enhancedPrompt);
    const text = result.response.text();

    console.log(`[Gemini] Raw response preview: ${text.substring(0, 500)}...`);

    // Clean the response
    let cleanedText = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .replace(/^\s*[\r\n]+/, '')
      .replace(/[\r\n]+\s*$/, '')
      .trim();

    // Try to find JSON object in the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    console.log(`[Gemini] Cleaned JSON preview: ${cleanedText.substring(0, 300)}...`);

    try {
      const parsed = JSON.parse(cleanedText) as T;
      console.log(`[Gemini] JSON parsed successfully`);
      return parsed;
    } catch (parseError) {
      console.error(`[Gemini] JSON parse error:`, parseError);
      console.error(`[Gemini] Failed to parse text:`, cleanedText.substring(0, 1000));
      throw new Error(`Failed to parse JSON response: ${(parseError as Error).message}`);
    }
  } catch (error) {
    console.error(`[Gemini] generateJSON error:`, error);
    throw error;
  }
}

export async function* generateStream(
  prompt: string,
  options: {
    model?: keyof typeof GEMINI_MODELS;
    systemInstruction?: string;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const { model = 'MAIN', systemInstruction } = options;
  const modelName = GEMINI_MODELS[model];

  console.log(`[Gemini] generateStream called with model: ${modelName}`);

  try {
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: GENERATION_CONFIG.DEFAULT,
      safetySettings: SAFETY_SETTINGS as any,
      systemInstruction,
    });

    const result = await genModel.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error) {
    console.error(`[Gemini] generateStream error:`, error);
    throw error;
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
      console.log(`[Gemini] safeGenerate attempt ${attempt + 1}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`[Gemini] Attempt ${attempt + 1} failed:`, (error as Error).message);

      if ((error as any)?.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`[Gemini] Rate limited, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error('[Gemini] All attempts failed:', lastError);
  return fallback;
}
