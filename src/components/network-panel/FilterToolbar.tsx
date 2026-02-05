import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useNetworkStore } from '@/stores/networkStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { FilterType } from '@/types/har';

const FILTER_TYPES: { type: FilterType; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'xhr', label: 'Fetch/XHR' },
  { type: 'js', label: 'JS' },
  { type: 'css', label: 'CSS' },
  { type: 'img', label: 'Img' },
  { type: 'media', label: 'Media' },
  { type: 'font', label: 'Font' },
  { type: 'doc', label: 'Doc' },
  { type: 'ws', label: 'WS' },
  { type: 'wasm', label: 'Wasm' },
  { type: 'manifest', label: 'Manifest' },
  { type: 'other', label: 'Other' },
];

export function FilterToolbar() {
  const { filters, setFilterText, toggleFilterType, setInvertFilter } = useNetworkStore();
  const [localText, setLocalText] = useState(filters.text);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalText(value);
    setTimeout(() => setFilterText(value), 150);
  };

  const handleClear = () => {
    setLocalText('');
    setFilterText('');
  };

  return (
    <div className="h-9 flex items-center gap-2 px-2 border-b border-border bg-muted/50">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          data-filter-input
          type="text"
          placeholder="Filter by URL, status, type..."
          value={localText}
          onChange={handleTextChange}
          className="h-6 pl-7 pr-16 text-xs bg-background"
        />
        {localText && (
          <button onClick={handleClear} className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Checkbox
            id="invert-filter"
            checked={filters.invert}
            onCheckedChange={(checked) => setInvertFilter(checked as boolean)}
            className="h-3 w-3"
          />
          <label htmlFor="invert-filter" className="text-[10px] text-muted-foreground cursor-pointer">Invert</label>
        </div>
      </div>

      <div className="w-px h-5 bg-border" />

      <div className="flex items-center gap-0.5">
        {FILTER_TYPES.map(({ type, label }) => {
          const isActive = filters.types.includes(type);
          return (
            <Button
              key={type}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                "h-6 px-2 text-[11px] font-medium transition-all",
                isActive && type !== 'all' && "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
              )}
              onClick={() => toggleFilterType(type)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
