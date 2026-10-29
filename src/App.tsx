import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PresentationDeck,
  Slide,
  SlideElement,
  SlideLayout,
  RibbonTab,
  ViewMode,
  ThemeId,
} from './types';
import { TECH_KEYNOTE_DECK, DECK_THEMES } from './data/templates';
import {
  exportToStandaloneHtml,
  exportDeckToJson,
  importDeckFromJson,
  triggerPrintPdf,
} from './utils/exportUtils';
import { Ribbon } from './components/Ribbon';
import { SlideThumbnailRail } from './components/SlideThumbnailRail';
import { SlideCanvas } from './components/SlideCanvas';
import { FormatInspector } from './components/FormatInspector';
import { PresenterView } from './components/PresenterView';
import { SlideSorterView } from './components/SlideSorterView';
import { TemplatesModal } from './components/TemplatesModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import {
  Monitor,
  LayoutGrid,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const STORAGE_KEY = 'slidecraft_deck_v1';

export default function App() {
  // Load saved deck from localStorage or default to Tech Keynote template
  const [deck, setDeck] = useState<PresentationDeck>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.slides && parsed.slides.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved deck:', e);
    }
    return TECH_KEYNOTE_DECK;
  });

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<PresentationDeck[]>([]);
  const [future, setFuture] = useState<PresentationDeck[]>([]);

  // Navigation & Selection State
  const [activeSlideId, setActiveSlideId] = useState<string>(
    deck.slides[0]?.id || 'slide-1'
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('normal');

  // Sidebars & Modals
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);

  // Zoom scale
  const [zoomScale, setZoomScale] = useState(1);

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [deck]);

  // Active slide lookup
  const activeSlideIndex = useMemo(() => {
    const idx = deck.slides.findIndex((s) => s.id === activeSlideId);
    return idx >= 0 ? idx : 0;
  }, [deck.slides, activeSlideId]);

  const activeSlide = useMemo(() => {
    return deck.slides[activeSlideIndex] || deck.slides[0];
  }, [deck.slides, activeSlideIndex]);

  const selectedElement = useMemo(() => {
    return activeSlide?.elements.find((el) => el.id === selectedElementId) || null;
  }, [activeSlide, selectedElementId]);

  // Central State Updater with Undo History recording
  const updateDeck = useCallback(
    (newDeckOrFn: PresentationDeck | ((prev: PresentationDeck) => PresentationDeck)) => {
      setDeck((prevDeck) => {
        const nextDeck =
          typeof newDeckOrFn === 'function' ? newDeckOrFn(prevDeck) : newDeckOrFn;
        setHistory((prevHist) => [...prevHist.slice(-25), prevDeck]);
        setFuture([]);
        return nextDeck;
      });
    },
    []
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [deck, ...prev]);
    setDeck(previous);
  }, [history, deck]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, deck]);
    setDeck(next);
  }, [future, deck]);

  // Global Keyboard Shortcuts (Undo, Redo, Duplicate, Present)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (viewMode === 'presenter' || viewMode === 'slideshow') return;

      // Don't intercept if actively typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'F5') {
        e.preventDefault();
        setViewMode('presenter');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedElementId) {
          // duplicate element
          const el = activeSlide.elements.find((item) => item.id === selectedElementId);
          if (el) {
            const newEl: SlideElement = {
              ...el,
              id: `el-${Date.now()}`,
              x: Math.min(80, el.x + 3),
              y: Math.min(80, el.y + 3),
            };
            updateDeck((d) => ({
              ...d,
              slides: d.slides.map((s) =>
                s.id === activeSlide.id ? { ...s, elements: [...s.elements, newEl] } : s
              ),
            }));
            setSelectedElementId(newEl.id);
          }
        } else {
          // duplicate slide
          handleDuplicateSlide(activeSlide.id);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [
    viewMode,
    handleUndo,
    handleRedo,
    selectedElementId,
    activeSlide,
    updateDeck,
  ]);

  // Slide CRUD Actions
  const handleAddSlide = useCallback(
    (layout: SlideLayout = 'title-content') => {
      const newSlideId = `slide-${Date.now()}`;
      const defaultTheme = DECK_THEMES[deck.theme] || DECK_THEMES['tech-keynote'];

      let elements: SlideElement[] = [];
      if (layout === 'title') {
        elements = [
          {
            id: `el-${Date.now()}-1`,
            type: 'text',
            x: 10,
            y: 35,
            width: 80,
            height: 25,
            content: 'Presentation Title',
            zIndex: 1,
            style: {
              fontSize: 52,
              fontWeight: 'bold',
              textAlign: 'center',
              color: defaultTheme.titleColor,
            },
          },
          {
            id: `el-${Date.now()}-2`,
            type: 'text',
            x: 20,
            y: 65,
            width: 60,
            height: 15,
            content: 'Presenter Name or Subtitle',
            zIndex: 2,
            style: {
              fontSize: 22,
              textAlign: 'center',
              color: defaultTheme.textColor,
            },
          },
        ];
      } else if (layout === 'two-column') {
        elements = [
          {
            id: `el-${Date.now()}-h`,
            type: 'text',
            x: 8,
            y: 8,
            width: 84,
            height: 12,
            content: 'Two Column Comparison',
            zIndex: 1,
            style: {
              fontSize: 40,
              fontWeight: 'bold',
              color: defaultTheme.titleColor,
            },
          },
          {
            id: `el-${Date.now()}-c1`,
            type: 'text',
            x: 8,
            y: 26,
            width: 40,
            height: 60,
            content: 'Left Column Content:\n\n• Key discovery point 1\n• Supporting empirical data\n• Operational benefit',
            zIndex: 2,
            style: {
              fontSize: 18,
              lineHeight: 1.6,
              color: defaultTheme.textColor,
              backgroundColor: defaultTheme.cardBg,
              borderRadius: 12,
              padding: 20,
            },
          },
          {
            id: `el-${Date.now()}-c2`,
            type: 'text',
            x: 52,
            y: 26,
            width: 40,
            height: 60,
            content: 'Right Column Content:\n\n• Secondary comparison point\n• Technical requirements\n• Validation metric',
            zIndex: 3,
            style: {
              fontSize: 18,
              lineHeight: 1.6,
              color: defaultTheme.textColor,
              backgroundColor: defaultTheme.cardBg,
              borderRadius: 12,
              padding: 20,
            },
          },
        ];
      } else {
        // default title & content
        elements = [
          {
            id: `el-${Date.now()}-title`,
            type: 'text',
            x: 8,
            y: 8,
            width: 84,
            height: 12,
            content: 'Slide Header Title',
            zIndex: 1,
            style: {
              fontSize: 40,
              fontWeight: 'bold',
              color: defaultTheme.titleColor,
            },
          },
          {
            id: `el-${Date.now()}-body`,
            type: 'text',
            x: 8,
            y: 26,
            width: 84,
            height: 60,
            content: 'Add your primary talking points and presentation message here.\n\n• High-impact insight or metric\n• Supporting detail explaining the solution\n• Strategic takeaway for stakeholders',
            zIndex: 2,
            style: {
              fontSize: 20,
              lineHeight: 1.6,
              color: defaultTheme.textColor,
            },
          },
        ];
      }

      const newSlide: Slide = {
        id: newSlideId,
        title: `New ${layout} Slide`,
        layout,
        notes: '',
        transition: 'fade',
        backgroundColor: defaultTheme.background,
        backgroundGradient: defaultTheme.gradient,
        elements,
      };

      updateDeck((d) => ({
        ...d,
        slides: [...d.slides, newSlide],
      }));
      setActiveSlideId(newSlideId);
      setSelectedElementId(null);
    },
    [deck.theme, updateDeck]
  );

  const handleDuplicateSlide = useCallback(
    (slideId: string) => {
      const target = deck.slides.find((s) => s.id === slideId);
      if (!target) return;

      const newSlideId = `slide-${Date.now()}`;
      const duplicated: Slide = {
        ...target,
        id: newSlideId,
        title: `${target.title} (Copy)`,
        elements: target.elements.map((el) => ({
          ...el,
          id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        })),
      };

      const targetIdx = deck.slides.findIndex((s) => s.id === slideId);
      const newSlides = [...deck.slides];
      newSlides.splice(targetIdx + 1, 0, duplicated);

      updateDeck((d) => ({ ...d, slides: newSlides }));
      setActiveSlideId(newSlideId);
      setSelectedElementId(null);
    },
    [deck.slides, updateDeck]
  );

  const handleDeleteSlide = useCallback(
    (slideId: string) => {
      if (deck.slides.length <= 1) return;
      const targetIdx = deck.slides.findIndex((s) => s.id === slideId);
      const newSlides = deck.slides.filter((s) => s.id !== slideId);

      updateDeck((d) => ({ ...d, slides: newSlides }));
      const nextSlide = newSlides[targetIdx] || newSlides[targetIdx - 1] || newSlides[0];
      setActiveSlideId(nextSlide.id);
      setSelectedElementId(null);
    },
    [deck.slides, updateDeck]
  );

  const handleMoveSlide = useCallback(
    (slideId: string, direction: 'up' | 'down') => {
      const idx = deck.slides.findIndex((s) => s.id === slideId);
      if (idx < 0) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === deck.slides.length - 1) return;

      const newSlides = [...deck.slides];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const [moved] = newSlides.splice(idx, 1);
      newSlides.splice(targetIdx, 0, moved);

      updateDeck((d) => ({ ...d, slides: newSlides }));
    },
    [deck.slides, updateDeck]
  );

  const handleToggleHideSlide = useCallback(
    (slideId: string) => {
      updateDeck((d) => ({
        ...d,
        slides: d.slides.map((s) =>
          s.id === slideId ? { ...s, hidden: !s.hidden } : s
        ),
      }));
    },
    [updateDeck]
  );

  // Element Updates
  const handleUpdateElement = useCallback(
    (elementId: string, updates: Partial<SlideElement>) => {
      updateDeck((d) => ({
        ...d,
        slides: d.slides.map((s) => {
          if (s.id !== activeSlide.id) return s;
          return {
            ...s,
            elements: s.elements.map((el) => {
              if (el.id !== elementId) return el;
              return {
                ...el,
                ...updates,
                style: {
                  ...el.style,
                  ...(updates.style || {}),
                },
              };
            }),
          };
        }),
      }));
    },
    [activeSlide.id, updateDeck]
  );

  const handleAddElement = useCallback(
    (type: SlideElement['type'], extraProps: any = {}) => {
      const defaultTheme = DECK_THEMES[deck.theme] || DECK_THEMES['tech-keynote'];
      const newElId = `el-${Date.now()}`;

      let baseElement: SlideElement = {
        id: newElId,
        type,
        x: 25,
        y: 35,
        width: 50,
        height: 20,
        zIndex: activeSlide.elements.length + 1,
        content: '',
        style: {
          color: defaultTheme.textColor,
          fontSize: 22,
        },
      };

      if (type === 'text') {
        baseElement.content = 'Double-click to type text';
        baseElement.style = {
          fontSize: 24,
          color: defaultTheme.titleColor,
          textAlign: 'left',
        };
      } else if (type === 'shape') {
        baseElement.content = '';
        baseElement.width = 30;
        baseElement.height = 30;
        baseElement.style = {
          shapeType: 'rounded',
          backgroundColor: defaultTheme.accentColor,
          borderRadius: 12,
        };
      }

      const finalElement = { ...baseElement, ...extraProps };
      updateDeck((d) => ({
        ...d,
        slides: d.slides.map((s) =>
          s.id === activeSlide.id ? { ...s, elements: [...s.elements, finalElement] } : s
        ),
      }));
      setSelectedElementId(newElId);
    },
    [deck.theme, activeSlide.id, activeSlide.elements.length, updateDeck]
  );

  const handleDeleteElement = useCallback(
    (elementId: string) => {
      updateDeck((d) => ({
        ...d,
        slides: d.slides.map((s) =>
          s.id === activeSlide.id
            ? { ...s, elements: s.elements.filter((el) => el.id !== elementId) }
            : s
        ),
      }));
      setSelectedElementId(null);
    },
    [activeSlide.id, updateDeck]
  );

  const handleUpdateSlide = useCallback(
    (updates: Partial<Slide>) => {
      updateDeck((d) => ({
        ...d,
        slides: d.slides.map((s) =>
          s.id === activeSlide.id ? { ...s, ...updates } : s
        ),
      }));
    },
    [activeSlide.id, updateDeck]
  );

  const handleSelectTheme = useCallback(
    (themeId: ThemeId) => {
      const theme = DECK_THEMES[themeId];
      if (!theme) return;

      updateDeck((d) => ({
        ...d,
        theme: themeId,
        slides: d.slides.map((s) => ({
          ...s,
          backgroundColor: theme.background,
          backgroundGradient: theme.gradient,
        })),
      }));
    },
    [updateDeck]
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. TOP RIBBON TOOLBAR */}
      <Ribbon
        deck={deck}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeSlide={activeSlide}
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        onUpdateSlide={handleUpdateSlide}
        onAddSlide={handleAddSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onDeleteSlide={handleDeleteSlide}
        onAddElement={handleAddElement}
        onDeleteElement={handleDeleteElement}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onStartSlideshow={(fromBeginning, isPresenter) => {
          if (fromBeginning) setActiveSlideId(deck.slides[0]?.id || activeSlideId);
          setViewMode(isPresenter ? 'presenter' : 'slideshow');
        }}
        onExportHtml={() => exportToStandaloneHtml(deck)}
        onExportJson={() => exportDeckToJson(deck)}
        onImportJson={async (file) => {
          try {
            const imported = await importDeckFromJson(file);
            setDeck(imported);
            setActiveSlideId(imported.slides[0]?.id || 'slide-1');
          } catch (err: any) {
            alert('Failed to import deck: ' + err.message);
          }
        }}
        onPrintPdf={triggerPrintPdf}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onUpdateDeckTitle={(title) => updateDeck((d) => ({ ...d, title }))}
        onSelectTheme={handleSelectTheme}
        onToggleViewMode={() =>
          setViewMode(viewMode === 'normal' ? 'sorter' : 'normal')
        }
        viewMode={viewMode === 'sorter' ? 'sorter' : 'normal'}
      />

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      {viewMode === 'sorter' ? (
        <SlideSorterView
          slides={deck.slides}
          activeSlideId={activeSlideId}
          onSelectSlide={setActiveSlideId}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onAddSlide={() => handleAddSlide('title-content')}
          onClose={() => setViewMode('normal')}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Slide Thumbnails Rail */}
          <SlideThumbnailRail
            slides={deck.slides}
            activeSlideId={activeSlideId}
            onSelectSlide={(id) => {
              setActiveSlideId(id);
              setSelectedElementId(null);
            }}
            onAddSlide={handleAddSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
            onToggleHideSlide={handleToggleHideSlide}
          />

          {/* Center Stage & WYSIWYG Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <SlideCanvas
              slide={activeSlide}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              zoomScale={zoomScale}
            />

            {/* Collapsible Bottom Speaker Notes Drawer */}
            {isNotesDrawerOpen && (
              <div className="h-44 bg-slate-900 border-t border-slate-800 p-4 flex flex-col shrink-0 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> Slide Speaker Notes
                  </span>
                  <button
                    onClick={() => setIsNotesDrawerOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={activeSlide.notes || ''}
                  onChange={(e) => handleUpdateSlide({ notes: e.target.value })}
                  placeholder="Type talking points, timing cues, or facts for this slide..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Right Format Inspector Sidebar */}
          <FormatInspector
            slide={activeSlide}
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onUpdateSlide={handleUpdateSlide}
            onDeleteElement={handleDeleteElement}
            isOpen={isInspectorOpen}
            onToggleOpen={() => setIsInspectorOpen(!isInspectorOpen)}
          />
        </div>
      )}

      {/* 3. BOTTOM STATUS BAR */}
      <footer className="h-8 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0 select-none">
        {/* Left: Slide counter & Layout */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-300">
            Slide {activeSlideIndex + 1} of {deck.slides.length}
          </span>
          <span className="text-slate-600">·</span>
          <span className="capitalize text-slate-400">
            Layout: {activeSlide.layout.replace('-', ' ')}
          </span>
        </div>

        {/* Center: Notes drawer toggle */}
        <button
          onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs transition-colors ${
            isNotesDrawerOpen
              ? 'bg-indigo-600 text-white font-semibold'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notes</span>
          {isNotesDrawerOpen ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )}
        </button>

        {/* Right: View mode & Zoom controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
            <button
              onClick={() => setViewMode('normal')}
              className={`p-1 rounded ${
                viewMode === 'normal'
                  ? 'bg-slate-800 text-white'
                  : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="Normal Slide Editor"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('sorter')}
              className={`p-1 rounded ${
                viewMode === 'sorter'
                  ? 'bg-slate-800 text-white'
                  : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="Slide Sorter Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
              className="p-1 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={zoomScale}
              onChange={(e) => setZoomScale(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
              className="p-1 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(1)}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono hover:bg-slate-800 text-indigo-400"
              title="Reset Zoom to 100%"
            >
              {Math.round(zoomScale * 100)}%
            </button>
          </div>
        </div>
      </footer>

      {/* 4. PRESENTER / FULLSCREEN SLIDESHOW OVERLAY */}
      {(viewMode === 'presenter' || viewMode === 'slideshow') && (
        <PresenterView
          slides={deck.slides}
          initialSlideIndex={activeSlideIndex}
          onClose={() => setViewMode('normal')}
          isPureSlideshow={viewMode === 'slideshow'}
        />
      )}

      {/* 5. TEMPLATES GALLERY MODAL */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onLoadDeck={(newDeck) => {
          updateDeck(newDeck);
          setActiveSlideId(newDeck.slides[0]?.id || 'slide-1');
          setSelectedElementId(null);
        }}
        currentDeckId={deck.id}
      />

      {/* 6. AI COPILOT MODAL */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onDeckGenerated={(generatedDeck) => {
          updateDeck(generatedDeck);
          setActiveSlideId(generatedDeck.slides[0]?.id || 'slide-1');
          setSelectedElementId(null);
        }}
        activeSlide={activeSlide}
        onUpdateSlide={handleUpdateSlide}
      />

      {/* 7. HIDDEN PRINT DECK CONTAINER (FOR CLEAN PDF GENERATION) */}
      <div className="hidden print-deck-container">
        {deck.slides.map((slide, sIdx) => (
          <div
            key={slide.id}
            className="print-slide-page relative overflow-hidden"
            style={{
              background:
                slide.backgroundGradient && slide.backgroundGradient !== 'none'
                  ? slide.backgroundGradient
                  : slide.backgroundColor || '#ffffff',
            }}
          >
            {slide.elements.map((el) => {
              const s = el.style || {};
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                    fontFamily: s.fontFamily,
                    fontSize: s.fontSize ? `${s.fontSize * 0.7}px` : undefined,
                    fontWeight: s.fontWeight,
                    color: s.color,
                    backgroundColor: s.backgroundColor,
                    borderColor: s.borderColor,
                    borderWidth: s.borderWidth ? `${s.borderWidth}px` : undefined,
                    borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
                    padding: s.padding ? `${s.padding * 0.7}px` : undefined,
                  }}
                >
                  {el.type === 'text' && (
                    <div className="whitespace-pre-wrap">{el.content}</div>
                  )}
                  {el.type === 'kpi' && el.kpiData && (
                    <div className="p-2">
                      <div className="font-bold text-2xl">{el.kpiData.value}</div>
                      <div className="text-sm font-semibold">{el.kpiData.label}</div>
                      <div className="text-xs opacity-70">{el.kpiData.subtext}</div>
                    </div>
                  )}
                  {el.type === 'table' && el.tableData && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr>
                          {el.tableData.headers.map((h, i) => (
                            <th key={i} className="p-1 font-bold border-b">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {el.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-1">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {el.type === 'code' && (
                    <pre className="font-mono text-xs m-0 p-2 bg-slate-900 text-sky-300">
                      <code>{el.content}</code>
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
