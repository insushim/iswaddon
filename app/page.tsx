import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Blocks, Sword, Package, Zap, Code2, Download, ArrowRight,
  Bot, Wand2, FileJson, Layers
} from 'lucide-react';

const features = [
  {
    icon: <Bot className="h-10 w-10 text-purple-500" />,
    title: 'AI 기반 생성',
    description: '자연어로 원하는 에드온을 설명하면 AI가 자동으로 완전한 에드온을 생성합니다.',
  },
  {
    icon: <Sword className="h-10 w-10 text-red-500" />,
    title: '커스텀 엔티티',
    description: '독특한 몹, 보스, NPC를 만들고 AI 행동, 공격 패턴, 스폰 규칙을 설정하세요.',
  },
  {
    icon: <Package className="h-10 w-10 text-blue-500" />,
    title: '커스텀 아이템',
    description: '무기, 도구, 음식, 갑옷 등 다양한 아이템을 만들고 특수 효과를 추가하세요.',
  },
  {
    icon: <Blocks className="h-10 w-10 text-green-500" />,
    title: '커스텀 블록',
    description: '장식용, 기능성 블록을 만들고 상태, 퍼뮤테이션, 인터랙션을 정의하세요.',
  },
  {
    icon: <Code2 className="h-10 w-10 text-orange-500" />,
    title: '스크립팅 지원',
    description: '@minecraft/server API를 활용한 고급 스크립팅으로 복잡한 로직을 구현하세요.',
  },
  {
    icon: <Download className="h-10 w-10 text-cyan-500" />,
    title: '즉시 다운로드',
    description: '.mcaddon 파일을 바로 다운로드하여 마인크래프트에서 테스트하세요.',
  },
];

const examples = [
  { type: '엔티티', name: '불꽃 드래곤', difficulty: 'complex' },
  { type: '아이템', name: '번개 검', difficulty: 'moderate' },
  { type: '블록', name: '점프 룬 블록', difficulty: 'simple' },
  { type: '엔티티', name: '좀비 기사', difficulty: 'moderate' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Powered by Gemini AI
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              AI로 만드는
              <span className="text-primary"> 마인크래프트 에드온</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              자연어로 설명하면 AI가 마인크래프트 베드락 에디션 에드온을 자동으로 생성합니다.
              <br />
              커스텀 엔티티, 아이템, 블록을 코딩 없이 만들어보세요.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/create">
                  <Wand2 className="mr-2 h-4 w-4" />
                  지금 시작하기
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/templates">
                  <Layers className="mr-2 h-4 w-4" />
                  템플릿 보기
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">강력한 기능</h2>
          <p className="mt-4 text-muted-foreground">
            AI 기반 에드온 생성기로 복잡한 마인크래프트 에드온을 쉽게 만드세요
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">사용 방법</h2>
            <p className="mt-4 text-muted-foreground">
              세 단계로 나만의 에드온을 만드세요
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold">컨셉 설명</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                원하는 에드온을 자연어로 설명하세요
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold">AI 분석</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                AI가 컨셉을 분석하고 구조를 생성합니다
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold">다운로드</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                완성된 .mcaddon 파일을 다운로드하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">생성 예시</h2>
          <p className="mt-4 text-muted-foreground">
            이런 에드온들을 만들 수 있습니다
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
          {examples.map((example, index) => (
            <Card key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileJson className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{example.name}</p>
                  <p className="text-xs text-muted-foreground">{example.type}</p>
                </div>
              </div>
              <Badge
                variant={
                  example.difficulty === 'simple'
                    ? 'secondary'
                    : example.difficulty === 'moderate'
                    ? 'default'
                    : 'destructive'
                }
              >
                {example.difficulty === 'simple'
                  ? '쉬움'
                  : example.difficulty === 'moderate'
                  ? '보통'
                  : '어려움'}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="container py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              지금 바로 시작하세요
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              무료로 나만의 마인크래프트 에드온을 만들어보세요
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/create">
                에드온 만들기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
