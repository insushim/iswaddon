'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import { Search, Sword, Package, Blocks, Sparkles, ArrowRight } from 'lucide-react';

const templates = [
  {
    id: 'dragon-boss',
    name: '드래곤 보스',
    type: 'entity',
    difficulty: 'complex',
    description: '불을 뿜는 강력한 드래곤 보스 몹. 비행, 화염 브레스, 특수 공격 패턴 포함.',
    features: ['비행', '화염 브레스', '보스 체력바', '특수 드롭'],
    concept: '불을 뿜는 강력한 드래곤 보스 몹을 만들어줘. 체력은 300, 비행 가능하고 화염 브레스 공격을 해. 죽으면 드래곤 비늘과 드래곤 하트를 드롭해.',
  },
  {
    id: 'zombie-knight',
    name: '좀비 기사',
    type: 'entity',
    difficulty: 'moderate',
    description: '갑옷을 입고 검을 든 좀비 변종. 일반 좀비보다 강력.',
    features: ['근접 공격', '높은 방어력', '검 들고 있음'],
    concept: '갑옷을 입고 검을 든 좀비 기사를 만들어줘. 체력 40, 공격력 8, 일반 좀비보다 느리지만 방어력이 높아. 철검과 철갑옷을 드롭.',
  },
  {
    id: 'lightning-sword',
    name: '번개 검',
    type: 'item',
    difficulty: 'moderate',
    description: '공격 시 번개를 소환하는 마법 검.',
    features: ['번개 소환', '높은 공격력', '특수 효과'],
    concept: '적을 공격할 때 번개를 소환하는 마법 검을 만들어줘. 공격력 15, 내구도 500. 다이아몬드와 번개 에센스로 제작.',
  },
  {
    id: 'healing-apple',
    name: '치유의 사과',
    type: 'item',
    difficulty: 'simple',
    description: '먹으면 체력을 회복하고 재생 효과를 주는 특별한 사과.',
    features: ['체력 회복', '재생 효과', '제작 가능'],
    concept: '먹으면 체력 10을 즉시 회복하고 10초간 재생 효과를 주는 치유의 사과를 만들어줘. 황금 사과와 네더 와트로 제작.',
  },
  {
    id: 'jump-rune-block',
    name: '점프 룬 블록',
    type: 'block',
    difficulty: 'simple',
    description: '밟으면 높이 점프하는 마법의 블록.',
    features: ['점프 부스트', '파티클 효과', '빛 발산'],
    concept: '밟으면 점프력이 3배가 되는 마법의 룬 블록을 만들어줘. 파란색 빛을 내고 파티클 효과가 있어. 에메랄드와 엔더 펄로 제작.',
  },
  {
    id: 'storage-block',
    name: '확장 상자',
    type: 'block',
    difficulty: 'moderate',
    description: '일반 상자보다 2배 용량의 저장 블록.',
    features: ['대용량 저장', '인벤토리 UI', '제작 가능'],
    concept: '일반 상자보다 2배 용량을 가진 확장 상자 블록을 만들어줘. 상호작용하면 54칸 인벤토리가 열려. 상자 4개와 철로 제작.',
  },
];

const typeIcons = {
  entity: <Sword className="h-4 w-4" />,
  item: <Package className="h-4 w-4" />,
  block: <Blocks className="h-4 w-4" />,
};

const typeLabels = {
  entity: '엔티티',
  item: '아이템',
  block: '블록',
};

const difficultyLabels = {
  simple: '쉬움',
  moderate: '보통',
  complex: '어려움',
};

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">템플릿</h1>
          <p className="mt-2 text-muted-foreground">
            미리 만들어진 템플릿으로 빠르게 에드온을 시작하세요
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="템플릿 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge
              variant={selectedType === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedType(null)}
            >
              전체
            </Badge>
            {Object.entries(typeLabels).map(([key, label]) => (
              <Badge
                key={key}
                variant={selectedType === key ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType(key)}
              >
                {typeIcons[key as keyof typeof typeIcons]}
                <span className="ml-1">{label}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {typeIcons[template.type as keyof typeof typeIcons]}
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[template.type as keyof typeof typeLabels]}
                    </Badge>
                  </div>
                  <Badge
                    variant={
                      template.difficulty === 'simple'
                        ? 'secondary'
                        : template.difficulty === 'moderate'
                        ? 'default'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {difficultyLabels[template.difficulty as keyof typeof difficultyLabels]}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/create?template=${template.id}`}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    이 템플릿으로 시작
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        )}

        {/* Custom Creation CTA */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>원하는 템플릿이 없나요?</CardTitle>
            <CardDescription>
              AI에게 직접 설명하고 맞춤 에드온을 생성하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/create">
                AI로 직접 만들기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
