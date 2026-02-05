import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortConfig } from '@/types/har';

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

const columns: { key: string; label: string; width: string; align?: 'left' | 'right' }[] = [
  { key: 'name', label: 'Name', width: 'flex-1 min-w-[200px]' },
  { key: 'status', label: 'Status', width: 'w-16' },
  { key: 'type', label: 'Type', width: 'w-20' },
  { key: 'initiator', label: 'Initiator', width: 'w-24' },
  { key: 'size', label: 'Size', width: 'w-32', align: 'right' },
  { key: 'time', label: 'Time', width: 'w-20', align: 'right' },
  { key: 'waterfall', label: 'Waterfall', width: 'w-32' },
];

export function TableHeader({ sortConfig, onSort }: TableHeaderProps) {
  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <thead className="sticky top-0 z-10 bg-background border-b border-border">
      <tr className="flex h-7 text-[11px] font-medium text-muted-foreground">
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              column.width,
              "px-2 flex items-center shrink-0",
              column.align === 'right' ? "justify-end" : "justify-start",
              column.key !== 'waterfall' && "cursor-pointer hover:bg-accent/50 select-none"
            )}
            onClick={() => column.key !== 'waterfall' && onSort(column.key)}
          >
            <span className="flex items-center gap-1">
              {column.label}
              {column.key !== 'waterfall' && renderSortIcon(column.key)}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}
