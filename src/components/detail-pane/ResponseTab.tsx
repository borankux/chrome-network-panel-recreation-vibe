import { useState } from 'react';
import { Copy, Check, WrapText } from 'lucide-react';
import type { HAREntry } from '@/types/har';
import { cn, copyToClipboard, formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ResponseTabProps {
  entry: HAREntry;
}

export function ResponseTab({ entry }: ResponseTabProps) {
  const { response } = entry;
  const { content } = response;
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  const text = content.text || 'No response body';
  const highlightedText = syntaxHighlight(text, content.mimeType);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{content.mimeType || 'text/plain'}</span>
          <span>{formatBytes(content.size)}</span>
          {content.encoding && <span>Encoding: {content.encoding}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className={cn("h-7 gap-1", wordWrap && "bg-accent")} onClick={() => setWordWrap(!wordWrap)}>
            <WrapText className="h-3.5 w-3.5" />
            <span className="text-xs">Wrap</span>
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <pre className={cn("p-4 text-xs font-mono leading-relaxed", !wordWrap && "whitespace-pre", wordWrap && "whitespace-pre-wrap break-all")} dangerouslySetInnerHTML={{ __html: highlightedText }} />
      </div>
    </div>
  );
}

function syntaxHighlight(text: string, mimeType: string): string {
  if (!text) return '';

  let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const type = mimeType.toLowerCase();

  if (type.includes('json')) {
    return escaped
      .replace(/"(\\.|[^"\\])*"/g, '<span class="text-green-600 dark:text-green-400">$&</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="text-orange-600 dark:text-orange-400">$&</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-600 dark:text-blue-400">$&</span>');
  }

  if (type.includes('html')) {
    return escaped
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="text-purple-600 dark:text-purple-400">$2</span>')
      .replace(/(\s)([\w-]+)(=)/g, '$1<span class="text-orange-600 dark:text-orange-400">$2</span>$3')
      .replace(/"(\\.|[^"\\])*"/g, '<span class="text-green-600 dark:text-green-400">$&</span>');
  }

  if (type.includes('css')) {
    return escaped
      .replace(/([\w-]+)(\s*:)/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>$2')
      .replace(/(\{)\s*([\w-]+)/g, '$1<span class="text-purple-600 dark:text-purple-400">$2</span>')
      .replace(/\b(\d+\.?\d*(px|em|rem|%|s|ms))\b/g, '<span class="text-orange-600 dark:text-orange-400">$&</span>');
  }

  if (type.includes('javascript') || type.includes('js')) {
    const keywords = 'const|let|var|function|return|if|else|for|while|class|import|export|from|async|await';
    const keywordRegex = new RegExp(`\\b(${keywords})\\b`, 'g');
    return escaped
      .replace(keywordRegex, '<span class="text-purple-600 dark:text-purple-400">$&</span>')
      .replace(/"(\\.|[^"\\])*"|'(\\.|[^'\\])*'|`(\\.|[^`\\])*`/g, '<span class="text-green-600 dark:text-green-400">$&</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-600 dark:text-orange-400">$&</span>')
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>');
  }

  return escaped;
}
