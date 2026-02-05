import { useCallback, useState } from 'react';
import type { HARFile, HAREntry } from '@/types/har';
import { useNetworkStore } from '@/stores/networkStore';

export interface HARImportState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useHARImport() {
  const [state, setState] = useState<HARImportState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const importHAR = useNetworkStore((state) => state.importHAR);

  const parseHARFile = useCallback((file: File): Promise<HARFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const harData = JSON.parse(content) as HARFile;
          
          if (!harData.log || !Array.isArray(harData.log.entries)) {
            reject(new Error('Invalid HAR file format: missing log or entries'));
            return;
          }
          
          resolve(harData);
        } catch (err) {
          reject(new Error(`Failed to parse HAR file: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) {
      setState({ isLoading: false, error: null, success: false });
      return;
    }

    setState({ isLoading: true, error: null, success: false });

    try {
      const harData = await parseHARFile(file);
      importHAR(harData);
      setState({ isLoading: false, error: null, success: true });
      
      setTimeout(() => {
        setState((prev) => ({ ...prev, success: false }));
      }, 3000);
    } catch (err) {
      setState({ 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false 
      });
    }
  }, [parseHARFile, importHAR]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.har')) {
      setState({ isLoading: false, error: 'Please drop a valid .har file', success: false });
      return;
    }

    await handleFileSelect(file);
  }, [handleFileSelect]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    handleFileSelect,
    handleDrop,
    clearError,
  };
}

export function generateMockData(count: number = 100): HAREntry[] {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const statuses = [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 500, 502, 503];
  const mimeTypes = [
    'text/html',
    'text/css',
    'application/javascript',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'font/woff2',
    'application/octet-stream',
  ];
  const domains = [
    'api.example.com',
    'cdn.example.com',
    'www.google.com',
    'fonts.googleapis.com',
    'analytics.google.com',
    'api.github.com',
    'unpkg.com',
    'cdnjs.cloudflare.com',
  ];
  const paths = [
    '/api/users',
    '/api/posts',
    '/assets/main.css',
    '/assets/app.js',
    '/images/logo.png',
    '/fonts/inter.woff2',
    '/api/auth/login',
    '/api/data',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/api/search',
    '/assets/vendor.js',
    '/styles/theme.css',
  ];

  const entries: HAREntry[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const mimeType = mimeTypes[Math.floor(Math.random() * mimeTypes.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const size = Math.floor(Math.random() * 1000000);
    const time = Math.random() * 2000;
    
    const startedDateTime = new Date(baseTime + i * 100).toISOString();

    entries.push({
      startedDateTime,
      time,
      request: {
        method,
        url: `https://${domain}${path}`,
        httpVersion: 'HTTP/2.0',
        headers: [
          { name: ':method', value: method },
          { name: ':authority', value: domain },
          { name: ':scheme', value: 'https' },
          { name: ':path', value: path },
          { name: 'user-agent', value: 'Mozilla/5.0' },
          { name: 'accept', value: '*/*' },
        ],
        cookies: [],
        queryString: [],
        headersSize: 500,
        bodySize: method === 'GET' ? 0 : Math.floor(Math.random() * 1000),
      },
      response: {
        status,
        statusText: getStatusText(status),
        httpVersion: 'HTTP/2.0',
        headers: [
          { name: 'content-type', value: mimeType },
          { name: 'cache-control', value: 'max-age=3600' },
          { name: 'date', value: new Date().toUTCString() },
        ],
        cookies: [],
        content: { size, mimeType },
        redirectURL: '',
        headersSize: 300,
        bodySize: size,
        _transferSize: Math.floor(size * 0.3),
      },
      cache: {},
      timings: {
        blocked: Math.random() * 10,
        dns: Math.random() * 50,
        connect: Math.random() * 100,
        send: Math.random() * 20,
        wait: Math.random() * 500,
        receive: Math.random() * 200,
        ssl: Math.random() * 50,
      },
      serverIPAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    });
  }

  return entries;
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
}
