'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Blocks, Menu, X, Github } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Blocks className="h-6 w-6 text-primary" />
          <span className="font-bold hidden sm:inline-block">MC Addon Generator</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
            홈
          </Link>
          <Link href="/create" className="transition-colors hover:text-foreground/80 text-foreground/60">
            에드온 만들기
          </Link>
          <Link href="/templates" className="transition-colors hover:text-foreground/80 text-foreground/60">
            템플릿
          </Link>
          <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
            문서
          </Link>
        </nav>

        <div className="flex items-center space-x-2 ml-auto">
          <Button variant="ghost" size="icon" asChild className="hidden md:flex">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild className="hidden md:flex">
            <Link href="/create">시작하기</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-2 p-4">
            <Link
              href="/"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              홈
            </Link>
            <Link
              href="/create"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              에드온 만들기
            </Link>
            <Link
              href="/templates"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              템플릿
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              문서
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
