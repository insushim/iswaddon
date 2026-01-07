'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Lightbulb, Clock, Zap, Download, Loader2 } from 'lucide-react';

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

interface AIAnalysisPanelProps {
  analysis: AnalysisResult | null;
  onGenerate: () => void;
  isGenerating: boolean;
}

const difficultyColors: Record<string, string> = {
  simple: 'bg-green-500',
  moderate: 'bg-yellow-500',
  complex: 'bg-red-500',
};

const conceptTypeLabels: Record<string, string> = {
  entity: '엔티티',
  item: '아이템',
  block: '블록',
  addon: '에드온',
};

export function AIAnalysisPanel({ analysis, onGenerate, isGenerating }: AIAnalysisPanelProps) {
  if (!analysis) return null;

  const { analysis: data, metadata } = analysis;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                분석 완료
              </CardTitle>
              <CardDescription>
                AI가 컨셉을 분석했습니다
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {(metadata.generationTimeMs / 1000).toFixed(2)}초
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">타입</p>
              <Badge variant="default">
                {conceptTypeLabels[data.conceptType] || data.conceptType}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">난이도</p>
              <Badge className={difficultyColors[data.difficulty]}>
                {data.difficulty === 'simple' ? '쉬움' : data.difficulty === 'moderate' ? '보통' : '어려움'}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">이름</p>
            <p className="font-semibold">{data.displayName}</p>
            <p className="text-xs text-muted-foreground">{data.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">설명</p>
            <p className="text-sm">{data.description}</p>
          </div>

          {data.features.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="h-4 w-4" />
                주요 기능
              </p>
              <div className="flex flex-wrap gap-1">
                {data.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.components.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">컴포넌트</p>
              <div className="space-y-1">
                {data.components.slice(0, 5).map((comp, idx) => (
                  <div key={idx} className="text-xs bg-muted p-2 rounded">
                    <span className="font-mono text-primary">{comp.name}</span>
                    <span className="text-muted-foreground ml-2">{comp.description}</span>
                  </div>
                ))}
                {data.components.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    외 {data.components.length - 5}개...
                  </p>
                )}
              </div>
            </div>
          )}

          {data.suggestions.length > 0 && (
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                제안 사항
              </p>
              <ul className="text-sm space-y-1">
                {data.suggestions.map((suggestion, idx) => (
                  <li key={idx}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {data.warnings.length > 0 && (
            <div className="border-l-4 border-yellow-500 pl-3">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                주의 사항
              </p>
              <ul className="text-sm space-y-1">
                {data.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            에드온 생성 중...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            에드온 생성하기
          </>
        )}
      </Button>
    </div>
  );
}
