import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format bytes to human readable string
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format milliseconds to human readable string
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return Math.round(ms) + ' ms';
  }
  return (ms / 1000).toFixed(2) + ' s';
}

// Get status code color
export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) {
    return 'text-green-600 dark:text-green-400';
  } else if (status >= 300 && status < 400) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else if (status >= 400) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-gray-600 dark:text-gray-400';
}

// Get resource type from MIME type
export function getResourceType(mimeType: string): string {
  const type = mimeType.toLowerCase();
  
  if (type.includes('html')) return 'document';
  if (type.includes('css')) return 'stylesheet';
  if (type.includes('javascript') || type.includes('js')) return 'script';
  if (type.includes('json')) return 'xhr';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/') || type.startsWith('video/')) return 'media';
  if (type.includes('font') || type.includes('woff') || type.includes('ttf')) return 'font';
  if (type.includes('wasm')) return 'wasm';
  if (type.includes('manifest')) return 'manifest';
  
  return 'other';
}

// Get resource type icon/color
export function getResourceTypeStyles(type: string): { color: string; bgColor: string } {
  const styles: Record<string, { color: string; bgColor: string }> = {
    document: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' },
    stylesheet: { color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900' },
    script: { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
    xhr: { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' },
    fetch: { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' },
    image: { color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900' },
    media: { color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900' },
    font: { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900' },
    wasm: { color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900' },
    manifest: { color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900' },
    websocket: { color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900' },
    other: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  };
  
  return styles[type] || styles.other;
}

// Extract filename from URL
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || '';
    return filename || urlObj.hostname;
  } catch {
    return url;
  }
}

// Extract domain from URL
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Get file extension
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

// Truncate string with ellipsis
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// Generate cURL command from request
export function generateCurlCommand(entry: {
  request: {
    method: string;
    url: string;
    headers: Array<{ name: string; value: string }>;
    postData?: { text?: string };
  };
}): string {
  const { method, url, headers, postData } = entry.request;
  
  let curl = `curl '${url}' \\\n  -X ${method}`;
  
  headers.forEach(header => {
    if (!header.name.startsWith(':')) {
      curl += ` \\\n  -H '${header.name}: ${header.value}'`;
    }
  });
  
  if (postData?.text && ['POST', 'PUT', 'PATCH'].includes(method)) {
    curl += ` \\\n  -d '${postData.text}'`;
  }
  
  return curl;
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
