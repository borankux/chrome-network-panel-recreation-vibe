import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { HAREntry, HARHeader, HARQueryParam } from '@/types/har';
import { cn, copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HeadersTabProps {
  entry: HAREntry;
}

export function HeadersTab({ entry }: HeadersTabProps) {
  const { request, response, serverIPAddress } = entry;
  const [copiedHeader, setCopiedHeader] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedHeader(key);
      setTimeout(() => setCopiedHeader(null), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4 text-sm">
      <Section title="General">
        <HeaderRow label="Request URL" value={request.url} isUrl />
        <HeaderRow label="Request Method" value={request.method} />
        <HeaderRow label="Status Code" value={`${response.status} ${response.statusText}`} />
        <HeaderRow label="Remote Address" value={serverIPAddress || 'N/A'} />
        <HeaderRow label="Referrer Policy" value="strict-origin-when-cross-origin" />
      </Section>

      <Section title={`Response Headers (${response.headers.length})`}>
        {response.headers.map((header: HARHeader, index: number) => (
          <HeaderRow
            key={`resp-${index}`}
            label={header.name}
            value={header.value}
            copiedKey={copiedHeader === `resp-${index}` ? 'check' : undefined}
            onCopy={() => handleCopy(header.value, `resp-${index}`)}
          />
        ))}
      </Section>

      <Section title={`Request Headers (${request.headers.length})`}>
        {request.headers.map((header: HARHeader, index: number) => (
          <HeaderRow
            key={`req-${index}`}
            label={header.name}
            value={header.value}
            copiedKey={copiedHeader === `req-${index}` ? 'check' : undefined}
            onCopy={() => handleCopy(header.value, `req-${index}`)}
          />
        ))}
      </Section>

      {request.queryString.length > 0 && (
        <Section title={`Query String Parameters (${request.queryString.length})`}>
          {request.queryString.map((param: HARQueryParam, index: number) => (
            <HeaderRow
              key={`query-${index}`}
              label={param.name}
              value={param.value}
              copiedKey={copiedHeader === `query-${index}` ? 'check' : undefined}
              onCopy={() => handleCopy(param.value, `query-${index}`)}
            />
          ))}
        </Section>
      )}

      {request.postData?.text && (
        <Section title="Request Payload">
          <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs overflow-x-auto">
            <pre>{request.postData.text}</pre>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-4 last:border-0">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

interface HeaderRowProps {
  label: string;
  value: string;
  isUrl?: boolean;
  copiedKey?: 'check';
  onCopy?: () => void;
}

function HeaderRow({ label, value, isUrl, copiedKey, onCopy }: HeaderRowProps) {
  return (
    <div className="flex items-start gap-4 py-0.5 hover:bg-accent/30 -mx-2 px-2 rounded group">
      <div className="w-32 shrink-0 text-muted-foreground text-xs pt-0.5">{label}</div>
      <div className="flex-1 min-w-0 flex items-start gap-2">
        {isUrl ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all text-xs">{value}</a>
        ) : (
          <span className={cn("break-all text-xs", label.toLowerCase().includes('content-type') && "text-green-600 dark:text-green-400")}>{value}</span>
        )}
        {onCopy && (
          <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={onCopy}>
            {copiedKey === 'check' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        )}
      </div>
    </div>
  );
}
