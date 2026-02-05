import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HAREntry, HARFile, NetworkFilters, SortConfig, FilterType } from '@/types/har';

export interface NetworkState {
  entries: HAREntry[];
  filteredEntries: HAREntry[];
  selectedEntry: HAREntry | null;
  isRecording: boolean;
  showFilters: boolean;
  showOverview: boolean;
  showDetailPane: boolean;
  detailPaneHeight: number;
  filters: NetworkFilters;
  sortConfig: SortConfig;
  bigRequestRows: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface NetworkActions {
  setEntries: (entries: HAREntry[]) => void;
  addEntry: (entry: HAREntry) => void;
  clearEntries: () => void;
  selectEntry: (entry: HAREntry | null) => void;
  setFilterText: (text: string) => void;
  toggleFilterType: (type: FilterType) => void;
  setInvertFilter: (invert: boolean) => void;
  setSortConfig: (config: SortConfig) => void;
  toggleRecording: () => void;
  toggleShowFilters: () => void;
  toggleShowOverview: () => void;
  toggleDetailPane: () => void;
  setDetailPaneHeight: (height: number) => void;
  toggleBigRequestRows: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  importHAR: (harFile: HARFile) => void;
  applyFilters: () => void;
}

const initialState: NetworkState = {
  entries: [],
  filteredEntries: [],
  selectedEntry: null,
  isRecording: true,
  showFilters: true,
  showOverview: true,
  showDetailPane: false,
  detailPaneHeight: 300,
  filters: {
    text: '',
    types: ['all'],
    invert: false,
  },
  sortConfig: {
    key: 'startedDateTime',
    direction: 'asc',
  },
  bigRequestRows: false,
  theme: 'system',
};

export const useNetworkStore = create<NetworkState & NetworkActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setEntries: (entries) => {
        set({ entries });
        get().applyFilters();
      },

      addEntry: (entry) => {
        if (!get().isRecording) return;
        set((state) => ({ entries: [...state.entries, entry] }));
        get().applyFilters();
      },

      clearEntries: () => {
        set({ entries: [], filteredEntries: [], selectedEntry: null });
      },

      selectEntry: (entry) => {
        set({ selectedEntry: entry, showDetailPane: entry !== null });
      },

      setFilterText: (text) => {
        set((state) => ({ filters: { ...state.filters, text } }));
        get().applyFilters();
      },

      toggleFilterType: (type) => {
        set((state) => {
          const currentTypes = state.filters.types;
          let newTypes: FilterType[];

          if (type === 'all') {
            newTypes = ['all'];
          } else {
            const withoutAll = currentTypes.filter(t => t !== 'all');
            
            if (currentTypes.includes(type)) {
              newTypes = withoutAll.filter(t => t !== type);
              if (newTypes.length === 0) {
                newTypes = ['all'];
              }
            } else {
              newTypes = [...withoutAll, type];
            }
          }

          return { filters: { ...state.filters, types: newTypes } };
        });
        get().applyFilters();
      },

      setInvertFilter: (invert) => {
        set((state) => ({ filters: { ...state.filters, invert } }));
        get().applyFilters();
      },

      setSortConfig: (config) => {
        set({ sortConfig: config });
        get().applyFilters();
      },

      toggleRecording: () => {
        set((state) => ({ isRecording: !state.isRecording }));
      },

      toggleShowFilters: () => {
        set((state) => ({ showFilters: !state.showFilters }));
      },

      toggleShowOverview: () => {
        set((state) => ({ showOverview: !state.showOverview }));
      },

      toggleDetailPane: () => {
        set((state) => ({ showDetailPane: !state.showDetailPane }));
      },

      setDetailPaneHeight: (height) => {
        set({ detailPaneHeight: Math.max(150, Math.min(500, height)) });
      },

      toggleBigRequestRows: () => {
        set((state) => ({ bigRequestRows: !state.bigRequestRows }));
      },

      setTheme: (theme) => {
        set({ theme });
      },

      importHAR: (harFile) => {
        const entries = harFile.log.entries || [];
        set({ entries, filteredEntries: entries, selectedEntry: null });
      },

      applyFilters: () => {
        const { entries, filters, sortConfig } = get();
        let filtered = [...entries];

        if (!filters.types.includes('all')) {
          filtered = filtered.filter(entry => {
            const mimeType = entry.response.content.mimeType.toLowerCase();
            return filters.types.some((type: FilterType) => {
              switch (type) {
                case 'xhr':
                case 'fetch':
                  return mimeType.includes('json') || entry.request.headers.some((h: {name: string; value: string}) => h.value.toLowerCase().includes('application/json'));
                case 'js':
                  return mimeType.includes('javascript') || mimeType.includes('js');
                case 'css':
                  return mimeType.includes('css');
                case 'img':
                  return mimeType.startsWith('image/');
                case 'media':
                  return mimeType.startsWith('audio/') || mimeType.startsWith('video/');
                case 'font':
                  return mimeType.includes('font') || mimeType.includes('woff') || mimeType.includes('ttf');
                case 'doc':
                  return mimeType.includes('html');
                case 'ws':
                  return entry.request.url.startsWith('ws');
                case 'wasm':
                  return mimeType.includes('wasm');
                case 'manifest':
                  return mimeType.includes('manifest') || entry.request.url.includes('manifest');
                default:
                  return true;
              }
            });
          });
        }

        if (filters.text) {
          const searchText = filters.text.toLowerCase();
          const isInverted = filters.invert;
          
          filtered = filtered.filter(entry => {
            const matches = 
              entry.request.url.toLowerCase().includes(searchText) ||
              entry.request.method.toLowerCase().includes(searchText) ||
              entry.response.status.toString().includes(searchText) ||
              entry.response.content.mimeType.toLowerCase().includes(searchText);
            
            return isInverted ? !matches : matches;
          });
        }

        filtered.sort((a, b) => {
          let aValue: unknown;
          let bValue: unknown;

          switch (sortConfig.key) {
            case 'name':
              aValue = a.request.url.split('/').pop() || '';
              bValue = b.request.url.split('/').pop() || '';
              break;
            case 'status':
              aValue = a.response.status;
              bValue = b.response.status;
              break;
            case 'method':
              aValue = a.request.method;
              bValue = b.request.method;
              break;
            case 'type':
              aValue = a.response.content.mimeType;
              bValue = b.response.content.mimeType;
              break;
            case 'size':
              aValue = a.response.bodySize;
              bValue = b.response.bodySize;
              break;
            case 'time':
              aValue = a.time;
              bValue = b.time;
              break;
            case 'startedDateTime':
            default:
              aValue = new Date(a.startedDateTime).getTime();
              bValue = new Date(b.startedDateTime).getTime();
          }

          if (aValue === bValue) return 0;
          
          const result = aValue! < bValue! ? -1 : 1;
          return sortConfig.direction === 'asc' ? result : -result;
        });

        set({ filteredEntries: filtered });
      },
    }),
    {
      name: 'network-panel-settings',
      partialize: (state) => ({
        showFilters: state.showFilters,
        showOverview: state.showOverview,
        bigRequestRows: state.bigRequestRows,
        theme: state.theme,
        detailPaneHeight: state.detailPaneHeight,
      }),
    }
  )
);
