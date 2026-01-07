import Link from 'next/link';
import { Blocks } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Blocks className="h-6 w-6 text-primary" />
              <span className="font-bold">MC Addon Generator</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              AI 기반 마인크래프트 베드락 에디션 에드온 생성기
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">제품</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/create" className="hover:text-foreground transition-colors">
                  에드온 만들기
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-foreground transition-colors">
                  템플릿
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  문서
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">지원</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/docs/getting-started" className="hover:text-foreground transition-colors">
                  시작하기
                </Link>
              </li>
              <li>
                <Link href="/docs/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="https://github.com" className="hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">법적 고지</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MC Addon Generator. All rights reserved.</p>
          <p className="mt-2">
            Minecraft는 Mojang Studios의 상표입니다. 이 프로젝트는 Mojang과 관련이 없습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
