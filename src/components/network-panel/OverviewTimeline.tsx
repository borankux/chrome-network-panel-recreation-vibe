import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { useNetworkStore } from '@/stores/networkStore';
import { cn } from '@/lib/utils';
import type { HAREntry } from '@/types/har';

const OVERVIEW_HEIGHT = 80;
const BAR_HEIGHT = 16;
const TIMELINE_PADDING = 8;

interface OverviewTimelineProps {
  className?: string;
}

export function OverviewTimeline({ className }: OverviewTimelineProps) {
  const { filteredEntries, entries, selectedEntry, selectEntry } = useNetworkStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEntry, setHoveredEntry] = useState<HAREntry | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Calculate time range
  const timeRange = useMemo(() => {
    if (entries.length === 0) return { start: 0, end: 1000, duration: 1000 };
    
    const startTimes = entries.map(e => new Date(e.startedDateTime).getTime());
    const start = Math.min(...startTimes);
    const endTimes = entries.map(e => new Date(e.startedDateTime).getTime() + e.time);
    const end = Math.max(...endTimes);
    
    return { start, end, duration: end - start || 1000 };
  }, [entries]);

  // Get resource type color
  const getResourceColor = (entry: HAREntry): string => {
    const mimeType = entry.response.content.mimeType || '';
    const url = entry.request.url;
    
    if (mimeType.includes('json') || entry.request.url.includes('api/')) return '#ff9f43'; // XHR - Orange
    if (mimeType.includes('javascript') || url.endsWith('.js')) return '#feca57'; // JS - Yellow
    if (mimeType.includes('css') || url.endsWith('.css')) return '#1dd1a1'; // CSS - Green
    if (mimeType.includes('image') || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(url)) return '#a29bfe'; // Image - Purple
    if (mimeType.includes('font') || /\.(woff2?|ttf|otf|eot)$/i.test(url)) return '#54a0ff'; // Font - Blue
    if (mimeType.includes('html') || url.endsWith('.html')) return '#2e86de'; // Doc - Dark Blue
    if (entry.request.url.startsWith('ws')) return '#10ac84'; // WebSocket - Teal
    return '#576574'; // Other - Gray
  };

  // Draw the overview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = OVERVIEW_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = OVERVIEW_HEIGHT;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get CSS variables for colors
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#1e1e1e' : '#ffffff';
    const gridColor = isDark ? '#333333' : '#e5e5e5';
    const textColor = isDark ? '#9d9d9d' : '#5f6368';

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    const numTicks = 10;
    for (let i = 0; i <= numTicks; i++) {
      const x = (i / numTicks) * width;
      ctx.beginPath();
      ctx.moveTo(x, TIMELINE_PADDING);
      ctx.lineTo(x, height - TIMELINE_PADDING);
      ctx.stroke();
    }

    // Draw request bars
    const barY = (height - BAR_HEIGHT) / 2;
    
    filteredEntries.forEach((entry, index) => {
      const entryStart = new Date(entry.startedDateTime).getTime();
      const startX = ((entryStart - timeRange.start) / timeRange.duration) * width;
      const barWidth = Math.max(1, (entry.time / timeRange.duration) * width);
      
      // Stagger bars vertically to avoid overlap
      const row = index % 3;
      const yOffset = row * (BAR_HEIGHT / 2 + 2);
      
      ctx.fillStyle = getResourceColor(entry);
      ctx.globalAlpha = 0.8;
      ctx.fillRect(startX, barY + yOffset, barWidth, BAR_HEIGHT / 2);
      
      // Highlight selected entry
      if (selectedEntry && entry.startedDateTime === selectedEntry.startedDateTime) {
        ctx.strokeStyle = isDark ? '#4d90fe' : '#1a73e8';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX - 1, barY + yOffset - 1, barWidth + 2, BAR_HEIGHT / 2 + 2);
      }
    });

    ctx.globalAlpha = 1;

    // Draw DOMContentLoaded line (blue)
    const domContentLoadedTime = entries.length > 0 ? 300 : 0; // Mock value
    if (domContentLoadedTime > 0) {
      const domX = (domContentLoadedTime / timeRange.duration) * width;
      ctx.strokeStyle = '#1a73e8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(domX, TIMELINE_PADDING);
      ctx.lineTo(domX, height - TIMELINE_PADDING);
      ctx.stroke();
    }

    // Draw Load line (red)
    const loadTime = entries.length > 0 ? 800 : 0; // Mock value
    if (loadTime > 0) {
      const loadX = (loadTime / timeRange.duration) * width;
      ctx.strokeStyle = '#d93025';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(loadX, TIMELINE_PADDING);
      ctx.lineTo(loadX, height - TIMELINE_PADDING);
      ctx.stroke();
    }

    // Draw time labels
    ctx.fillStyle = textColor;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= numTicks; i++) {
      const x = (i / numTicks) * width;
      const time = (i / numTicks) * timeRange.duration;
      const label = formatTimeLabel(time);
      ctx.fillText(label, x, height - 2);
    }
  }, [filteredEntries, entries, timeRange, selectedEntry]);

  // Handle mouse move for hover effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Find entry under mouse
    const width = rect.width;
    let foundEntry: HAREntry | null = null;

    filteredEntries.forEach((entry, index) => {
      const entryStart = new Date(entry.startedDateTime).getTime();
      const startX = ((entryStart - timeRange.start) / timeRange.duration) * width;
      const barWidth = Math.max(1, (entry.time / timeRange.duration) * width);
      
      const row = index % 3;
      const barY = (OVERVIEW_HEIGHT - BAR_HEIGHT) / 2 + row * (BAR_HEIGHT / 2 + 2);

      if (x >= startX && x <= startX + barWidth && y >= barY && y <= barY + BAR_HEIGHT / 2) {
        foundEntry = entry;
      }
    });

    setHoveredEntry(foundEntry);
  }, [filteredEntries, timeRange]);

  const handleMouseLeave = () => {
    setHoveredEntry(null);
    setMousePos(null);
  };

  const handleClick = useCallback(() => {
    if (hoveredEntry) {
      selectEntry(hoveredEntry);
    }
  }, [hoveredEntry, selectEntry]);

  if (entries.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={cn("relative border-b border-border bg-background", className)}
    >
      {/* Legend */}
      <div className="absolute top-1 left-2 right-2 flex items-center justify-between text-[10px] text-muted-foreground z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#ff9f43' }} />
            XHR
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#feca57' }} />
            JS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#1dd1a1' }} />
            CSS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#a29bfe' }} />
            Img
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#2e86de' }} />
            Doc
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#54a0ff' }} />
            Font
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-600" />
            DOMContentLoaded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-500" />
            Load
          </span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full cursor-crosshair",
          hoveredEntry && "cursor-pointer"
        )}
        style={{ height: OVERVIEW_HEIGHT }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* Hover tooltip */}
      {hoveredEntry && mousePos && (
        <div 
          className="absolute z-50 bg-popover border border-border rounded-md shadow-lg px-2 py-1 text-xs pointer-events-none"
          style={{ 
            left: Math.min(mousePos.x + 10, (containerRef.current?.offsetWidth || 0) - 200),
            top: mousePos.y - 40
          }}
        >
          <div className="font-medium truncate max-w-[200px]">
            {hoveredEntry.request.url.split('/').pop() || hoveredEntry.request.url}
          </div>
          <div className="text-muted-foreground">
            {hoveredEntry.request.method} · {hoveredEntry.response.status} · {formatDuration(hoveredEntry.time)}
          </div>
        </div>
      )}

      {/* Time range indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex items-center justify-between px-2 text-[10px] text-muted-foreground">
        <span>0 ms</span>
        <span>{formatDuration(timeRange.duration)} total</span>
      </div>
    </div>
  );
}

// Helper functions
function formatTimeLabel(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
