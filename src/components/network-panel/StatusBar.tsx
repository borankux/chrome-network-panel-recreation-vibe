import { useNetworkStore } from '@/stores/networkStore';
import { formatBytes, formatDuration } from '@/lib/utils';

export function StatusBar() {
  const { filteredEntries, entries } = useNetworkStore();

  const totalTransferred = entries.reduce((sum, e) => sum + (e.response._transferSize || e.response.bodySize || 0), 0);
  const totalResources = entries.reduce((sum, e) => sum + (e.response.bodySize || 0), 0);
  
  const totalTime = entries.length > 0
    ? Math.max(...entries.map(e => new Date(e.startedDateTime).getTime() + e.time)) -
      Math.min(...entries.map(e => new Date(e.startedDateTime).getTime()))
    : 0;

  return (
    <div className="h-6 flex items-center gap-4 px-3 text-[11px] bg-muted border-t border-border text-muted-foreground">
      <div className="flex items-center gap-1">
        <span className="font-medium text-foreground">{filteredEntries.length}</span>
        <span>/</span>
        <span>{entries.length}</span>
        <span>requests</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-foreground">{formatBytes(totalTransferred)}</span>
        <span>transferred</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-foreground">{formatBytes(totalResources)}</span>
        <span>resources</span>
      </div>

      <div className="flex-1" />

      {totalTime > 0 && (
        <div className="flex items-center gap-1">
          <span>Finish:</span>
          <span className="text-foreground">{formatDuration(totalTime)}</span>
        </div>
      )}
    </div>
  );
}
