# SlideCraft Studio — Full-Featured Free PowerPoint Presentation Suite

SlideCraft Studio is a comprehensive, production-grade web alternative to Microsoft PowerPoint that brings professional presentation editing, rich shape and media tools, transition animations, speaker presenter view, and versatile export capabilities into the browser completely free with zero feature paywalls.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification and are locked into the build plan:
> - **Core Presentation Experience**: Full PowerPoint studio layout featuring an authentic ribbon toolbar (Home, Insert, Draw, Design, Transitions, Animations, Slide Show, Review, View), left slide thumbnail reel, full WYSIWYG canvas with multi-selection/resizing/rotation, and a dedicated dual-screen-capable Presenter Mode.
> - **Preloaded Decks & Themes**: Multi-purpose template suite including **Tech Keynote** (dark gradient modern tech launch), **Business Pitch Deck** (clean venture & investor metrics), and **Academic Seminar** (structured research and literature review).
> - **Presentation & Export Capabilities**: Interactive full-screen slideshow with virtual laser pointer, slide spotlight, real-time timer, speaker notes pane, clean browser print-to-PDF export, self-contained interactive HTML presentation export, and JSON project save/load.
> - **AI Presentation Copilot**: Free integrated AI slide generator and content enhancer powered by server-side Gemini 3.8 Flash to generate slide decks from topic prompts or rewrite text into high-impact bullet points.

---

## 1. Overview & Core Concept

- **What It Does**: A complete desktop-class slide presentation suite engineered for modern browsers. Users can craft multi-slide decks with rich text formatting, geometric shapes, icons, tables, charts, image uploads, alignment guides, and layer ordering. Presenters can rehearse with notes and timers, deliver with laser pointer controls, and export directly to PDF or standalone web decks.
- **Target Audience**: Professionals, educators, founders, and students seeking Microsoft PowerPoint capabilities without software licensing fees, subscription walls, or complex installations.
- **Key Value**: 100% unlocked "Pro" presentation capabilities — unlimited slides, custom branding, animation transitions, full-screen speaker view, and instant export.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Slide Authoring & Layout**:
   - The user selects or creates slides from the left thumbnail rail (drag-to-reorder, duplicate, delete, hide slide, add new slide with 8 preset layouts: Title, Title & Content, Two Content, Comparison, Quote, Big Number/KPI, Blank).
   - Canvas elements (Text boxes, Shapes, Images, Tables, Charts, Code snippets, Media) can be selected, dragged with snap-to-grid/center alignment lines, resized with 8-point handles, rotated, arranged in z-layers (Bring to Front, Send to Back), and grouped.
2. **Ribbon & Formatting Controls**:
   - Familiar tabbed ribbon toolbar (`Home`, `Insert`, `Draw / Annotate`, `Design / Themes`, `Transitions`, `Animations`, `Slide Show`, `AI Copilot`).
   - Rich typography: Font family, size, weight, letter spacing, alignment, bulleted lists, numbered lists, text shadows, and highlight colors.
   - Shape tools: Rectangles, rounded boxes, circles, arrows, callout bubbles, star badges, flowcharts, customizable fill and borders.
   - Design tab: One-click theme switcher, background gradients, slide aspect ratio (16:9 widescreen or 4:3 standard).
3. **Presenter & Rehearsal Mode**:
   - Dedicated full-screen Presenter View displaying: Current slide preview, Next slide preview, Live presentation stopwatch & clock, Resizable Speaker Notes editor, Virtual laser pointer (with red glowing cursor trail), Slide pen highlighter tool, and Blackout/Whiteout screen toggles (`B` and `W` hotkeys).
4. **Slide Transitions & Element Animations**:
   - Transitions between slides: None, Fade, Slide Push (Left/Right/Up/Down), Zoom Scale, Flip, and Wipe.
   - Element entry animations: Fade in, Fly in from bottom, Pop scale, and Staggered list reveals.
5. **Export & Sharing**:
   - Export to PDF (formatted CSS `@media print` with exact 16:9 pagination).
   - Standalone HTML presentation download (runs offline in any browser).
   - Save / Load project as `.slidecraft` JSON file.
   - Instant deck templates gallery to start with pre-designed slides.

### Visual Identity & Theme

- **Aesthetic Direction**: Clean, modern enterprise productivity aesthetic inspired by Microsoft 365 and Apple Keynote, built with crisp typographic discipline and subtle tactile slate surfaces.
- **Color Palette**:
  - Dominant Canvas: Crisp neutral workspace `#0f172a` (dark presenter background) and `#f8fafc` / `#ffffff` (light canvas backdrop).
  - Ribbon & Shell: Slate surface `#ffffff` (border `#e2e8f0`) with dark mode support (`#0f172a` / `#1e293b`).
  - Brand Accent: Vivid PowerPoint Crimson & Indigo blend (`#ea580c` to `#6366f1` accents for active ribbon tabs, primary triggers, and presenter highlights).
  - Canvas Grid & Guides: Subtle hairline alignment guides (`#3b82f6` snap indicators).
- **Typography & Scale**:
  - Primary UI & Display: `Plus Jakarta Sans` for crisp UI controls and navigation.
  - Slide Content Fonts: Curated palette (`Plus Jakarta Sans`, `Playfair Display`, `Outfit`, `DM Sans`, `JetBrains Mono`).
  - Numbers & Timer: `tabular-nums font-mono` for presentation countdown and duration stopwatch.
- **Component Styling & Layout**:
  - Top Ribbon: Compact 3-zone contract with Deck Title, tab bar (`Home`, `Insert`, `Design`, `Transitions`, `Slide Show`, `AI`), and primary action button (`Present F5`).
  - Canvas Workspace: Centered slide stage with dynamic zoom controls (`50%`, `75%`, `100%`, `Fit to Screen`), ruler indicators, and alignment guides.
  - Bottom Status Bar: Current slide count indicator, speaker notes drawer toggle, zoom slider, and playback controls.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native HTML5 Canvas + SVG + DOM Hybrid Rendering**:
  - *Chosen Approach*: Render slide elements as interactive DOM nodes positioned on a scaled 1920x1080 virtual canvas frame.
  - *Why*: Enables rich HTML text formatting, true text selection, standard input cursors, native accessibility, and clean CSS-based transitions while remaining performant and lightweight.
  - *Alternatives Considered*: Pure HTML5 `<canvas>` (blurry text scaling and poor text editing UX) or heavy external libraries like Fabric.js (adds overhead and prevents easy custom styling).
- **Decision 2: Local Storage & Project File Persistence with Zero Cloud Lock-in**:
  - *Chosen Approach*: Autosave deck changes to browser `localStorage` with full JSON import/export and bundled offline starter templates.
  - *Why*: Instant zero-latency loading, complete privacy, works completely offline, and doesn't require user login or cloud subscriptions.
- **Decision 3: Server-Side Gemini 3.8 Flash for AI Slide Generation & Formatting**:
  - *Chosen Approach*: Secure server-side Express endpoint (`/api/gemini/generate-slides` and `/api/gemini/enhance-text`) with typed JSON schemas using `@google/genai`.
  - *Why*: Keeps API keys protected on the server, adheres to Google AI Studio guidelines, and provides instant slide outline and content generation.

---

## 4. Technical Architecture & Data Strategy

### System Layout & Component Hierarchy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            SlideCraft Top Ribbon                             │
│  [Logo / Deck Title]   [Home | Insert | Design | Transitions | AI]  [Present]│
├───────────────────┬──────────────────────────────────────┬───────────────────┤
│   Thumbnails Rail │        WYSIWYG Slide Stage           │ Format Inspector  │
│                   │                                      │                   │
│ ┌───────────────┐ │   ┌──────────────────────────────┐   │ ┌───────────────┐ │
│ │ Slide 1       │ │   │  1920 x 1080 Virtual Canvas  │   │ │ Text & Fill   │ │
│ └───────────────┘ │   │                              │   │ │ Border, Shadow│ │
│ ┌───────────────┐ │   │  • Text Boxes (Rich WYSIWYG) │   │ │ Align, Arrange│ │
│ │ Slide 2       │ │   │  • Geometric Shapes & Icons  │   │ │ Animations    │ │
│ └───────────────┘ │   │  • Tables & Stat Cards       │   │ └───────────────┘ │
│ ┌───────────────┐ │   │  • Images & Media            │   │                   │
│ │ Slide 3       │ │   │  • Snap Guides & Selection   │   │                   │
│ └───────────────┘ │   └──────────────────────────────┘   │                   │
│                   │                                      │                   │
├───────────────────┴──────────────────────────────────────┴───────────────────┤
│ Bottom Bar: Slide Counter | Speaker Notes Toggle | Zoom Controls (Fit / 100%)│
└──────────────────────────────────────────────────────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [ Fullscreen Presenter Mode ]     [ Export Engine ]
       • Dual Current & Next Slide       • Browser Print-to-PDF
       • Laser Pointer & Pen Drawing     • Self-Contained HTML
       • Timer, Notes & Blackout Mode    • JSON Project Backup
```

### Core Slide Data Model

```typescript
interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'table' | 'chart' | 'code';
  x: number; // Percentage or 1920-based canvas coord
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  content?: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    opacity?: number;
    shadow?: boolean;
    shapeType?: 'rectangle' | 'rounded' | 'circle' | 'triangle' | 'arrow' | 'star';
  };
  animation?: {
    type: 'none' | 'fade-in' | 'slide-up' | 'pop' | 'wipe';
    order?: number;
  };
}

interface Slide {
  id: string;
  title: string;
  layout: 'title' | 'title-content' | 'two-column' | 'comparison' | 'kpi' | 'quote' | 'blank';
  elements: SlideElement[];
  notes: string;
  transition: 'none' | 'fade' | 'slide-left' | 'slide-up' | 'zoom' | 'flip';
  backgroundColor?: string;
  backgroundImage?: string;
}

interface PresentationDeck {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  theme: 'tech-keynote' | 'business-pitch' | 'academic-seminar' | 'minimal-light' | 'midnight-dark';
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
}
```

### Server API Routes (`server.ts`)

- `POST /api/ai/generate-deck`: Generates a structured multi-slide deck based on user topic, audience, and slide count using `gemini-3.8-flash`.
- `POST /api/ai/enhance-content`: Rewrites or polishes slide text (summarize, expand, convert to bullet points).

---

## 5. Verification & Testing Plan

1. **Compilation & Linting**: Run `compile_applet` and `lint_applet` to verify TypeScript clean build with zero errors.
2. **Interactive Ribbon Handlers**: Verify all ribbon tabs, insertion buttons (Text, Shapes, Images, Tables), font styling, color pickers, and layout presets update the canvas in real-time.
3. **Canvas Interactions**: Test selection, multi-element manipulation, dragging, resizing handles, alignment snapping lines, and z-index ordering.
4. **Presenter View**: Test entering slideshow (`F5` or Present button), laser pointer cursor trail, speaker notes sync, slide timer, and exit keys (`Esc`).
5. **Template Switcher**: Verify instant loading of the preloaded multi-purpose template decks (Tech Keynote, Business Pitch Deck, Academic Seminar).
6. **Export Verification**: Verify PDF print layout formatting, HTML presentation download, and JSON project export/import.
