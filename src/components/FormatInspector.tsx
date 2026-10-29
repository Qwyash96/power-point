import React from 'react';
import {
  Type,
  Palette,
  Layers,
  Sparkles,
  Move,
  Trash2,
  Maximize2,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Slide, SlideElement, TransitionType, AnimationType, SlideLayout } from '../types';

interface FormatInspectorProps {
  slide: Slide;
  selectedElement: SlideElement | null;
  onUpdateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  onDeleteElement: (elementId: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const FONT_FAMILIES = [
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Outfit (Modern)', value: 'Outfit, sans-serif' },
  { label: 'Playfair (Editorial Serif)', value: 'Playfair Display, serif' },
  { label: 'DM Sans (Clean)', value: 'DM Sans, sans-serif' },
  { label: 'JetBrains Mono (Code)', value: 'JetBrains Mono, monospace' },
];

const TRANSITIONS: { id: TransitionType; label: string }[] = [
  { id: 'fade', label: 'Fade' },
  { id: 'slide', label: 'Slide' },
  { id: 'push', label: 'Push' },
  { id: 'none', label: 'None (Instant Cut)' },
  { id: 'slide-left', label: 'Push Left' },
  { id: 'slide-right', label: 'Push Right' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'zoom', label: 'Zoom Scale' },
  { id: 'flip', label: '3D Flip' },
];

const ANIMATIONS: { id: AnimationType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'fade-in', label: 'Fade In' },
  { id: 'fly-up', label: 'Fly Up' },
  { id: 'pop', label: 'Pop Scale' },
  { id: 'wipe', label: 'Wipe' },
];

const LAYOUTS: { id: SlideLayout; label: string }[] = [
  { id: 'title', label: 'Title Slide' },
  { id: 'title-content', label: 'Title & Content' },
  { id: 'two-column', label: 'Two Columns' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'kpi', label: 'KPI & Metrics' },
  { id: 'quote', label: 'Quote / Callout' },
  { id: 'blank', label: 'Blank' },
];

export const FormatInspector: React.FC<FormatInspectorProps> = ({
  slide,
  selectedElement,
  onUpdateElement,
  onUpdateSlide,
  onDeleteElement,
  isOpen,
  onToggleOpen,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-300 hover:text-white p-2 rounded-l-md border-l border-t border-b border-slate-700 shadow-xl z-20"
        title="Open Format Inspector"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  const s = selectedElement?.style || {};

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 text-slate-200 select-none z-10 overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedElement ? (
            <>
              <Type className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Format {selectedElement.type}
              </span>
            </>
          ) : (
            <>
              <Palette className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Slide Settings
              </span>
            </>
          )}
        </div>
        <button
          onClick={onToggleOpen}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* ELEMENT SELECTED CONTROLS */}
        {selectedElement ? (
          <>
            {/* Typography Section (for text, shape, code) */}
            {(selectedElement.type === 'text' || selectedElement.type === 'shape') && (
              <div className="space-y-3 pb-4 border-b border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-indigo-400" /> Typography
                </label>

                {/* Font family */}
                <div>
                  <span className="text-slate-400 block mb-1">Font Family</span>
                  <select
                    value={s.fontFamily || 'Plus Jakarta Sans, sans-serif'}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, fontFamily: e.target.value },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-indigo-500"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block mb-1">Size (px)</span>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={s.fontSize || 24}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          style: { ...s, fontSize: parseInt(e.target.value, 10) || 24 },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Weight</span>
                    <select
                      value={s.fontWeight || 'normal'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          style: { ...s, fontWeight: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white outline-none focus:border-indigo-500"
                    >
                      <option value="normal">Regular (400)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="bold">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>

                {/* Text Formatting buttons */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-slate-700">
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        style: {
                          ...s,
                          fontWeight: s.fontWeight === 'bold' ? 'normal' : 'bold',
                        },
                      })
                    }
                    className={`p-1.5 rounded hover:bg-slate-700 ${
                      s.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`}
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        style: {
                          ...s,
                          fontStyle: s.fontStyle === 'italic' ? 'normal' : 'italic',
                        },
                      })
                    }
                    className={`p-1.5 rounded hover:bg-slate-700 ${
                      s.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`}
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        style: {
                          ...s,
                          textDecoration: s.textDecoration === 'underline' ? 'none' : 'underline',
                        },
                      })
                    }
                    className={`p-1.5 rounded hover:bg-slate-700 ${
                      s.textDecoration === 'underline' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`}
                    title="Underline"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-700 mx-1" />
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, textAlign: 'left' },
                      })
                    }
                    className={`p-1.5 rounded hover:bg-slate-700 ${
                      s.textAlign === 'left' || !s.textAlign ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, textAlign: 'center' },
                      })
                    }
                    className={`p-1.5 rounded hover:bg-slate-700 ${
                      s.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, textAlign: 'right' },
                      })
                    }
                    className={`p-1.5 rounded hover:bg-slate-700 ${
                      s.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`}
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text Color */}
                <div>
                  <span className="text-slate-400 block mb-1">Text Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={s.color || '#ffffff'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          style: { ...s, color: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={s.color || '#ffffff'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          style: { ...s, color: e.target.value },
                        })
                      }
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fill & Stroke Styling */}
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Fill & Stroke
              </label>

              {/* Background Color */}
              <div>
                <span className="text-slate-400 block mb-1">Background Fill</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={s.backgroundColor || '#1e293b'}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, backgroundColor: e.target.value },
                      })
                    }
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={s.backgroundColor || ''}
                    placeholder="Transparent / Hex"
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, backgroundColor: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                  />
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, backgroundColor: 'transparent' },
                      })
                    }
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Border Color & Width */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block mb-1">Border Color</span>
                  <input
                    type="color"
                    value={s.borderColor || '#6366f1'}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, borderColor: e.target.value },
                      })
                    }
                    className="w-full h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Border Width</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={s.borderWidth || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, borderWidth: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white outline-none"
                  />
                </div>
              </div>

              {/* Corner Radius & Opacity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block mb-1">Radius (px)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={s.borderRadius || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, borderRadius: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Opacity</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={s.opacity !== undefined ? s.opacity : 1}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        style: { ...s, opacity: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full mt-2 accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Geometry & Arrange */}
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-indigo-400" /> Position & Size (%)
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block mb-1">X Pos (%)</span>
                  <input
                    type="number"
                    step={0.5}
                    value={selectedElement.x}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        x: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Y Pos (%)</span>
                  <input
                    type="number"
                    step={0.5}
                    value={selectedElement.y}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        y: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Width (%)</span>
                  <input
                    type="number"
                    step={0.5}
                    value={selectedElement.width}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        width: parseFloat(e.target.value) || 5,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Height (%)</span>
                  <input
                    type="number"
                    step={0.5}
                    value={selectedElement.height}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        height: parseFloat(e.target.value) || 5,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>

              {/* Layer Z-Index ordering */}
              <div>
                <span className="text-slate-400 block mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Layer Arrange
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        zIndex: (selectedElement.zIndex || 1) + 5,
                      })
                    }
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    <ArrowUp className="w-3 h-3 text-indigo-400" /> Bring to Front
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        zIndex: Math.max(1, (selectedElement.zIndex || 1) - 5),
                      })
                    }
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    <ArrowDown className="w-3 h-3 text-indigo-400" /> Send to Back
                  </button>
                </div>
              </div>
            </div>

            {/* Element Entrance Animation */}
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Entrance Animation
              </label>
              <select
                value={selectedElement.animation?.type || 'none'}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    animation: {
                      ...selectedElement.animation,
                      type: e.target.value as AnimationType,
                      duration: 0.5,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none"
              >
                {ANIMATIONS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Delete element button */}
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Element</span>
            </button>
          </>
        ) : (
          /* SLIDE-LEVEL CONTROLS (WHEN NO ELEMENT SELECTED) */
          <>
            {/* Slide Title */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Slide Title
              </label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => onUpdateSlide({ title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Slide Layout */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Layout Preset
              </label>
              <select
                value={slide.layout}
                onChange={(e) => onUpdateSlide({ layout: e.target.value as SlideLayout })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none"
              >
                {LAYOUTS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slide Background Color / Gradient */}
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Slide Background
              </label>

              <div>
                <span className="text-slate-400 block mb-1">Solid Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.backgroundColor || '#090d16'}
                    onChange={(e) =>
                      onUpdateSlide({
                        backgroundColor: e.target.value,
                        backgroundGradient: 'none',
                      })
                    }
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={slide.backgroundColor || '#090d16'}
                    onChange={(e) =>
                      onUpdateSlide({
                        backgroundColor: e.target.value,
                        backgroundGradient: 'none',
                      })
                    }
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Gradient presets */}
              <div>
                <span className="text-slate-400 block mb-1.5">Gradient Presets</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateSlide({
                        backgroundGradient:
                          'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
                      })
                    }
                    className="h-7 rounded border border-slate-700 hover:border-indigo-400"
                    style={{
                      background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
                    }}
                    title="Deep Midnight"
                  />
                  <button
                    onClick={() =>
                      onUpdateSlide({
                        backgroundGradient:
                          'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
                      })
                    }
                    className="h-7 rounded border border-slate-700 hover:border-indigo-400"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
                    }}
                    title="Oceanic Tech"
                  />
                  <button
                    onClick={() =>
                      onUpdateSlide({
                        backgroundGradient:
                          'linear-gradient(135deg, #110726 0%, #4c1d42 100%)',
                      })
                    }
                    className="h-7 rounded border border-slate-700 hover:border-indigo-400"
                    style={{
                      background: 'linear-gradient(135deg, #110726 0%, #4c1d42 100%)',
                    }}
                    title="Sunset Glow"
                  />
                  <button
                    onClick={() =>
                      onUpdateSlide({
                        backgroundGradient:
                          'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
                        backgroundColor: '#ffffff',
                      })
                    }
                    className="h-7 rounded border border-slate-700 hover:border-indigo-400"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
                    }}
                    title="Crisp White"
                  />
                  <button
                    onClick={() =>
                      onUpdateSlide({
                        backgroundGradient:
                          'linear-gradient(180deg, #fdfbf7 0%, #f4efe6 100%)',
                        backgroundColor: '#fdfbf7',
                      })
                    }
                    className="h-7 rounded border border-slate-700 hover:border-indigo-400"
                    style={{
                      background: 'linear-gradient(180deg, #fdfbf7 0%, #f4efe6 100%)',
                    }}
                    title="Academic Cream"
                  />
                  <button
                    onClick={() =>
                      onUpdateSlide({
                        backgroundGradient: 'none',
                        backgroundColor: '#000000',
                      })
                    }
                    className="h-7 rounded border border-slate-700 hover:border-indigo-400 bg-black"
                    title="True Black"
                  />
                </div>
              </div>
            </div>

            {/* Slide Transition */}
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Slide Transition
              </label>

              <select
                value={slide.transition || 'fade'}
                onChange={(e) =>
                  onUpdateSlide({ transition: e.target.value as TransitionType })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white outline-none"
              >
                {TRANSITIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Duration</span>
                  <span className="font-mono text-indigo-400">
                    {slide.transitionDuration || 0.5}s
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.0}
                  step={0.1}
                  value={slide.transitionDuration || 0.5}
                  onChange={(e) =>
                    onUpdateSlide({ transitionDuration: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Speaker Notes */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Speaker Notes
              </label>
              <p className="text-[11px] text-slate-400">
                Notes are displayed privately in Presenter View during your talk.
              </p>
              <textarea
                rows={6}
                value={slide.notes || ''}
                placeholder="Enter talking points, cues, and research citations for this slide..."
                onChange={(e) => onUpdateSlide({ notes: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-slate-200 outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
