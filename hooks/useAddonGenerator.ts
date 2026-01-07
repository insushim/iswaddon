'use client';

import { useState, useCallback } from 'react';
import { useAddonStore } from '@/stores/addon-store';

interface GenerationResult {
  success: boolean;
  addonId: string;
  downloads: {
    mcaddon: { filename: string; data: string; mimeType: string };
    behaviorPack: { filename: string; data: string; mimeType: string };
    resourcePack: { filename: string; data: string; mimeType: string };
  };
  metadata: {
    name: string;
    namespace: string;
    version: string;
    entityCount: number;
    itemCount: number;
    blockCount: number;
  };
}

interface AIAnalysisResult {
  success: boolean;
  generationId: string;
  analysis: {
    conceptType: string;
    name: string;
    displayName: string;
    description: string;
    difficulty: string;
    features: string[];
  };
  detailedAnalysis?: object;
  metadata: {
    generationTimeMs: number;
    model: string;
  };
}

export function useAddonGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const store = useAddonStore();

  const generate = useCallback(async () => {
    console.log('[useAddonGenerator] ========== 에드온 생성 시작 ==========');
    setIsGenerating(true);
    setError(null);

    const requestBody = {
      name: store.name,
      namespace: store.namespace,
      description: store.description,
      version: store.version,
      minEngineVersion: store.minEngineVersion,
      entities: store.entities,
      items: store.items,
      blocks: store.blocks,
      recipes: store.recipes,
      lootTables: store.lootTables,
      spawnRules: store.spawnRules,
      animations: store.animations,
      scripts: store.scripts,
      enableScripting: store.enableScripting,
    };

    console.log('[useAddonGenerator] 요청 데이터:', JSON.stringify(requestBody, null, 2));

    try {
      console.log('[useAddonGenerator] API 호출 중: /api/generate/addon');
      const response = await fetch('/api/generate/addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('[useAddonGenerator] 응답 상태:', response.status, response.statusText);

      const responseData = await response.json();
      console.log('[useAddonGenerator] 응답 데이터:', JSON.stringify(responseData, null, 2).substring(0, 1000));

      if (!response.ok) {
        console.error('[useAddonGenerator] ❌ API 에러:', responseData);
        throw new Error(responseData.details || responseData.error || 'Generation failed');
      }

      console.log('[useAddonGenerator] ✅ 에드온 생성 성공!');
      setResult(responseData);
      return responseData;
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('[useAddonGenerator] ❌ 에러 발생:', errorMessage);
      console.error('[useAddonGenerator] 에러 스택:', (err as Error).stack);
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
      console.log('[useAddonGenerator] ========== 에드온 생성 완료 ==========');
    }
  }, [store]);

  const downloadFile = useCallback((fileData: { filename: string; data: string; mimeType: string }) => {
    const byteCharacters = atob(fileData.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileData.mimeType });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    generate,
    isGenerating,
    result,
    error,
    downloadFile,
  };
}

export function useAIGeneration() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (params: { concept: string; conceptType?: string; detailed?: boolean; language?: string }) => {
    console.log('[useAIGeneration] ========== AI 분석 시작 ==========');
    console.log('[useAIGeneration] 입력 파라미터:', JSON.stringify(params, null, 2));
    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('[useAIGeneration] API 호출 중: /api/generate/ai-concept');
      const response = await fetch('/api/generate/ai-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      console.log('[useAIGeneration] 응답 상태:', response.status, response.statusText);

      const responseData = await response.json();
      console.log('[useAIGeneration] 응답 데이터:', JSON.stringify(responseData, null, 2).substring(0, 1000));

      if (!response.ok) {
        console.error('[useAIGeneration] ❌ API 에러:', responseData);
        throw new Error(responseData.details || responseData.error || 'Analysis failed');
      }

      console.log('[useAIGeneration] ✅ AI 분석 성공!');
      setAnalysis(responseData);
      return responseData;
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('[useAIGeneration] ❌ 에러 발생:', errorMessage);
      console.error('[useAIGeneration] 에러 스택:', (err as Error).stack);
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
      console.log('[useAIGeneration] ========== AI 분석 완료 ==========');
    }
  }, []);

  return {
    analyze,
    isAnalyzing,
    analysis,
    error,
  };
}
