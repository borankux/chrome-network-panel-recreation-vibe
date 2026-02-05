import { Circle, Pause, Filter, Import, Trash2, Settings, Moon, Sun, Monitor, PanelTop } from 'lucide-react';
import { useNetworkStore } from '@/stores/networkStore';
import { useHARImport } from '@/hooks/useHARImport';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ActionBar() {
  const { isRecording, toggleRecording, toggleShowFilters, showFilters, toggleShowOverview, showOverview, clearEntries, entries } = useNetworkStore();
  const { handleFileSelect } = useHARImport();
  const { theme, setTheme } = useTheme();

  const handleImportClick = () => {
    const input = document.getElementById('har-file-input') as HTMLInputElement;
    if (input) input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  };

  return (
    <TooltipProvider>
      <div className="h-10 flex items-center gap-1 px-2 border-b border-border bg-background">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", isRecording && "text-red-500 hover:text-red-600")}
              onClick={toggleRecording}
            >
              {isRecording ? <Circle className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isRecording ? 'Stop recording' : 'Start recording'} (Ctrl+R)</p></TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={showFilters ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={toggleShowFilters}>
              <Filter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Toggle filters</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={showOverview ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={toggleShowOverview}>
              <PanelTop className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Toggle overview</p></TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleImportClick} data-import-trigger>
              <Import className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Import HAR file (Ctrl+O)</p></TooltipContent>
        </Tooltip>

        <input type="file" id="har-file-input" accept=".har,.json" onChange={handleFileChange} className="hidden" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearEntries} disabled={entries.length === 0}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Clear all requests</p></TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4 mr-2" /> Light {theme === 'light' && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4 mr-2" /> Dark {theme === 'dark' && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="h-4 w-4 mr-2" /> System {theme === 'system' && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
