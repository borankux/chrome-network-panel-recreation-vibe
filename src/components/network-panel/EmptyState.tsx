import { Upload, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHARImport } from '@/hooks/useHARImport';

export function EmptyState() {
  const { handleFileSelect } = useHARImport();

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
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Network Panel</h2>
        <p className="text-muted-foreground mb-6">
          Record and inspect network activity from your browser. Import a HAR file to get started.
        </p>

        <Button onClick={handleImportClick} className="gap-2">
          <Upload className="w-4 h-4" />
          Import HAR File
        </Button>

        <div className="mt-8 text-xs text-muted-foreground">
          <p>You can also drag and drop a HAR file anywhere on this window</p>
        </div>

        <input type="file" id="har-file-input" accept=".har,.json" onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  );
}
