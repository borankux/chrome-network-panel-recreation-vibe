# Product Requirements Document (PRD)
## Chrome DevTools Network Panel UI Clone

**Version:** 1.0
**Date:** 2025-02-05
**Status:** Draft
**Author:** Frank (with Claude Code Research)

---

## 1. Executive Summary

### 1.1 Project Overview
Build a pixel-perfect recreation of the Chrome DevTools Network Panel as a modern web application. This UI-only implementation will display network request data in HAR (HTTP Archive) format with all visual fidelity, interactions, and user experience patterns of the original Chrome DevTools.

### 1.2 Primary Objectives
- **Visual Fidelity**: Match Chrome DevTools Network Panel appearance 1:1 (light and dark themes)
- **Feature Parity**: Implement all UI components, interactions, and views
- **Performance**: Handle 10,000+ network requests with smooth 60fps rendering
- **Accessibility**: Full keyboard navigation, screen reader support, ARIA compliance
- **Modern Stack**: Built with React, TypeScript, Tailwind CSS, and modern component libraries

### 1.3 Out of Scope
- Actual network interception/capture (data will be provided via HAR file import)
- Chrome extension integration
- Request blocking functionality
- Network throttling simulation (UI only, no actual throttling)
- Service Worker debugging

---

## 2. User Stories & Use Cases

### 2.1 Primary Users
1. **Web Developers**: Debugging network requests, analyzing performance
2. **QA Engineers**: Capturing network activity for bug reports
3. **Performance Analysts**: Analyzing load times and resource optimization
4. **Support Teams**: Reading HAR files from customers to diagnose issues

### 2.2 Core User Stories
- As a developer, I want to import HAR files to visualize network activity
- As a developer, I want to filter requests by type, status, URL, and size
- As a developer, I want to view request/response headers in a clean, organized format
- As a developer, I want to see timing breakdowns in a waterfall visualization
- As a developer, I want to export filtered views as HAR files
- As a developer, I want to copy any request data as cURL commands
- As a developer, I want to inspect JSON responses with syntax highlighting
- As a developer, I want to navigate between requests using keyboard shortcuts

---

## 3. Functional Requirements

### 3.1 Data Model

#### 3.1.1 HAR Format Support
- **Import**: Parse HAR 1.2 format files (JSON schema validation)
- **Export**: Generate HAR 1.2 format files
- **Validation**: Use `har-validator` library for schema compliance
- **TypeScript Types**: Use `@types/har-format` for type safety

#### 3.1.2 Core Data Structures

```typescript
// Main entry object (per network request)
interface NetworkEntry {
  pageref?: string;
  startedDateTime: string;
  time: number;
  request: Request;
  response: Response;
  cache: Cache;
  timings: Timings;
  serverIPAddress?: string;
  connection?: string;
}

interface Request {
  method: string;
  url: string;
  httpVersion: string;
  headers: Header[];
  cookies: Cookie[];
  queryString: QueryParam[];
  postData?: PostData;
  headersSize: number;
  bodySize: number;
}

interface Response {
  status: number;
  statusText: string;
  httpVersion: string;
  headers: Header[];
  cookies: Cookie[];
  content: Content;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
}

interface Timings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
}
```

### 3.2 UI Components

#### 3.2.1 Top Action Bar
**Location**: Top of panel, full width

**Components**:
- **Stop/Start Recording Button**: Toggle button (red circle icon when recording)
- **Filter Toggle Button**: Eye icon, shows/hides filter toolbar
- **Throttling Dropdown**: "No throttling" (default), "Offline", presets, custom
- **Import HAR Button**: File picker dialog
- **Export HAR Button**: Export all visible requests
- **Settings Gear Icon**: Opens settings menu

**Interactions**:
- Click to toggle states
- Dropdowns open on click, close on click outside
- Keyboard shortcut: `Ctrl/Cmd + R` for recording toggle

#### 3.2.2 Filter Toolbar
**Location**: Below action bar, collapsible

**Components**:
- **Filter Input Box**: Text input with real-time filtering
  - Placeholder: "Filter by URL, status, type, etc."
  - Supports: strings, regex, property filters (`domain:`, `method:`, `status-code:`)
  - Invert checkbox (negate filter)
  - Clear button (X) on right side

- **Resource Type Filter Buttons**: Horizontal button group
  - All, Fetch/XHR, JS, CSS, Img, Media, Font, Doc, WS, Wasm, Manifest, Other
  - Multi-select with Ctrl/Cmd+Click
  - Active state: Blue background
  - Inactive state: Grey background

**Property Filters Supported**:
- `domain:example.com` - Filter by domain
- `method:GET` - Filter by HTTP method
- `status-code:200` - Filter by status code
- `mime-type:application/json` - Filter by MIME type
- `larger-than:100` - Filter by response size (KB)
- `cookie-name:session` - Filter by cookie name
- `has-response-header:Location` - Filter by response header
- `scheme:https` - Filter by protocol scheme

#### 3.2.3 Overview Timeline
**Location**: Above request table, toggleable

**Components**:
- **Canvas-based timeline** showing all requests
- **Vertical markers**:
  - Blue line: DOMContentLoaded event
  - Red line: Load event
- **Draggable selection area**: Click and drag to filter by time range
- **Hover tooltip**: Shows count of requests in time range
- **Zoom**: Horizontal scroll to zoom in/out

**Visual Elements**:
- Request bars positioned by start time
- Bar width = request duration
- Color-coded by resource type
- Yellow indicator line when hovering over screenshots (if enabled)

#### 3.2.4 Screenshots Pane (Optional)
**Location**: Left side of timeline, when enabled

**Components**:
- **Thumbnail strip** of page load screenshots
- **Timestamp** below each thumbnail
- **Clickable**: Filters requests to moment of screenshot
- **Yellow indicator line** on timeline when hovering

**Settings**:
- Enable via: Settings > Capture screenshots
- Requires page reload to capture

#### 3.2.5 Requests Table (Network Log)
**Location**: Main content area, below timeline

**Columns** (default visible):
1. **Name** (leftmost, primary)
   - Shows filename or resource identifier
   - Favicon for domain
   - File extension badge
   - Truncates with ellipsis if too long

2. **Status**
   - HTTP status code (200, 404, 500, etc.)
   - Color-coded: Green (200-299), Yellow (300-399), Red (400-599)
   - Text for errors: "(blocked:origin)", "(failed)", CORS errors

3. **Type**
   - MIME type: document, stylesheet, script, xhr, fetch, image, font, media, websocket, etc.
   - Icon for each type

4. **Initiator**
   - What caused the request: Parser, Redirect, Script, Other
   - Stack trace on hover
   - Click to navigate to source (if available)

5. **Size**
   - Format: "compressed / uncompressed"
   - Example: "43.8 KB / 136 KB"
   - Units: bytes, KB, MB
   - Cached resources: "(from disk cache)", "(from memory cache)"

6. **Time**
   - Total duration in milliseconds
   - Format: "125 ms", "1.2 s"
   - Hover shows timing breakdown

7. **Waterfall**
   - Visual timing bars
   - Color-coded phases:
     - Light portion: Waiting (queueing, DNS, connection, TTFB)
     - Dark portion: Content download
   - Hover shows detailed timing tooltip

**Optional Columns** (right-click header to enable):
- Path, URL, Method, Protocol, Scheme, Domain, Remote Address, Cookies, Set-Cookies, Priority, Connection ID, etc.

**Interactions**:
- **Single click**: Select request, show detail pane
- **Double click**: Open URL in new tab (for GET requests)
- **Right-click**: Context menu (see 3.2.6)
- **Shift+Hover**: Show initiators (green) and dependencies (red)
- **Column header click**: Sort by column
- **Column drag**: Resize column width
- **Column header right-click**: Show/hide columns menu

**Sorting Options**:
- Ascending/descending toggle
- Waterfall column sort submenu: Start Time, Response Time, End Time, Total Duration, Latency

**Row Modes**:
- Standard rows: 24-28px height
- Big request rows: 40-48px height (shows additional info like uncompressed size, initial/final priority)

**Features**:
- Virtual scrolling (render only visible rows)
- Sticky column headers
- Horizontal scroll for wide tables
- Group by frame (expandable/collapsible groups)

#### 3.2.6 Context Menu
**Trigger**: Right-click on request row

**Menu Items**:

**Open**:
- Open in new tab (for GET requests)

**Copy** (submenu):
- Copy URL
- Copy as cURL (bash)
- Copy as PowerShell
- Copy as fetch (JavaScript)
- Copy as fetch (Node.js)
- Copy response
- Copy stack trace
- Copy all as HAR
- Copy all listed URLs / Copy all listed as cURL / etc.

**Replay XHR** (for XHR requests only)

**Clear**:
- Clear browser cache
- Clear browser cookies

**Block**:
- Block request URL
- Block request domain

**Add**:
- Add request header column (select from list)

#### 3.2.7 Detail View Pane
**Location**: Bottom panel, resizable height

**Layout**:
- Tabbed interface at top
- Content area below
- Close button (X) on top right
- Resize handle on top edge

**Tabs**:

1. **Headers Tab** (default)

   **Sections** (collapsible):
   - **General**: Request URL, Request Method, Status Code, Status Message, Remote Address, Referrer Policy
   - **Response Headers**: Alphabetically sorted
   - **Request Headers**: Alphabetically sorted
   - **Query String Parameters**: Parsed key-value pairs
   - **Form Data**: Parsed form data (for POST requests)
   - **Request Payload**: Raw request body
   - **Early Hints Headers** (when present)

   **Features**:
   - "View source" toggle button (original order vs alphabetical)
   - Edit button on hover for response headers (override functionality)
   - Warning messages for provisional headers
   - Links for URLs (clickable)
   - Copy button on hover for each header/value

2. **Preview Tab**

   **Content Types**:
   - **JSON**: Pretty-printed, syntax-highlighted, collapsible tree view
   - **HTML**: Rendered preview (not full page)
   - **Image**: Full image preview with dimensions
   - **XML**: Syntax-highlighted
   - **Text**: Plain text with monospace font

   **Features**:
   - Copy to clipboard button
   - Expand/collapse all buttons (for JSON)

3. **Response Tab**

   **Features**:
   - Raw response body
   - Syntax highlighting (JSON, HTML, CSS, JS, XML)
   - Line numbers
   - Word wrap toggle
   - Copy to clipboard
   - Size indicator
   - Encoding information

4. **Initiator Tab**

   **Content**: Tree view showing initiator chain
   - File names and line numbers
   - Links to source code (if available)
   - Expandable/collapsible

5. **Cookies Tab**

   **Table Columns**:
   - Name, Value, Domain, Path, Expires, Size, HTTP (flag), Secure (flag), SameSite

   **Features**:
   - Warning icons for blocked cookies
   - Information tooltips explaining why blocked
   - Separate tables for Request Cookies and Response Cookies

6. **Timing Tab**

   **Visual Layout**:
   - Left column: Timing phase labels
   - Right column: Visual bar chart (width = duration)
   - Each phase has distinct color

   **Timing Phases**:
   - Queueing (orange)
   - Stalled (orange)
   - DNS Lookup (yellow)
   - Initial connection (yellow)
   - Proxy negotiation (yellow)
   - Request sent (light blue)
   - ServiceWorker Preparation (purple)
   - Request to ServiceWorker (purple)
   - Waiting (TTFB) (green)
   - Content Download (blue)

   **Features**:
   - Hover over phases for tooltips
   - Exact milliseconds shown
   - Total time displayed at bottom

7. **Payload Tab**

   **Sections**:
   - Query String Parameters (parsed)
   - Form Data (parsed)
   - Request payload (raw)

   **Features**:
   - Toggle between parsed and source view
   - Toggle URL encoding
   - Copy button

8. **EventStream Tab** (for SSE/Fetch streaming)

   **Table Columns**:
   - Data, Length, Time

   **Features**:
   - Filter with regex
   - Clear button
   - Auto-scroll toggle

9. **Messages Tab** (for WebSocket)

   **Table Columns**:
   - Data, Length, Time

   **Features**:
   - Last 100 messages
   - Color-coded by type:
     - Outgoing text: Light green
     - Incoming text: White
     - Opcodes: Light yellow
     - Errors: Light red

#### 3.2.8 Search Pane
**Location**: Right side of request table, toggleable

**Trigger**: `Ctrl/Cmd + F`

**Components**:
- **Search input box**
- **Case sensitivity toggle** (Aa button)
- **Regular expression toggle** (.* button)
- **Search results** list
- **Highlighting**: Matching text in yellow

**Features**:
- Search across headers, payloads, and responses
- Click result to navigate to request
- Result count indicator
- Clear button

#### 3.2.9 Status Bar
**Location**: Bottom of panel, full width

**Content**:
- Request count: "125 / 200 requests" (shown / total)
- Total transferred: "2.3 MB transferred"
- Total resources: "5.1 MB resources"
- Finish time: "Doc: 1.2s / Finish: 2.8s"

---

## 4. Non-Functional Requirements

### 4.1 Performance

**Targets**:
- **Initial render**: < 100ms for 1,000 requests
- **Scroll performance**: 60fps with 10,000+ requests
- **Filter/sort**: < 200ms for any dataset
- **Memory**: < 500MB for 10,000 requests

**Optimization Strategies**:
- **Virtual scrolling**: Only render visible rows (use `@tanstack/react-virtual`)
- **Memoization**: Memo row components, filter functions
- **Web Workers**: Offload HAR parsing to web worker
- **Lazy loading**: Lazy load response bodies in detail pane
- **Debouncing**: Debounce filter input (300ms)

### 4.2 Accessibility

**Requirements**:
- **WCAG 2.1 AA** compliance
- **Keyboard navigation**: Full functionality without mouse
- **Screen readers**: Proper ARIA labels and roles
- **High contrast mode**: Support for high contrast themes
- **Focus indicators**: Visible focus states on all interactive elements

**Keyboard Shortcuts**:
- `Ctrl/Cmd + F`: Open search
- `Ctrl/Cmd + Shift + F`: Focus filter input
- `↑ / ↓`: Navigate requests
- `Enter`: Open request details
- `Esc`: Close detail pane / search
- `Ctrl/Cmd + R`: Toggle recording
- `Tab`: Navigate between tabs in detail pane

**ARIA Labels**:
- All buttons have aria-label
- Table has proper role="grid" or role="table"
- Tree views have role="tree"
- Tabs have role="tablist"
- Status updates use aria-live regions

### 4.3 Browser Support

**Target Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Progressive Enhancement**:
- Fallback for older browsers: Basic table without virtualization
- Feature detection for advanced APIs

### 4.4 Responsive Design

**Breakpoints**:
- Desktop: Full functionality (1280px+)
- Tablet: Vertical layout, hide optional columns (768px - 1279px)
- Mobile: Stacked layout, simplified view (< 768px)

**Adaptations**:
- Docked at bottom vs. docked at side
- Horizontal scrolling for wide tables
- Hide less-important columns on smaller screens
- Touch gestures for mobile (swipe, pinch-to-zoom)

---

## 5. Design Specifications

### 5.1 Color Palette

#### Light Mode
```css
--background-primary: #ffffff;
--background-secondary: #f3f3f3;
--background-tertiary: #e8eaed;
--border-color: #d3d3d3;
--text-primary: #202124;
--text-secondary: #5f6368;
--text-tertiary: #80868b;
--accent-color: #1a73e8;
--success-color: #188038;
--warning-color: #f9ab00;
--error-color: #d93025;
--info-color: #1a73e8;
```

#### Dark Mode
```css
--background-primary: #1e1e1e;
--background-secondary: #252526;
--background-tertiary: #2d2d2d;
--border-color: #3c3c3c;
--text-primary: #cccccc;
--text-secondary: #9d9d9d;
--text-tertiary: #707070;
--accent-color: #4d90fe;
--success-color: #81c995;
--warning-color: #f9ab00;
--error-color: #f48771;
--info-color: #4d90fe;
```

#### Waterfall Phase Colors
- Queueing/Stalled: #ff9f43 (orange)
- DNS Lookup/Connection: #feca57 (yellow)
- Request sent: #54a0ff (light blue)
- Waiting (TTFB): #1dd1a1 (green)
- Content Download: #2e86de (blue)
- ServiceWorker: #a29bfe (purple)

#### Status Code Colors
- 2xx (Success): #188038 (green)
- 3xx (Redirect): #f9ab00 (yellow)
- 4xx (Client Error): #d93025 (red)
- 5xx (Server Error): #d93025 (red)

### 5.2 Typography

**Font Families**:
- UI text: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Monospace/code: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace

**Font Sizes**:
- UI labels: 12px
- Table content: 12px
- Section headers: 13px
- Detail pane content: 13px
- Code/headers: 12px

**Font Weights**:
- Regular: 400
- Medium: 500
- Bold: 700

**Line Heights**:
- UI text: 1.5
- Code: 1.4

### 5.3 Spacing

**Base Unit**: 4px (0.25rem)

**Scale**:
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- 2xl: 24px
- 3xl: 32px

**Component Spacing**:
- Action bar height: 40px
- Filter toolbar height: 36px
- Timeline height: 80px (when visible)
- Standard row height: 24px
- Big row height: 40px
- Detail pane min-height: 200px
- Detail pane default-height: 300px

**Padding**:
- Cell padding: 4px 8px
- Button padding: 6px 12px
- Panel padding: 12px

### 5.4 Borders & Shadows

**Borders**:
- Width: 1px
- Style: solid
- Radius: 2px (buttons), 0 (table cells)

**Shadows**:
- Panel separator: none (use borders)
- Dropdown: 0 2px 8px rgba(0, 0, 0, 0.15)
- Modal: 0 8px 24px rgba(0, 0, 0, 0.25)

---

## 6. Technical Architecture

### 6.1 Technology Stack

#### Frontend Framework
- **React 18.3+** with TypeScript 5.3+
- **Vite** for build tooling (fast HMR)
- **Concurrent mode** for smooth rendering

#### State Management
- **Zustand** or **Jotai** for global state (lightweight, simple)
- **React Query** for server state (if adding API calls later)
- **URL state** for shareable filters (useSearchParams)

#### UI Libraries
- **shadcn/ui** for base components (built on Radix UI + Tailwind)
- **Tailwind CSS 3.4+** for styling
- **@tanstack/react-table** for data table (filtering, sorting, virtualization)
- **@tanstack/react-virtual** for virtual scrolling
- **react-json-view** for JSON inspector
- **@monaco-editor/react** for code/headers viewers

#### Utilities
- **date-fns** for date formatting
- **har-validator** for HAR validation
- **@types/har-format** for TypeScript types
- **clsx** or **cn** for className utilities
- **lodash-es** (tree-shakeable) for utility functions

#### Testing
- **Vitest** for unit tests
- **React Testing Library** for component tests
- **Playwright** for E2E tests
- **MSW** for API mocking

### 6.2 Component Architecture

```
src/
├── components/
│   ├── network-panel/
│   │   ├── NetworkPanel.tsx          (main container)
│   │   ├── ActionBar.tsx             (top controls)
│   │   ├── FilterToolbar.tsx         (filter inputs)
│   │   ├── OverviewTimeline.tsx      (timeline visualization)
│   │   ├── ScreenshotsPane.tsx       (screenshot strip)
│   │   ├── RequestsTable.tsx         (main data grid)
│   │   ├── DetailPane.tsx            (bottom detail view)
│   │   ├── SearchPane.tsx            (search sidebar)
│   │   └── StatusBar.tsx             (bottom status)
│   ├── requests-table/
│   │   ├── RequestsTable.tsx         (TanStack Table wrapper)
│   │   ├── RequestsRow.tsx           (individual row)
│   │   ├── WaterfallCell.tsx         (waterfall visualization)
│   │   └── ContextMenu.tsx           (right-click menu)
│   ├── detail-pane/
│   │   ├── HeadersTab.tsx            (headers viewer)
│   │   ├── PreviewTab.tsx            (JSON/HTML/image preview)
│   │   ├── ResponseTab.tsx           (raw response)
│   │   ├── TimingTab.tsx             (timing breakdown)
│   │   ├── CookiesTab.tsx            (cookies table)
│   │   ├── InitiatorTab.tsx          (initiator tree)
│   │   └── PayloadTab.tsx            (request payload)
│   └── ui/
│       ├── button.tsx                (shadcn/ui)
│       ├── dropdown.tsx              (shadcn/ui)
│       ├── input.tsx                 (shadcn/ui)
│       ├── checkbox.tsx              (shadcn/ui)
│       ├── tabs.tsx                  (shadcn/ui)
│       └── tooltip.tsx               (shadcn/ui)
├── hooks/
│   ├── useNetworkData.ts             (HAR data management)
│   ├── useFilters.ts                 (filter logic)
│   ├── useSorting.ts                 (sort logic)
│   ├── useVirtualization.ts          (virtual scrolling)
│   ├── useKeyboardShortcuts.ts       (keyboard nav)
│   └── useTheme.ts                   (theme toggle)
├── utils/
│   ├── har-parser.ts                 (HAR parsing)
│   ├── har-validator.ts              (HAR validation)
│   ├── filter-utils.ts               (filter functions)
│   ├── timing-utils.ts               (timing calculations)
│   └── formatters.ts                 (size/time formatting)
├── stores/
│   ├── networkStore.ts               (global state)
│   └── settingsStore.ts              (settings state)
└── types/
    └── har-format.ts                 (HAR types)
```

### 6.3 Data Flow

```
HAR File Import
    ↓
Web Worker (parse & validate)
    ↓
Network Store (Zustand)
    ↓
Requests Table (filtered/sorted)
    ↓
Detail Pane (selected entry)
```

### 6.4 Performance Optimization

**Virtual Scrolling**:
- Use `@tanstack/react-virtual` for request list
- Render only visible rows + buffer (5 rows above/below)
- Estimate row height: 24px (standard), 40px (big rows)

**Memoization**:
- Memoize row components with `React.memo()`
- Memoize filter/sort functions with `useMemo()`
- Memoize event handlers with `useCallback()`

**Code Splitting**:
- Lazy load detail pane tabs
- Lazy load Monaco Editor (heavy dependency)
- Dynamic import for HAR export functionality

**Web Workers**:
- Offload HAR parsing to web worker
- Offload large file export operations

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Basic project structure and core data handling

- [ ] Set up React + TypeScript + Vite project
- [ ] Install dependencies (shadcn/ui, TanStack Table, etc.)
- [ ] Create HAR parser and validator
- [ ] Create network store (Zustand)
- [ ] Basic layout structure (action bar, table, detail pane)
- [ ] HAR file import functionality
- [ ] Display basic request list (no filtering/sorting yet)

### Phase 2: Core Table (Week 3-4)
**Goal**: Full-featured request table with filtering and sorting

- [ ] Implement TanStack Table with all columns
- [ ] Add filtering (type, text, property filters)
- [ ] Add sorting (all columns)
- [ ] Add virtual scrolling
- [ ] Implement context menu
- [ ] Add keyboard navigation
- [ ] Status bar with counts
- [ ] Row selection and detail pane integration

### Phase 3: Detail Views (Week 5-6)
**Goal**: Complete detail pane with all tabs

- [ ] Headers tab (request/response, query params, form data)
- [ ] Preview tab (JSON inspector, HTML, images)
- [ ] Response tab (syntax highlighting)
- [ ] Timing tab (waterfall visualization)
- [ ] Cookies tab
- [ ] Initiator tab
- [ ] Payload tab
- [ ] Search pane

### Phase 4: Timeline & Advanced Features (Week 7)
**Goal**: Timeline visualization and advanced features

- [ ] Overview timeline canvas
- [ ] Screenshots pane
- [ ] Waterfall visualization in table
- [ ] HAR export functionality
- [ ] Copy as cURL/fetch/PowerShell
- [ ] Settings menu
- [ ] Theme toggle (light/dark)

### Phase 5: Polish & Optimization (Week 8)
**Goal**: Performance optimization and polish

- [ ] Performance testing with 10,000+ requests
- [ ] Memory leak testing
- [ ] Accessibility audit (keyboard, screen reader, ARIA)
- [ ] Cross-browser testing
- [ ] Error handling and edge cases
- [ ] Documentation
- [ ] Unit and E2E tests

---

## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)
- HAR parser functions
- Filter functions (all property types)
- Sort functions (all columns)
- Timing calculations
- Size/time formatters
- Component rendering tests

### 8.2 Component Tests (React Testing Library)
- Filter toolbar interactions
- Table sorting and filtering
- Row selection
- Context menu actions
- Tab navigation in detail pane
- Keyboard shortcuts

### 8.3 E2E Tests (Playwright)
- HAR file import flow
- Filter and sort operations
- Copy as cURL functionality
- HAR export functionality
- Keyboard navigation
- Theme switching
- Performance tests (large HAR files)

### 8.4 Performance Tests
- Load time with 1,000 requests
- Scroll performance with 10,000 requests
- Filter/sort response time
- Memory usage profiling
- Bundle size analysis

### 8.5 Accessibility Tests
- axe DevTools audits
- Keyboard navigation tests
- Screen reader tests (NVDA, JAWS)
- High contrast mode tests
- Zoom tests (200%, 400%)

---

## 9. Success Metrics

### 9.1 Performance KPIs
- Initial render time: < 100ms (1,000 requests)
- Scroll FPS: > 55fps (10,000 requests)
- Filter response time: < 200ms
- Bundle size: < 500KB (gzipped)
- Memory usage: < 500MB (10,000 requests)

### 9.2 Quality KPIs
- Lighthouse Accessibility Score: 100
- Lighthouse Performance Score: > 90
- Zero critical accessibility issues
- Zero console errors
- 100% TypeScript coverage (no `any` types)

### 9.3 User Experience KPIs
- Pixel-perfect match to Chrome DevTools (visual diff < 5%)
- All keyboard shortcuts functional
- All context menu items functional
- HAR import/export 100% compatible

---

## 10. Open Questions & Risks

### 10.1 Open Questions
1. Should we support real-time network capture or only HAR import?
   - **Recommendation**: Start with HAR import only, add real-time in v2
2. Should we support custom themes beyond light/dark?
   - **Recommendation**: Support light/dark first, add custom themes later
3. Should we implement request blocking UI?
   - **Recommendation**: Yes, but as UI-only (no actual blocking) in v1
4. Should we support HAR 1.3 format?
   - **Recommendation**: No, stick with stable HAR 1.2

### 10.2 Technical Risks
1. **Performance with large datasets**
   - **Mitigation**: Virtual scrolling, web workers, memoization
2. **Monaco Editor bundle size**
   - **Mitigation**: Lazy loading, consider lighter alternatives
3. **Browser compatibility for virtualization**
   - **Mitigation**: Progressive enhancement, fallback for older browsers
4. **HAR file format inconsistencies**
   - **Mitigation**: Robust validation, fallback for missing fields

### 10.3 UX Risks
1. **Information density overwhelming**
   - **Mitigation**: Good defaults, collapsible sections, progressive disclosure
2. **Dark mode contrast issues**
   - **Mitigation**: Use Chrome DevTools' actual color tokens
3. **Keyboard shortcut conflicts**
   - **Mitigation**: Document shortcuts, allow customization

---

## 11. Future Enhancements (Post-MVP)

### Phase 6: Advanced Features
- Real-time network capture (if feasible)
- Network throttling simulation
- Request blocking functionality
- Diff two HAR files
- Annotate HAR files (add notes to requests)
- Shareable URLs with filter state
- HAR file from URL (load from remote)
- Export as PDF report
- Custom columns (user-defined)
- Bookmarked requests

### Phase 7: Integrations
- Chrome extension (capture from real browser)
- Firefox add-on
- Electron app (standalone desktop)
- VS Code extension
- CLI tool for HAR analysis

---

## 12. Resources & References

### 12.1 Official Chrome DevTools Documentation
- [Inspect network activity](https://developer.chrome.com/docs/devtools/network)
- [Network features reference](https://developer.chrome.com/docs/devtools/network/reference)
- [Network panel overview](https://developer.chrome.com/docs/devtools/network/overview)

### 12.2 HAR Format
- [W3C HAR Specification](https://w3c.github.io/web-performance/specs/HAR/Overview.html)
- [HAR 1.2 Spec](http://www.softwareishard.com/blog/har-12-spec/)
- [har-schema GitHub](https://github.com/ahmadnassri/har-schema)
- [har-validator NPM](https://www.npmjs.com/package/har-validator)
- [@types/har-format](https://www.npmjs.com/package/@types/har-format)

### 12.3 Reference Implementations
- [ChromeDevTools/devtools-frontend](https://github.com/ChromeDevTools/devtools-frontend) - Official source code
- [saucelabs/network-viewer](https://github.com/saucelabs/network-viewer) - React network viewer
- [Sakil9051/devtools-clone](https://github.com/Sakil9051/devtools-clone) - Direct DevTools clone

### 12.4 UI Libraries
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [TanStack Table](https://tanstack.com/table/latest) - Data table
- [TanStack Virtual](https://tanstack.com/virtual) - Virtual scrolling
- [react-json-view](https://github.com/uiwjs/react-json-view) - JSON inspector
- [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react) - Code editor

### 12.5 Design Resources
- [Material Design 3](https://m3.material.io/) - Design system
- [DebugBear Waterfall Guide](https://www.debugbear.com/docs/waterfall) - Timing visualization
- [VS Code UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview) - Developer tool UX
- [Firefox DevTools Photon Design](https://firefox-dev.tools/photon/introduction/devtools.html) - DevTools design patterns

---

## Appendix A: Filter Syntax Examples

```
# Basic text search
google

# Regular expression
/.*\.jpg$/

# Domain filter
domain:example.com

# Method filter
method:POST

# Status code filter
status-code:404

# MIME type filter
mime-type:application/json

# Size filter (larger than 100KB)
larger-than:100

# Cookie filter
cookie-name:session

# Response header filter
has-response-header:Location

# Scheme filter
scheme:https

# Negative filter (NOT)
-main.css

# Multiple filters (AND)
domain:api.example.com method:GET

# Invert filter
-domain:example.com
```

---

## Appendix B: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + R` | Toggle recording |
| `Ctrl/Cmd + Shift + F` | Focus filter input |
| `Ctrl/Cmd + F` | Open search |
| `↑ / ↓` | Navigate requests |
| `Enter` | Open request details |
| `Esc` | Close detail pane/search |
| `Tab` | Next tab/section |
| `Shift + Tab` | Previous tab/section |
| `Ctrl/Cmd + C` | Copy selected |
| `Ctrl/Cmd + A` | Select all |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Save as HAR |
| `Ctrl/Cmd + O` | Open HAR file |
| `Ctrl/Cmd + I` | Toggle filter toolbar |
| `Ctrl/Cmd + Shift + C` | Clear browser cache |
| `Ctrl/Cmd + Shift + Delete` | Clear browser cookies |

---

## Appendix C: Status Code Reference

| Code | Message | Color |
|------|---------|-------|
| 200 | OK | Green |
| 201 | Created | Green |
| 204 | No Content | Green |
| 301 | Moved Permanently | Yellow |
| 302 | Found | Yellow |
| 304 | Not Modified | Yellow |
| 307 | Temporary Redirect | Yellow |
| 308 | Permanent Redirect | Yellow |
| 400 | Bad Request | Red |
| 401 | Unauthorized | Red |
| 403 | Forbidden | Red |
| 404 | Not Found | Red |
| 500 | Internal Server Error | Red |
| 502 | Bad Gateway | Red |
| 503 | Service Unavailable | Red |
| 504 | Gateway Timeout | Red |

---

**Document Status**: Ready for review
**Next Steps**: Stakeholder approval, resource allocation, sprint planning

---

*This PRD was created with comprehensive research from Chrome DevTools documentation, HAR format specifications, and modern frontend development best practices.*
