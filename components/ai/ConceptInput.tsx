'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

interface ConceptInputProps {
  onAnalyze: (concept: string, options: { conceptType: string; detailed: boolean }) => Promise<void>;
  isLoading: boolean;
}

const exampleConcepts = [
  { label: '드래곤 몹', concept: '불을 뿜는 강력한 드래곤 보스 몹을 만들어줘. 체력은 300, 비행 가능하고 화염 브레스 공격을 해' },
  { label: '마법 검', concept: '적을 공격할 때 번개를 소환하는 마법 검을 만들어줘. 내구도 500, 공격력 15' },
  { label: '마법 블록', concept: '밟으면 점프력이 증가하는 마법의 룬 블록을 만들어줘. 파란색 빛을 내고 파티클 효과가 있어' },
  { label: '좀비 변종', concept: '갑옷을 입고 검을 든 좀비 기사를 만들어줘. 일반 좀비보다 강하고 방어력이 높아' },
];

export function ConceptInput({ onAnalyze, isLoading }: ConceptInputProps) {
  const [concept, setConcept] = useState('');
  const [conceptType, setConceptType] = useState<'auto' | 'entity' | 'item' | 'block'>('auto');

  const handleAnalyze = async () => {
    if (!concept.trim()) return;
    await onAnalyze(concept, { conceptType, detailed: true });
  };

  const handleExampleClick = (exampleConcept: string) => {
    setConcept(exampleConcept);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI 에드온 생성기
        </CardTitle>
        <CardDescription>
          원하는 에드온을 자연어로 설명하면 AI가 자동으로 생성해드립니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">생성할 타입</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'auto', label: '자동 감지' },
              { value: 'entity', label: '엔티티 (몹)' },
              { value: 'item', label: '아이템' },
              { value: 'block', label: '블록' },
            ].map((option) => (
              <Badge
                key={option.value}
                variant={conceptType === option.value ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => setConceptType(option.value as typeof conceptType)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">컨셉 설명</label>
          <Textarea
            placeholder="예: 불을 뿜는 드래곤 보스 몹을 만들어줘. 체력은 300이고 비행 가능해야 해..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {concept.length}/5000 글자
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">예시 컨셉</label>
          <div className="flex flex-wrap gap-2">
            {exampleConcepts.map((example) => (
              <Badge
                key={example.label}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleExampleClick(example.concept)}
              >
                {example.label}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!concept.trim() || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 분석 중...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              AI로 분석하기
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
