import { memo } from 'react';
import { cn, formatBytes, formatDuration, getStatusColor, getFilenameFromUrl, getResourceType, getResourceTypeStyles } from '@/lib/utils';
import type { HAREntry } from '@/types/har';

interface RequestRowProps {
  entry: HAREntry;
  isSelected: boolean;
  isEven: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  bigRows?: boolean;
}

export const RequestRow = memo(function RequestRow({
  entry,
  isSelected,
  isEven,
  onClick,
  onContextMenu,
  bigRows = false,
}: RequestRowProps) {
  const { request, response, time, timings } = entry;
  const filename = getFilenameFromUrl(request.url);
  const resourceType = getResourceType(response.content.mimeType);
  const typeStyles = getResourceTypeStyles(resourceType);
  
  const compressedSize = response._transferSize || response.bodySize;
  const uncompressedSize = response.bodySize;
  const fromCache = response.status === 304 || compressedSize === 0;
  
  const maxTime = 2000;
  const waterfallWidth = Math.min((time / maxTime) * 100, 100);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "flex items-center text-xs cursor-pointer select-none border-b border-border/50",
        isEven ? "bg-background" : "bg-muted/20",
        isSelected && "bg-blue-100 dark:bg-blue-900/40",
        "hover:bg-accent/50",
        bigRows ? "h-11" : "h-7"
      )}
      role="row"
      aria-selected={isSelected}
    >
      <div className="flex-1 min-w-[200px] px-2 flex items-center gap-1.5 truncate">
        <span className={cn("w-2 h-2 rounded-full shrink-0", typeStyles.bgColor.replace('bg-', 'bg-').replace('100', '500').replace('900', '500'))} />
        <span className="truncate font-medium" title={filename}>{filename}</span>
        {fromCache && <span className="text-[10px] text-muted-foreground shrink-0">(from cache)</span>}
      </div>

      <div className={cn("w-16 px-2 shrink-0", getStatusColor(response.status))}>{response.status}</div>
      <div className="w-20 px-2 text-muted-foreground shrink-0 truncate">{resourceType}</div>
      <div className="w-24 px-2 text-muted-foreground shrink-0 truncate">{entry._initiator?.type || 'other'}</div>

      <div className="w-32 px-2 text-muted-foreground shrink-0 text-right tabular-nums">
        {fromCache ? '(from cache)' : compressedSize === uncompressedSize ? formatBytes(uncompressedSize) : `${formatBytes(compressedSize)} / ${formatBytes(uncompressedSize)}`}
      </div>

      <div className="w-20 px-2 text-muted-foreground shrink-0 text-right tabular-nums">{formatDuration(time)}</div>

      <div className="w-32 px-2 shrink-0">
        <div className="h-4 bg-muted rounded-sm relative overflow-hidden">
          <div className="absolute top-0 h-full bg-green-400/60" style={{ left: `${((timings?.blocked || 0) + (timings?.dns || 0) + (timings?.connect || 0) + (timings?.send || 0)) / maxTime * 100}%`, width: `${(timings?.wait || 0) / maxTime * 100}%` }} />
          <div className="absolute top-0 h-full bg-blue-400/60" style={{ left: `${((timings?.blocked || 0) + (timings?.dns || 0) + (timings?.connect || 0) + (timings?.send || 0) + (timings?.wait || 0)) / maxTime * 100}%`, width: `${(timings?.receive || 0) / maxTime * 100}%` }} />
          <div className="absolute top-0 h-full border border-primary/50 rounded-sm" style={{ width: `${waterfallWidth}%` }} />
        </div>
      </div>
    </div>
  );
});
