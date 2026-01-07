'use client';

import { useState, useCallback } from 'react';
import { ConceptInput } from '@/components/ai/ConceptInput';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { GenerationResult } from '@/components/ai/GenerationResult';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIGeneration, useAddonGenerator } from '@/hooks/useAddonGenerator';
import { useAddonStore } from '@/stores/addon-store';
import { toast } from 'sonner';
import { Settings, AlertCircle } from 'lucide-react';

type Step = 'input' | 'analysis' | 'config' | 'result';

interface AnalysisResult {
  success: boolean;
  generationId: string;
  analysis: {
    conceptType: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    difficulty: string;
    estimatedTime: number;
    components: Array<{ type: string; name: string; description: string }>;
    behaviors: Array<{ type: string; priority: number; description: string }>;
    resources: {
      textures: string[];
      geometry: string;
      animations: string[];
      sounds: string[];
    };
    features: string[];
    suggestions: string[];
    warnings: string[];
  };
  detailedAnalysis?: object;
  metadata: {
    generationTimeMs: number;
    model: string;
  };
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>('input');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generationResult, setGenerationResult] = useState<{
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
  } | null>(null);

  const { analyze, isAnalyzing } = useAIGeneration();
  const { generate, isGenerating, downloadFile } = useAddonGenerator();
  const store = useAddonStore();

  const handleAnalyze = useCallback(async (concept: string, options: { conceptType: string; detailed: boolean }) => {
    try {
      const result = await analyze({ concept, ...options }) as AnalysisResult;
      if (result) {
        setAnalysisResult(result);

        store.setAddonInfo({
          name: result.analysis.displayName || result.analysis.name,
          namespace: result.analysis.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          description: result.analysis.description,
        });

        if (result.detailedAnalysis) {
          store.loadFromAnalysis({
            conceptType: result.analysis.conceptType,
            analysis: result.analysis,
            detailedAnalysis: result.detailedAnalysis as any,
          });
        }

        setStep('analysis');
      }
    } catch (error) {
      toast.error('AI 분석 중 오류가 발생했습니다');
    }
  }, [analyze, store]);

  const handleGenerate = useCallback(async () => {
    if (!store.name || !store.namespace) {
      toast.error('에드온 이름과 네임스페이스를 입력해주세요');
      setStep('config');
      return;
    }

    try {
      const result = await generate();
      if (result) {
        setGenerationResult(result);
        setStep('result');
        toast.success('에드온이 성공적으로 생성되었습니다!');
      }
    } catch (error) {
      toast.error('에드온 생성 중 오류가 발생했습니다');
    }
  }, [generate, store.name, store.namespace]);

  const handleReset = useCallback(() => {
    setStep('input');
    setAnalysisResult(null);
    setGenerationResult(null);
    store.reset();
  }, [store]);

  const handleDownload = useCallback((fileData: { filename: string; data: string; mimeType: string }) => {
    downloadFile(fileData);
    toast.success(`${fileData.filename} 다운로드 시작`);
  }, [downloadFile]);

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">에드온 만들기</h1>
          <p className="mt-2 text-muted-foreground">
            AI에게 원하는 에드온을 설명하고 자동으로 생성하세요
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[
            { key: 'input', label: '컨셉 입력' },
            { key: 'analysis', label: 'AI 분석' },
            { key: 'config', label: '설정' },
            { key: 'result', label: '완료' },
          ].map((s, index) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s.key
                    ? 'bg-primary text-primary-foreground'
                    : ['input', 'analysis', 'config', 'result'].indexOf(step) >
                      ['input', 'analysis', 'config', 'result'].indexOf(s.key)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`mx-2 h-0.5 w-8 ${
                    ['input', 'analysis', 'config', 'result'].indexOf(step) > index
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {step === 'input' && (
              <ConceptInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            )}

            {step === 'analysis' && analysisResult && (
              <>
                <AIAnalysisPanel
                  analysis={analysisResult}
                  onGenerate={() => setStep('config')}
                  isGenerating={false}
                />
                <Button variant="outline" onClick={() => setStep('input')}>
                  다시 분석하기
                </Button>
              </>
            )}

            {step === 'config' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    에드온 설정
                  </CardTitle>
                  <CardDescription>
                    생성할 에드온의 기본 정보를 확인하고 수정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">에드온 이름</Label>
                    <Input
                      id="name"
                      value={store.name}
                      onChange={(e) => store.setAddonInfo({ name: e.target.value })}
                      placeholder="My Awesome Addon"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="namespace">네임스페이스</Label>
                    <Input
                      id="namespace"
                      value={store.namespace}
                      onChange={(e) =>
                        store.setAddonInfo({
                          namespace: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                        })
                      }
                      placeholder="my_addon"
                    />
                    <p className="text-xs text-muted-foreground">
                      소문자, 숫자, 밑줄만 사용 가능합니다
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={store.description}
                      onChange={(e) => store.setAddonInfo({ description: e.target.value })}
                      placeholder="에드온에 대한 설명을 입력하세요"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">버전</Label>
                      <Input
                        id="version"
                        value={store.version}
                        onChange={(e) => store.setAddonInfo({ version: e.target.value })}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minEngine">최소 엔진 버전</Label>
                      <Input
                        id="minEngine"
                        value={store.minEngineVersion}
                        onChange={(e) =>
                          store.setAddonInfo({ minEngineVersion: e.target.value })
                        }
                        placeholder="1.21.50"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setStep('analysis')}>
                      이전
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
                      {isGenerating ? '생성 중...' : '에드온 생성'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'result' && generationResult && (
              <GenerationResult
                result={generationResult}
                onDownload={handleDownload}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">현재 에드온 구성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">엔티티</span>
                    <Badge variant="secondary">{store.entities.length}개</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">아이템</span>
                    <Badge variant="secondary">{store.items.length}개</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">블록</span>
                    <Badge variant="secondary">{store.blocks.length}개</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">레시피</span>
                    <Badge variant="secondary">{store.recipes.length}개</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  팁
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 구체적으로 설명할수록 더 정확한 결과를 얻을 수 있습니다</li>
                  <li>• 체력, 공격력 등 수치를 명시하면 좋습니다</li>
                  <li>• 특수 능력이나 효과를 상세히 설명해주세요</li>
                  <li>• 생성된 .mcaddon 파일을 더블클릭하면 자동으로 설치됩니다</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
