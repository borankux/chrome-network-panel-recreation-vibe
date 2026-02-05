import { useRef, useCallback, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNetworkStore } from '@/stores/networkStore';
import { RequestRow } from './RequestRow';
import { TableHeader } from './TableHeader';
import { generateCurlCommand, copyToClipboard } from '@/lib/utils';
import type { HAREntry } from '@/types/har';
import { Copy, ExternalLink, FileJson } from 'lucide-react';

const ROW_HEIGHT = 28;
const BIG_ROW_HEIGHT = 44;

export function RequestsTable() {
  const { filteredEntries, selectedEntry, selectEntry, bigRequestRows, sortConfig, setSortConfig } = useNetworkStore();
  const parentRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entry: HAREntry } | null>(null);

  const rowHeight = bigRequestRows ? BIG_ROW_HEIGHT : ROW_HEIGHT;

  const virtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleRowClick = useCallback((entry: HAREntry) => {
    selectEntry(entry);
  }, [selectEntry]);

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: HAREntry) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, entry });
  }, []);

  const handleSort = useCallback((key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  }, [sortConfig, setSortConfig]);

  const handleContainerClick = useCallback(() => {
    if (contextMenu) setContextMenu(null);
  }, [contextMenu]);

  return (
    <div ref={parentRef} className="h-full overflow-auto" onClick={handleContainerClick}>
      <table className="w-full border-collapse">
        <TableHeader sortConfig={sortConfig} onSort={handleSort} />
        <tbody>
          {virtualItems.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No requests match the current filters</td>
            </tr>
          ) : (
            <tr>
              <td colSpan={7} style={{ height: `${virtualizer.getTotalSize()}px` }} className="p-0">
                <div style={{ position: 'relative', height: `${virtualizer.getTotalSize()}px` }}>
                  {virtualItems.map((virtualItem) => {
                    const entry = filteredEntries[virtualItem.index];
                    const isSelected = selectedEntry?.startedDateTime === entry.startedDateTime &&
                                      selectedEntry?.request.url === entry.request.url;
                    
                    return (
                      <div
                        key={`${entry.startedDateTime}-${entry.request.url}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <RequestRow
                          entry={entry}
                          isSelected={isSelected}
                          isEven={virtualItem.index % 2 === 0}
                          onClick={() => handleRowClick(entry)}
                          onContextMenu={(e) => handleContextMenu(e, entry)}
                          bigRows={bigRequestRows}
                        />
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {contextMenu && (
        <RequestContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entry={contextMenu.entry}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

interface ContextMenuProps {
  x: number;
  y: number;
  entry: HAREntry;
  onClose: () => void;
}

function RequestContextMenu({ x, y, entry, onClose }: ContextMenuProps) {
  const handleCopyUrl = async () => {
    await copyToClipboard(entry.request.url);
    onClose();
  };

  const handleCopyCurl = async () => {
    const curl = generateCurlCommand(entry);
    await copyToClipboard(curl);
    onClose();
  };

  const handleOpenInNewTab = () => {
    if (entry.request.method === 'GET') {
      window.open(entry.request.url, '_blank');
    }
    onClose();
  };

  const menuX = Math.min(x, window.innerWidth - 200);
  const menuY = Math.min(y, window.innerHeight - 150);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed z-50 min-w-[160px] py-1 bg-popover border border-border rounded-md shadow-lg" style={{ left: menuX, top: menuY }}>
        <button
          className="w-full px-3 py-1.5 text-sm flex items-center gap-2 text-left hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          onClick={handleOpenInNewTab}
          disabled={entry.request.method !== 'GET'}
        >
          <ExternalLink className="w-4 h-4" /> Open in new tab
        </button>
        <div className="h-px bg-border my-1" />
        <button className="w-full px-3 py-1.5 text-sm flex items-center gap-2 text-left hover:bg-accent hover:text-accent-foreground" onClick={handleCopyUrl}>
          <Copy className="w-4 h-4" /> Copy URL
        </button>
        <button className="w-full px-3 py-1.5 text-sm flex items-center gap-2 text-left hover:bg-accent hover:text-accent-foreground" onClick={handleCopyCurl}>
          <FileJson className="w-4 h-4" /> Copy as cURL
        </button>
      </div>
    </>
  );
}
