import React, { useState } from 'react';
import {
  FileText,
  Play,
  RotateCcw,
  RotateCw,
  FolderOpen,
  Download,
  Printer,
  Sparkles,
  Plus,
  Copy,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Type,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Star,
  Table as TableIcon,
  Image as ImageIcon,
  Code,
  LayoutGrid,
  ChevronDown,
  MonitorPlay,
  Layers,
  ArrowUp,
  ArrowDown,
  Palette,
  Maximize2,
  Sliders,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { RibbonTab, Slide, SlideElement, SlideLayout, ShapeType, PresentationDeck } from '../types';
import { DECK_THEMES } from '../data/templates';

interface RibbonProps {
  deck: PresentationDeck;
  activeTab: RibbonTab;
  onSelectTab: (tab: RibbonTab) => void;
  activeSlide: Slide;
  selectedElement: SlideElement | null;
  onUpdateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onAddElement: (type: 'text' | 'shape' | 'image' | 'table' | 'kpi' | 'code', extraProps?: any) => void;
  onDeleteElement: (elementId: string) => void;
  onOpenTemplates: () => void;
  onOpenAiAssistant: () => void;
  onStartSlideshow: (fromBeginning: boolean, isPresenter: boolean) => void;
  onExportHtml: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onPrintPdf: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onUpdateDeckTitle: (title: string) => void;
  onSelectTheme: (themeId: any) => void;
  onToggleViewMode: () => void;
  viewMode: 'normal' | 'sorter';
}

const QUICK_SHAPES: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
  { type: 'rectangle', icon: <Square className="w-3.5 h-3.5" />, label: 'Rectangle' },
  { type: 'rounded', icon: <Square className="w-3.5 h-3.5 rounded" />, label: 'Rounded Box' },
  { type: 'circle', icon: <Circle className="w-3.5 h-3.5" />, label: 'Circle' },
  { type: 'triangle', icon: <Triangle className="w-3.5 h-3.5" />, label: 'Triangle' },
  { type: 'arrow-right', icon: <ArrowRight className="w-3.5 h-3.5" />, label: 'Arrow' },
  { type: 'star', icon: <Star className="w-3.5 h-3.5" />, label: 'Star' },
];

export const Ribbon: React.FC<RibbonProps> = ({
  deck,
  activeTab,
  onSelectTab,
  activeSlide,
  selectedElement,
  onUpdateElement,
  onUpdateSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onAddElement,
  onDeleteElement,
  onOpenTemplates,
  onOpenAiAssistant,
  onStartSlideshow,
  onExportHtml,
  onExportJson,
  onImportJson,
  onPrintPdf,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUpdateDeckTitle,
  onSelectTheme,
  onToggleViewMode,
  viewMode,
}) => {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showPresentMenu, setShowPresentMenu] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const s = selectedElement?.style || {};

  const handleInsertTable = () => {
    const headers = Array.from({ length: tableCols }, (_, i) => `Header ${i + 1}`);
    const rows = Array.from({ length: tableRows }, (_, r) =>
      Array.from({ length: tableCols }, (_, c) => `Cell ${r + 1},${c + 1}`)
    );
    onAddElement('table', {
      tableData: { headers, rows },
      width: 70,
      height: 35,
    });
    setShowTablePicker(false);
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          onAddElement('image', {
            content: re.target?.result as string,
            width: 50,
            height: 45,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleJsonFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      setShowFileMenu(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 flex flex-col select-none shrink-0 z-20">
      {/* 1. TOP HEADER APP BAR */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950">
        {/* Left: Brand & File dropdown & Undo/Redo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold tracking-tight transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* File Menu Dropdown */}
            {showFileMenu && (
              <div
                className="absolute top-8 left-0 w-60 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 z-50 text-xs text-slate-200"
                onMouseLeave={() => setShowFileMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Deck Management
                </div>
                <button
                  onClick={() => {
                    onOpenTemplates();
                    setShowFileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Templates Gallery</span>
                </button>
                <label className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Open .slidecraft file</span>
                  <input
                    type="file"
                    accept=".slidecraft,.json"
                    onChange={handleJsonFileInput}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    onExportJson();
                    setShowFileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Save Project (.slidecraft)</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Export & Print
                </div>
                <button
                  onClick={() => {
                    onExportHtml();
                    setShowFileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2 text-indigo-300 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export Standalone HTML</span>
                </button>
                <button
                  onClick={() => {
                    onPrintPdf();
                    setShowFileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Undo / Redo */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Presentation Title Editor */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <input
              type="text"
              value={deck.title}
              onChange={(e) => onUpdateDeckTitle(e.target.value)}
              className="bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent focus:border-slate-700 rounded px-2 py-0.5 text-xs font-semibold text-slate-200 outline-none w-64 truncate"
              title="Click to rename presentation"
            />
          </div>
        </div>

        {/* Right: Primary Present Action & View Toggles */}
        <div className="flex items-center gap-2">
          {/* AI Copilot shortcut button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          {/* Sorter Mode Toggle */}
          <button
            onClick={onToggleViewMode}
            className={`p-1.5 rounded text-xs border ${
              viewMode === 'sorter'
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                : 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Slide Sorter View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Primary Present button with split dropdown */}
          <div className="relative flex items-center">
            <button
              onClick={() => onStartSlideshow(false, true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-l text-xs font-bold shadow transition-colors cursor-pointer"
              title="Start Presenter View"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Present</span>
            </button>
            <button
              onClick={() => setShowPresentMenu(!showPresentMenu)}
              className="px-1.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-r text-xs border-l border-emerald-800 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            {showPresentMenu && (
              <div
                className="absolute top-8 right-0 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 z-50 text-xs text-slate-200"
                onMouseLeave={() => setShowPresentMenu(false)}
              >
                <button
                  onClick={() => {
                    onStartSlideshow(true, true);
                    setShowPresentMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
                >
                  <MonitorPlay className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Presenter View (F5)</div>
                    <div className="text-[10px] text-slate-400">With notes, timer & laser pointer</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onStartSlideshow(false, false);
                    setShowPresentMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-white">Audience Slideshow</div>
                    <div className="text-[10px] text-slate-400">Clean fullscreen deck presentation</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. RIBBON TAB NAVIGATION BAR */}
      <div className="flex items-center px-4 bg-slate-900 border-b border-slate-800 text-xs font-semibold">
        {(['home', 'insert', 'design', 'transitions', 'animations', 'slideshow', 'ai'] as RibbonTab[]).map(
          (tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`px-4 py-2 capitalize transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab === 'slideshow' ? 'Slide Show' : tab === 'ai' ? 'AI Copilot' : tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                )}
              </button>
            );
          }
        )}
      </div>

      {/* 3. RIBBON TOOLBAR STRIP */}
      <div className="h-24 px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs bg-slate-900/90">
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <>
            {/* Slides Group */}
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              <button
                onClick={() => onAddSlide('title-content')}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Add New Slide"
              >
                <Plus className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] mt-1">New Slide</span>
              </button>
              <button
                onClick={() => onDuplicateSlide(activeSlide.id)}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Duplicate Slide (Ctrl+D)"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] mt-1">Duplicate</span>
              </button>
              <button
                onClick={() => onDeleteSlide(activeSlide.id)}
                disabled={deck.slides.length <= 1}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400 disabled:opacity-30"
                title="Delete Slide"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] mt-1">Delete</span>
              </button>
            </div>

            {/* Font Group */}
            <div className="flex flex-col gap-1 border-r border-slate-800 pr-3">
              <div className="flex items-center gap-1.5">
                <select
                  value={s.fontFamily || 'Plus Jakarta Sans, sans-serif'}
                  onChange={(e) =>
                    selectedElement &&
                    onUpdateElement(selectedElement.id, {
                      style: { ...s, fontFamily: e.target.value },
                    })
                  }
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white outline-none w-36"
                >
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
                  <option value="Outfit, sans-serif">Outfit</option>
                  <option value="Playfair Display, serif">Playfair Display</option>
                  <option value="DM Sans, sans-serif">DM Sans</option>
                  <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                </select>

                <input
                  type="number"
                  min={10}
                  max={120}
                  value={s.fontSize || 24}
                  onChange={(e) =>
                    selectedElement &&
                    onUpdateElement(selectedElement.id, {
                      style: { ...s, fontSize: parseInt(e.target.value, 10) || 24 },
                    })
                  }
                  className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs text-white outline-none"
                />
              </div>

              {/* Bold, Italic, Underline, Colors */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    selectedElement &&
                    onUpdateElement(selectedElement.id, {
                      style: {
                        ...s,
                        fontWeight: s.fontWeight === 'bold' ? 'normal' : 'bold',
                      },
                    })
                  }
                  className={`p-1 rounded hover:bg-slate-800 ${
                    s.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    selectedElement &&
                    onUpdateElement(selectedElement.id, {
                      style: {
                        ...s,
                        fontStyle: s.fontStyle === 'italic' ? 'normal' : 'italic',
                      },
                    })
                  }
                  className={`p-1 rounded hover:bg-slate-800 ${
                    s.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    selectedElement &&
                    onUpdateElement(selectedElement.id, {
                      style: {
                        ...s,
                        textDecoration: s.textDecoration === 'underline' ? 'none' : 'underline',
                      },
                    })
                  }
                  className={`p-1 rounded hover:bg-slate-800 ${
                    s.textDecoration === 'underline' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1" />

                {/* Text Color */}
                <input
                  type="color"
                  value={s.color || '#ffffff'}
                  onChange={(e) =>
                    selectedElement &&
                    onUpdateElement(selectedElement.id, {
                      style: { ...s, color: e.target.value },
                    })
                  }
                  className="w-5 h-5 rounded border border-slate-700 cursor-pointer bg-transparent"
                  title="Text Color"
                />
              </div>
            </div>

            {/* Paragraph Alignment Group */}
            <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
              <button
                onClick={() =>
                  selectedElement &&
                  onUpdateElement(selectedElement.id, {
                    style: { ...s, textAlign: 'left' },
                  })
                }
                className={`p-1.5 rounded hover:bg-slate-800 ${
                  s.textAlign === 'left' || !s.textAlign ? 'bg-indigo-600 text-white' : 'text-slate-300'
                }`}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  selectedElement &&
                  onUpdateElement(selectedElement.id, {
                    style: { ...s, textAlign: 'center' },
                  })
                }
                className={`p-1.5 rounded hover:bg-slate-800 ${
                  s.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                }`}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  selectedElement &&
                  onUpdateElement(selectedElement.id, {
                    style: { ...s, textAlign: 'right' },
                  })
                }
                className={`p-1.5 rounded hover:bg-slate-800 ${
                  s.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-300'
                }`}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Shapes Strip */}
            <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">
                Insert:
              </span>
              <button
                onClick={() => onAddElement('text')}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-1"
                title="Insert Text Box"
              >
                <Type className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px]">Text</span>
              </button>
              {QUICK_SHAPES.slice(0, 4).map((qs) => (
                <button
                  key={qs.type}
                  onClick={() =>
                    onAddElement('shape', {
                      style: {
                        shapeType: qs.type,
                        backgroundColor: '#6366f1',
                        borderRadius: qs.type === 'rounded' ? 12 : 0,
                      },
                    })
                  }
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
                  title={`Insert ${qs.label}`}
                >
                  {qs.icon}
                </button>
              ))}
            </div>

            {/* Arrange & Layering */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  selectedElement &&
                  onUpdateElement(selectedElement.id, {
                    zIndex: (selectedElement.zIndex || 1) + 1,
                  })
                }
                className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                title="Bring Forward"
              >
                <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Forward</span>
              </button>
              <button
                onClick={() =>
                  selectedElement &&
                  onUpdateElement(selectedElement.id, {
                    zIndex: Math.max(1, (selectedElement.zIndex || 1) - 1),
                  })
                }
                className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                title="Send Backward"
              >
                <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Backward</span>
              </button>
            </div>
          </>
        )}

        {/* TAB: INSERT */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAddElement('text')}
              className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <Type className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] mt-1">Text Box</span>
            </button>

            {/* Shapes gallery */}
            <div className="flex items-center gap-1 bg-slate-800/60 p-1.5 rounded border border-slate-700/60">
              {QUICK_SHAPES.map((qs) => (
                <button
                  key={qs.type}
                  onClick={() =>
                    onAddElement('shape', {
                      style: {
                        shapeType: qs.type,
                        backgroundColor: '#6366f1',
                        borderRadius: qs.type === 'rounded' ? 12 : 0,
                      },
                    })
                  }
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-200"
                  title={qs.label}
                >
                  {qs.icon}
                </button>
              ))}
            </div>

            {/* Table picker */}
            <div className="relative">
              <button
                onClick={() => setShowTablePicker(!showTablePicker)}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                <TableIcon className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] mt-1">Table</span>
              </button>

              {showTablePicker && (
                <div
                  className="absolute top-12 left-0 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-3 z-50 text-xs text-slate-200"
                  onMouseLeave={() => setShowTablePicker(false)}
                >
                  <div className="font-bold text-[11px] mb-2 text-indigo-400">Insert Table</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Rows:</span>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={tableRows}
                        onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 1)}
                        className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Columns:</span>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={tableCols}
                        onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 1)}
                        className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white"
                      />
                    </div>
                    <button
                      onClick={handleInsertTable}
                      className="w-full mt-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold cursor-pointer"
                    >
                      Create Table
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <button
              onClick={handleInsertImage}
              className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] mt-1">Image</span>
            </button>

            {/* KPI Metric Card */}
            <button
              onClick={() =>
                onAddElement('kpi', {
                  width: 30,
                  height: 32,
                  kpiData: {
                    value: '$4.2M',
                    label: 'Net Metric Volume',
                    subtext: 'Demonstrating rapid growth',
                    trend: '+45% YoY',
                  },
                  style: {
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                  },
                })
              }
              className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] mt-1">KPI Card</span>
            </button>

            {/* Code Block */}
            <button
              onClick={() =>
                onAddElement('code', {
                  width: 45,
                  height: 35,
                  content: `// Sample Code Block\nfunction calculateMetrics(records) {\n  return records.reduce((acc, r) => acc + r.value, 0);\n}`,
                })
              }
              className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <Code className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] mt-1">Code</span>
            </button>
          </div>
        )}

        {/* TAB: DESIGN */}
        {activeTab === 'design' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Themes:</span>
              {Object.values(DECK_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`flex flex-col items-center p-1.5 rounded border transition-all ${
                    deck.theme === theme.id
                      ? 'border-indigo-500 bg-slate-800 ring-1 ring-indigo-500'
                      : 'border-slate-700/60 hover:border-slate-600 bg-slate-900/60'
                  }`}
                  title={theme.description}
                >
                  <div
                    className="w-12 h-6 rounded border border-slate-600/50"
                    style={{ background: theme.gradient || theme.background }}
                  />
                  <span className="text-[10px] mt-1 text-slate-300 max-w-[65px] truncate">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Aspect Ratio */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Slide Ratio</span>
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded border border-slate-700">
                <span className="px-2 py-1 text-xs text-white font-mono bg-indigo-600 rounded">
                  16:9 Widescreen
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TRANSITIONS */}
        {activeTab === 'transitions' && (
          <div className="flex items-center gap-4">
            {/* Transition Engine Selector: Fade, Slide, Push */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Transition Effect:
              </span>
              {[
                {
                  id: 'fade',
                  label: 'Fade',
                  desc: 'Smooth cross-dissolve opacity transition',
                },
                {
                  id: 'slide',
                  label: 'Slide',
                  desc: 'Incoming slide smoothly overlays over current slide',
                },
                {
                  id: 'push',
                  label: 'Push',
                  desc: 'Incoming slide pushes outgoing slide off-screen',
                },
                {
                  id: 'none',
                  label: 'None',
                  desc: 'Instant slide cut without animation',
                },
              ].map((tr) => {
                const isSelected = (activeSlide.transition || 'fade') === tr.id;
                return (
                  <button
                    key={tr.id}
                    onClick={() => onUpdateSlide({ transition: tr.id as any })}
                    className={`flex flex-col items-start px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500/60 shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                    title={tr.desc}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{tr.label}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[110px]">
                      {tr.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Duration Slider */}
            <div className="flex flex-col gap-1 border-r border-slate-800 pr-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold">Duration:</span>
                <span className="font-mono text-indigo-400 font-bold ml-2">
                  {activeSlide.transitionDuration || 0.5}s
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.1}
                value={activeSlide.transitionDuration || 0.5}
                onChange={(e) =>
                  onUpdateSlide({ transitionDuration: parseFloat(e.target.value) })
                }
                className="w-28 accent-indigo-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Quick Preview & Apply to All */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartSlideshow(false, true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow transition-colors cursor-pointer"
                title="Preview full slide transition in Presenter View"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test in Presenter</span>
              </button>

              <button
                onClick={() => {
                  deck.slides.forEach((sl) => {
                    onUpdateSlide({
                      transition: activeSlide.transition || 'fade',
                      transitionDuration: activeSlide.transitionDuration || 0.5,
                    });
                  });
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                title="Apply current transition to all slides in deck"
              >
                Apply to All Slides
              </button>
            </div>
          </div>
        )}

        {/* TAB: ANIMATIONS */}
        {activeTab === 'animations' && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              {selectedElement
                ? `Animate Selected ${selectedElement.type.toUpperCase()}:`
                : 'Select an element on the canvas to animate:'}
            </span>

            {selectedElement && (
              <div className="flex items-center gap-1.5">
                {(['none', 'fade-in', 'fly-up', 'pop', 'wipe'] as const).map((an) => (
                  <button
                    key={an}
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        animation: {
                          type: an,
                          duration: 0.5,
                        },
                      })
                    }
                    className={`px-3 py-1.5 rounded text-xs capitalize transition-colors ${
                      selectedElement.animation?.type === an
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {an.replace('-', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SLIDESHOW */}
        {activeTab === 'slideshow' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartSlideshow(true, true)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs"
            >
              <MonitorPlay className="w-4 h-4" />
              <span>Presenter View (F5)</span>
            </button>
            <button
              onClick={() => onStartSlideshow(false, false)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs"
            >
              <Play className="w-4 h-4" />
              <span>Audience Slideshow</span>
            </button>
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Keyboard Shortcuts</span>
            </button>
          </div>
        )}

        {/* TAB: AI COPILOT */}
        {activeTab === 'ai' && (
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded font-bold text-xs shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Multi-Slide Deck</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Powered by server-side Gemini 3.8 Flash for instant outline & slide design
            </span>
          </div>
        )}
      </div>

      {/* Presentation Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Presentation Keyboard Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Next Slide</span>
                <span className="font-mono text-indigo-300">Space, Right Arrow, PageDown</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Previous Slide</span>
                <span className="font-mono text-indigo-300">Left Arrow, PageUp</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Toggle Laser Pointer</span>
                <span className="font-mono text-indigo-300">L</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Toggle Pen Tool</span>
                <span className="font-mono text-indigo-300">P</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Blackout Screen</span>
                <span className="font-mono text-indigo-300">B</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Whiteout Screen</span>
                <span className="font-mono text-indigo-300">W</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Exit Presentation</span>
                <span className="font-mono text-indigo-300">Esc</span>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="mt-5 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
