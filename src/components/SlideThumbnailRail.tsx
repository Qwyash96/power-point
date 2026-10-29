import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutTemplate,
} from 'lucide-react';
import { Slide, SlideLayout } from '../types';

interface SlideThumbnailRailProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onMoveSlide: (slideId: string, direction: 'up' | 'down') => void;
  onToggleHideSlide: (slideId: string) => void;
}

const LAYOUT_OPTIONS: { id: SlideLayout; label: string }[] = [
  { id: 'title', label: 'Title Slide' },
  { id: 'title-content', label: 'Title & Content' },
  { id: 'two-column', label: 'Two Columns' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'kpi', label: 'KPI & Metrics' },
  { id: 'quote', label: 'Quote / Callout' },
  { id: 'blank', label: 'Blank' },
];

export const SlideThumbnailRail: React.FC<SlideThumbnailRailProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  onToggleHideSlide,
}) => {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none z-10">
      {/* Top action header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between relative">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Slides ({slides.length})
        </span>
        <div className="relative">
          <button
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-sm transition-colors cursor-pointer"
            title="Add New Slide"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Slide</span>
          </button>

          {showLayoutMenu && (
            <div
              className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-1 z-50 text-xs text-slate-200"
              onMouseLeave={() => setShowLayoutMenu(false)}
            >
              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                Select Layout
              </div>
              {LAYOUT_OPTIONS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => {
                    onAddSlide(layout.id);
                    setShowLayoutMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-indigo-600/30 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
                  {layout.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide Thumbnails Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          const isHidden = !!slide.hidden;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(slide.id)}
              className={`group relative rounded-lg p-2 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              } ${isHidden ? 'opacity-50' : ''}`}
            >
              {/* Slide Number & Title Header */}
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                <span className="font-mono font-bold text-slate-500 group-hover:text-slate-300">
                  {index + 1}
                </span>
                <span className="truncate max-w-[120px] font-medium text-slate-300">
                  {slide.title || `Slide ${index + 1}`}
                </span>
                {slide.transition && slide.transition !== 'none' && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono">
                    {slide.transition}
                  </span>
                )}
              </div>

              {/* 16:9 Thumbnail miniature preview */}
              <div
                className="w-full aspect-video rounded overflow-hidden relative shadow-inner border border-slate-700/50 transition-transform group-hover:scale-[1.02]"
                style={{
                  background:
                    slide.backgroundGradient && slide.backgroundGradient !== 'none'
                      ? slide.backgroundGradient
                      : slide.backgroundColor || '#0f172a',
                }}
              >
                {/* Simplified wireframe representation */}
                <div className="w-full h-full p-2 relative pointer-events-none">
                  {(slide.elements || []).slice(0, 5).map((el) => (
                    <div
                      key={el.id}
                      className="absolute rounded-[2px]"
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${Math.min(el.width, 90)}%`,
                        height: `${Math.min(el.height, 60)}%`,
                        backgroundColor:
                          el.type === 'text'
                            ? el.style.color || 'rgba(255,255,255,0.7)'
                            : el.style.backgroundColor || 'rgba(99,102,241,0.5)',
                        opacity: el.type === 'text' ? 0.6 : 0.4,
                      }}
                    />
                  ))}
                </div>

                {isHidden && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Hover quick action overlay buttons */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-900/95 border border-slate-700 rounded p-0.5 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSlide(slide.id, 'up');
                  }}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                  title="Move Up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSlide(slide.id, 'down');
                  }}
                  disabled={index === slides.length - 1}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                  title="Move Down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHideSlide(slide.id);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title={isHidden ? 'Unhide Slide' : 'Hide Slide'}
                >
                  {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(slide.id);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Duplicate Slide (Ctrl+D)"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSlide(slide.id);
                  }}
                  disabled={slides.length <= 1}
                  className="p-1 text-slate-400 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-slate-800"
                  title="Delete Slide"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
