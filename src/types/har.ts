// HAR (HTTP Archive) Format Types
// Based on HAR 1.2 Specification

export interface HARFile {
  log: HARLog;
}

export interface HARLog {
  version: string;
  creator: HARCreator;
  browser?: HARBrowser;
  pages?: HARPage[];
  entries: HAREntry[];
  comment?: string;
}

export interface HARCreator {
  name: string;
  version: string;
  comment?: string;
}

export interface HARBrowser {
  name: string;
  version: string;
  comment?: string;
}

export interface HARPage {
  startedDateTime: string;
  id: string;
  title: string;
  pageTimings: HARPageTimings;
  comment?: string;
}

export interface HARPageTimings {
  onContentLoad?: number;
  onLoad?: number;
  comment?: string;
}

export interface HAREntry {
  pageref?: string;
  startedDateTime: string;
  time: number;
  request: HARRequest;
  response: HARResponse;
  cache: HARCache;
  timings: HARTimings;
  serverIPAddress?: string;
  connection?: string;
  comment?: string;
  _initiator?: HARInitiator;
  _priority?: string;
  _resourceType?: string;
}

export interface HARRequest {
  method: string;
  url: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  queryString: HARQueryParam[];
  headersSize: number;
  bodySize: number;
  postData?: HARPostData;
  comment?: string;
}

export interface HARResponse {
  status: number;
  statusText: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  content: HARContent;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
  comment?: string;
  _transferSize?: number;
}

export interface HARCache {
  beforeRequest?: HARCacheEntry | null;
  afterRequest?: HARCacheEntry | null;
  comment?: string;
}

export interface HARCacheEntry {
  expires?: string;
  lastAccess: string;
  eTag: string;
  hitCount: number;
  comment?: string;
}

export interface HARTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
  comment?: string;
}

export interface HARCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  comment?: string;
}

export interface HARHeader {
  name: string;
  value: string;
  comment?: string;
}

export interface HARQueryParam {
  name: string;
  value: string;
  comment?: string;
}

export interface HARPostData {
  mimeType: string;
  params?: HARPostParam[];
  text?: string;
  comment?: string;
}

export interface HARPostParam {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
  comment?: string;
}

export interface HARContent {
  size: number;
  compression?: number;
  mimeType: string;
  text?: string;
  encoding?: string;
  comment?: string;
}

export interface HARInitiator {
  type: 'parser' | 'script' | 'preflight' | 'other';
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  stack?: HARStack;
}

export interface HARStack {
  callFrames: HARCallFrame[];
  parent?: HARStack;
  description?: string;
}

export interface HARCallFrame {
  functionName: string;
  scriptId: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
}

// Application-specific types
export type ResourceType = 
  | 'document' 
  | 'stylesheet' 
  | 'script' 
  | 'xhr' 
  | 'fetch' 
  | 'image' 
  | 'font' 
  | 'media' 
  | 'websocket' 
  | 'manifest' 
  | 'wasm' 
  | 'other';

export type FilterType = 
  | 'all'
  | 'xhr'
  | 'fetch'
  | 'js'
  | 'css'
  | 'img'
  | 'media'
  | 'font'
  | 'doc'
  | 'ws'
  | 'wasm'
  | 'manifest'
  | 'other';

export interface NetworkFilters {
  text: string;
  types: FilterType[];
  invert: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface NetworkStats {
  totalRequests: number;
  filteredRequests: number;
  totalTransferred: number;
  totalResources: number;
  domContentLoaded: number;
  loadTime: number;
}
