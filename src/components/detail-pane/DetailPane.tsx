import { useState } from 'react';
import { X } from 'lucide-react';
import { useNetworkStore } from '@/stores/networkStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeadersTab } from './HeadersTab';
import { PreviewTab } from './PreviewTab';
import { ResponseTab } from './ResponseTab';
import { TimingTab } from './TimingTab';
import { CookiesTab } from './CookiesTab';

export function DetailPane() {
  const { selectedEntry, selectEntry } = useNetworkStore();
  const [activeTab, setActiveTab] = useState('headers');

  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a request to view details</p>
      </div>
    );
  }

  const { request, response } = selectedEntry;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn(
            "text-sm font-medium px-2 py-0.5 rounded",
            response.status >= 200 && response.status < 300 && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
            response.status >= 300 && response.status < 400 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
            response.status >= 400 && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          )}>
            {request.method}
          </span>
          <span className="text-sm truncate" title={request.url}>{request.url}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => selectEntry(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/50 h-8 px-2">
          <TabsTrigger value="headers" className="text-xs h-6">Headers</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs h-6">Preview</TabsTrigger>
          <TabsTrigger value="response" className="text-xs h-6">Response</TabsTrigger>
          <TabsTrigger value="timing" className="text-xs h-6">Timing</TabsTrigger>
          <TabsTrigger value="cookies" className="text-xs h-6">Cookies</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="headers" className="m-0 h-full"><HeadersTab entry={selectedEntry} /></TabsContent>
          <TabsContent value="preview" className="m-0 h-full"><PreviewTab entry={selectedEntry} /></TabsContent>
          <TabsContent value="response" className="m-0 h-full"><ResponseTab entry={selectedEntry} /></TabsContent>
          <TabsContent value="timing" className="m-0 h-full"><TimingTab entry={selectedEntry} /></TabsContent>
          <TabsContent value="cookies" className="m-0 h-full"><CookiesTab entry={selectedEntry} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
