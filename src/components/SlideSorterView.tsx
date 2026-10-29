import React from 'react';
import { Plus, Copy, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Slide } from '../types';

interface SlideSorterViewProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onAddSlide: () => void;
  onClose: () => void;
}

export const SlideSorterView: React.FC<SlideSorterViewProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onAddSlide,
  onClose,
}) => {
  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto select-none flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Editor</span>
          </button>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Slide Sorter Overview ({slides.length} Slides)
          </h2>
        </div>

        <button
          onClick={onAddSlide}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Grid of Slide Thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {slides.map((slide, idx) => {
          const isActive = slide.id === activeSlideId;
          const isHidden = !!slide.hidden;

          return (
            <div
              key={slide.id}
              onClick={() => {
                onSelectSlide(slide.id);
                onClose();
              }}
              className={`group flex flex-col rounded-xl overflow-hidden border transition-all cursor-pointer bg-slate-900 ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-xl'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
              } ${isHidden ? 'opacity-50' : ''}`}
            >
              {/* Slide Thumbnail Preview */}
              <div
                className="w-full aspect-video relative overflow-hidden p-3"
                style={{
                  background:
                    slide.backgroundGradient && slide.backgroundGradient !== 'none'
                      ? slide.backgroundGradient
                      : slide.backgroundColor || '#090d16',
                }}
              >
                {/* Mini wireframe */}
                {(slide.elements || []).slice(0, 5).map((el) => (
                  <div
                    key={el.id}
                    className="absolute rounded-[2px]"
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                      height: `${el.height}%`,
                      backgroundColor:
                        el.type === 'text'
                          ? el.style.color || 'rgba(255,255,255,0.7)'
                          : el.style.backgroundColor || 'rgba(99,102,241,0.5)',
                      opacity: 0.5,
                    }}
                  />
                ))}

                {/* Transition Badge */}
                {slide.transition && slide.transition !== 'none' && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-indigo-300">
                    {slide.transition}
                  </div>
                )}
              </div>

              {/* Card Footer with slide info & actions */}
              <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono font-bold text-slate-500">
                    {idx + 1}.
                  </span>
                  <span className="font-medium text-slate-200 truncate">
                    {slide.title || `Slide ${idx + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(slide.id);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                    title="Duplicate Slide"
                  >
                    <Copy className="w-3.5 h-3.5" />
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
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
