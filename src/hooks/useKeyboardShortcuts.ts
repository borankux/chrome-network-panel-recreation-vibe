import { useEffect, useCallback } from 'react';
import { useNetworkStore } from '@/stores/networkStore';

export function useKeyboardShortcuts() {
  const {
    toggleRecording,
    filteredEntries,
    selectedEntry,
    selectEntry,
    showDetailPane,
  } = useNetworkStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl/Cmd + F - Focus filter input
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const filterInput = document.querySelector('[data-filter-input]') as HTMLInputElement;
      if (filterInput) {
        filterInput.focus();
        filterInput.select();
      }
    }

    // Ctrl/Cmd + R - Toggle recording
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      toggleRecording();
    }

    // Escape - Close detail pane
    if (e.key === 'Escape' && showDetailPane) {
      e.preventDefault();
      selectEntry(null);
    }

    // Arrow keys for navigation
    if (showDetailPane && selectedEntry) {
      const currentIndex = filteredEntries.findIndex(
        (entry) => entry.startedDateTime === selectedEntry.startedDateTime &&
                  entry.request.url === selectedEntry.request.url
      );

      if (e.key === 'ArrowDown' && currentIndex < filteredEntries.length - 1) {
        e.preventDefault();
        selectEntry(filteredEntries[currentIndex + 1]);
      }

      if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        selectEntry(filteredEntries[currentIndex - 1]);
      }
    }

    // Ctrl/Cmd + O - Import HAR
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault();
      const fileInput = document.getElementById('har-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }, [
    toggleRecording,
    filteredEntries,
    selectedEntry,
    selectEntry,
    showDetailPane,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
