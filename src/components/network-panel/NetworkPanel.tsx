import { useEffect, useState } from 'react';
import { useNetworkStore } from '@/stores/networkStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useHARImport, generateMockData } from '@/hooks/useHARImport';
import { ActionBar } from './ActionBar';
import { FilterToolbar } from './FilterToolbar';
import { OverviewTimeline } from './OverviewTimeline';
import { RequestsTable } from '../requests-table/RequestsTable';
import { DetailPane } from '../detail-pane/DetailPane';
import { StatusBar } from './StatusBar';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';

export function NetworkPanel() {
  const { filteredEntries, showFilters, showOverview, showDetailPane, detailPaneHeight, setDetailPaneHeight, setEntries } = useNetworkStore();
  const { handleDrop, isLoading, error, clearError } = useHARImport();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  useKeyboardShortcuts();
  
  useEffect(() => {
    if (filteredEntries.length === 0) {
      const mockData = generateMockData(50);
      setEntries(mockData);
    }
  }, []);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDropWrapper = async (e: React.DragEvent) => {
    setIsDragging(false);
    await handleDrop(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      setDetailPaneHeight(Math.max(150, Math.min(500, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setDetailPaneHeight]);

  return (
    <div 
      className={cn("flex flex-col h-screen bg-background text-foreground", isDragging && "ring-2 ring-primary ring-inset")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropWrapper}
    >
      <ActionBar />
      {showFilters && <FilterToolbar />}
      
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading HAR file...
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2">
            <span>{error}</span>
            <button onClick={clearError} className="hover:bg-destructive-foreground/20 rounded px-1">×</button>
          </div>
        )}
        
        {filteredEntries.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {showOverview && <OverviewTimeline />}
            <div className="flex-1 overflow-hidden">
              <RequestsTable />
            </div>
            
            {showDetailPane && (
              <>
                <div className="h-1 bg-border hover:bg-primary cursor-ns-resize flex items-center justify-center transition-colors" onMouseDown={() => setIsResizing(true)}>
                  <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
                <div className="border-t border-border overflow-hidden" style={{ height: detailPaneHeight }}>
                  <DetailPane />
                </div>
              </>
            )}
          </>
        )}
      </div>
      
      <StatusBar />
      
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-background border-2 border-dashed border-primary rounded-lg p-8 text-center">
            <p className="text-lg font-medium text-primary">Drop HAR file here</p>
            <p className="text-sm text-muted-foreground mt-1">Import network requests from a HAR file</p>
          </div>
        </div>
      )}
    </div>
  );
}
