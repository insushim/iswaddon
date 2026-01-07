'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Package, FileArchive, CheckCircle2, Copy, RefreshCw } from 'lucide-react';

interface GenerationResultProps {
  result: {
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
  } | null;
  onDownload: (fileData: { filename: string; data: string; mimeType: string }) => void;
  onReset: () => void;
}

export function GenerationResult({ result, onDownload, onReset }: GenerationResultProps) {
  if (!result) return null;

  const { downloads, metadata } = result;

  const copyId = async () => {
    await navigator.clipboard.writeText(result.addonId);
  };

  return (
    <Card className="border-green-500/50 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          에드온 생성 완료!
        </CardTitle>
        <CardDescription>
          마인크래프트에서 사용할 에드온 파일이 준비되었습니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold">{metadata.entityCount}</p>
            <p className="text-xs text-muted-foreground">엔티티</p>
          </div>
          <div className="p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold">{metadata.itemCount}</p>
            <p className="text-xs text-muted-foreground">아이템</p>
          </div>
          <div className="p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold">{metadata.blockCount}</p>
            <p className="text-xs text-muted-foreground">블록</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
          <span className="text-muted-foreground">ID:</span>
          <code className="flex-1 truncate">{result.addonId}</code>
          <Button variant="ghost" size="sm" onClick={copyId}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">다운로드</p>

          <Button
            variant="default"
            className="w-full justify-between"
            onClick={() => onDownload(downloads.mcaddon)}
          >
            <span className="flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              {downloads.mcaddon.filename}
            </span>
            <Badge variant="secondary">.mcaddon</Badge>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="justify-between text-sm"
              onClick={() => onDownload(downloads.behaviorPack)}
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                BP
              </span>
              <Download className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              className="justify-between text-sm"
              onClick={() => onDownload(downloads.resourcePack)}
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                RP
              </span>
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">
            💡 .mcaddon 파일을 더블클릭하면 마인크래프트에 자동으로 설치됩니다
          </p>
          <Button variant="outline" className="w-full" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            새 에드온 만들기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
