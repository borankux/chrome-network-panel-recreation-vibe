import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import type { HAREntry } from '@/types/har';
import { cn, copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PreviewTabProps {
  entry: HAREntry;
}

export function PreviewTab({ entry }: PreviewTabProps) {
  const { response } = entry;
  const { content } = response;
  const mimeType = content.mimeType.toLowerCase();

  if (mimeType.includes('json')) {
    try {
      const jsonData = content.text ? JSON.parse(content.text) : null;
      return <div className="p-4"><JSONViewer data={jsonData} /></div>;
    } catch {
      return <TextPreview text={content.text || 'Unable to parse JSON'} />;
    }
  }

  if (mimeType.startsWith('image/')) {
    return (
      <div className="p-4 flex flex-col items-center">
        <img src={entry.request.url} alt="Preview" className="max-w-full max-h-[400px] object-contain border border-border rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <p className="mt-2 text-sm text-muted-foreground">{content.mimeType} · {content.size} bytes</p>
      </div>
    );
  }

  if (mimeType.includes('html')) {
    return (
      <div className="p-4">
        <div className="border border-border rounded overflow-hidden">
          <iframe srcDoc={content.text || '<p>No content</p>'} className="w-full h-[400px] bg-white" sandbox="" title="HTML Preview" />
        </div>
      </div>
    );
  }

  return <TextPreview text={content.text || 'No preview available'} />;
}

function TextPreview({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 bg-muted rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">{text}</pre>
    </div>
  );
}

function JSONViewer({ data }: { data: unknown }) {
  return <div className="font-mono text-xs"><JSONNode data={data} name="root" isRoot /></div>;
}

function JSONNode({ data, name, isRoot, isLast }: { data: unknown; name: string; isRoot?: boolean; isLast?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const type = getType(data);

  if (type === 'object' || type === 'array') {
    const count = type === 'object' ? Object.keys(data as Record<string, unknown>).length : (data as unknown[]).length;

    return (
      <div className="pl-0">
        {!isRoot && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-accent/30 rounded px-1 -ml-1" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="text-purple-600 dark:text-purple-400">"{name}"</span>
            <span className="text-muted-foreground">:</span>
            {!isExpanded && <span className="text-muted-foreground">{type === 'object' ? `{${count}}` : `[${count}]`}{isLast ? '' : ','}</span>}
          </div>
        )}
        {isExpanded && (
          <div className={cn(!isRoot && "pl-4 border-l border-border/50 ml-1.5")}>
            {type === 'object' ? (
              Object.entries(data as Record<string, unknown>).map(([key, value], index, arr) => (
                <JSONNode key={key} data={value} name={key} isLast={index === arr.length - 1} />
              ))
            ) : (
              (data as unknown[]).map((item, index, arr) => (
                <JSONNode key={index} data={item} name={String(index)} isLast={index === arr.length - 1} />
              ))
            )}
            <span className="text-muted-foreground">{type === 'object' ? '}' : ']'}{isLast || isRoot ? '' : ','}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 py-0.5">
      {!isRoot && <><span className="text-purple-600 dark:text-purple-400">"{name}"</span><span className="text-muted-foreground">:</span></>}
      <ValueDisplay value={data} />
      {!isLast && !isRoot && <span className="text-muted-foreground">,</span>}
    </div>
  );
}

function ValueDisplay({ value }: { value: unknown }) {
  const type = getType(value);

  switch (type) {
    case 'string': return <span className="text-green-600 dark:text-green-400">"{String(value)}"</span>;
    case 'number': return <span className="text-blue-600 dark:text-blue-400">{String(value)}</span>;
    case 'boolean': return <span className="text-orange-600 dark:text-orange-400">{String(value)}</span>;
    case 'null': return <span className="text-gray-500">null</span>;
    default: return <span>{String(value)}</span>;
  }
}

function getType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
