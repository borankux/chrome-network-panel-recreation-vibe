import type { HAREntry } from '@/types/har';
import { formatDuration } from '@/lib/utils';

interface TimingTabProps {
  entry: HAREntry;
}

interface TimingPhase {
  name: string;
  duration: number;
  color: string;
  description?: string;
}

export function TimingTab({ entry }: TimingTabProps) {
  const { timings, time } = entry;

  const phases: TimingPhase[] = [
    { name: 'Queueing', duration: timings.blocked || 0, color: '#ff9f43', description: 'Time spent in queue' },
    { name: 'Stalled', duration: 0, color: '#ff9f43', description: 'Time stalled' },
    { name: 'DNS Lookup', duration: timings.dns || 0, color: '#feca57', description: 'Time to resolve DNS' },
    { name: 'Initial connection', duration: timings.connect || 0, color: '#feca57', description: 'Time to establish connection' },
    { name: 'SSL', duration: timings.ssl || 0, color: '#feca57', description: 'SSL handshake time' },
    { name: 'Request sent', duration: timings.send, color: '#54a0ff', description: 'Time sending request' },
    { name: 'Waiting (TTFB)', duration: timings.wait, color: '#1dd1a1', description: 'Time to first byte' },
    { name: 'Content Download', duration: timings.receive, color: '#2e86de', description: 'Time downloading response' },
  ];

  const activePhases = phases.filter(p => p.duration > 0);
  const totalTime = activePhases.reduce((sum, p) => sum + p.duration, 0) || 1;

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Request Timing</h3>
        <div className="space-y-2">
          {activePhases.map((phase) => (
            <TimingBar key={phase.name} phase={phase} totalTime={totalTime} />
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Explanation</h3>
        <div className="space-y-2 text-sm">
          {activePhases.map((phase) => (
            <div key={phase.name} className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-sm shrink-0 mt-0.5" style={{ backgroundColor: phase.color }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{phase.name}</span>
                  <span className="text-muted-foreground tabular-nums">{formatDuration(phase.duration)}</span>
                </div>
                {phase.description && <p className="text-xs text-muted-foreground">{phase.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border mt-4 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Total</span>
          <span className="tabular-nums">{formatDuration(time)}</span>
        </div>
      </div>
    </div>
  );
}

function TimingBar({ phase, totalTime }: { phase: TimingPhase; totalTime: number }) {
  const percentage = (phase.duration / totalTime) * 100;
  const minWidth = percentage < 1 ? 4 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-muted-foreground shrink-0">{phase.name}</div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden relative">
          <div className="h-full rounded-sm transition-all" style={{ width: `${Math.max(percentage, minWidth)}%`, backgroundColor: phase.color, opacity: 0.8 }} />
        </div>
        <div className="w-16 text-xs text-muted-foreground text-right tabular-nums shrink-0">{formatDuration(phase.duration)}</div>
      </div>
    </div>
  );
}
