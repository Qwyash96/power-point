export type AspectRatio = '16:9' | '4:3';

export type ShapeType =
  | 'rectangle'
  | 'rounded'
  | 'circle'
  | 'triangle'
  | 'arrow-right'
  | 'star'
  | 'callout'
  | 'diamond'
  | 'line';

export type ElementType = 'text' | 'shape' | 'image' | 'table' | 'kpi' | 'code';

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide'
  | 'push'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'zoom'
  | 'flip';

export type AnimationType = 'none' | 'fade-in' | 'fly-up' | 'pop' | 'wipe';

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  opacity?: number;
  shadow?: boolean;
  shapeType?: ShapeType;
  padding?: number;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface KPIData {
  value: string;
  label: string;
  subtext?: string;
  trend?: string;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
  rotation?: number; // degrees
  zIndex: number;
  content: string; // text content, image URL, code string, or serialized data
  tableData?: TableData;
  kpiData?: KPIData;
  style: ElementStyle;
  animation?: {
    type: AnimationType;
    duration?: number; // seconds
    delay?: number; // seconds
  };
}

export type SlideLayout =
  | 'title'
  | 'title-content'
  | 'two-column'
  | 'comparison'
  | 'kpi'
  | 'quote'
  | 'image-focus'
  | 'blank';

export interface Slide {
  id: string;
  title: string;
  layout: SlideLayout;
  elements: SlideElement[];
  notes: string;
  transition: TransitionType;
  transitionDuration?: number; // seconds
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  hidden?: boolean;
}

export type ThemeId =
  | 'tech-keynote'
  | 'business-pitch'
  | 'academic-seminar'
  | 'minimal-light'
  | 'sunset-gradient';

export interface DeckTheme {
  id: ThemeId;
  name: string;
  description: string;
  background: string;
  gradient?: string;
  fontFamily: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  cardBg: string;
}

export interface PresentationDeck {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  theme: ThemeId;
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
}

export type RibbonTab =
  | 'home'
  | 'insert'
  | 'design'
  | 'transitions'
  | 'animations'
  | 'slideshow'
  | 'ai';

export type ViewMode = 'normal' | 'presenter' | 'slideshow' | 'sorter';
