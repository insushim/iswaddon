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
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data: GenerationResult = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
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
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/ai-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data: AIAnalysisResult = await response.json();
      setAnalysis(data);
      return data;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyze,
    isAnalyzing,
    analysis,
    error,
  };
}
