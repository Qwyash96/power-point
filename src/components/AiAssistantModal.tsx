import React, { useState } from 'react';
import { Sparkles, X, Loader2, Wand2, FileText, Check } from 'lucide-react';
import { PresentationDeck, Slide } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckGenerated: (deck: PresentationDeck) => void;
  activeSlide: Slide;
  onUpdateSlide: (updates: Partial<Slide>) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onDeckGenerated,
  activeSlide,
  onUpdateSlide,
}) => {
  const [tab, setTab] = useState<'generate' | 'enhance'>('generate');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [style, setStyle] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Text Enhance tab state
  const [rawText, setRawText] = useState('');
  const [enhancedResult, setEnhancedResult] = useState('');
  const [enhanceAction, setEnhanceAction] = useState<'bullets' | 'concise' | 'professional' | 'notes'>('bullets');

  if (!isOpen) return null;

  const handleGenerateDeck = async () => {
    if (!topic.trim()) {
      setError('Please enter a presentation topic.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          audience,
          slideCount,
          style,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error generating presentation.');
      }

      const data = await res.json();
      if (!data.deck || !data.deck.slides) {
        throw new Error('Invalid presentation structure returned by AI.');
      }

      const fullDeck: PresentationDeck = {
        id: `deck-${Date.now()}`,
        title: data.deck.title || topic,
        aspectRatio: '16:9',
        theme: 'tech-keynote',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        slides: data.deck.slides.map((s: any, idx: number) => ({
          id: `slide-${Date.now()}-${idx}`,
          title: s.title || `Slide ${idx + 1}`,
          layout: s.layout || 'title-content',
          notes: s.notes || '',
          transition: 'fade',
          backgroundColor: '#090d16',
          elements: (s.elements || []).map((el: any, elIdx: number) => ({
            id: `el-${Date.now()}-${idx}-${elIdx}`,
            type: el.type || 'text',
            x: el.x || 10,
            y: el.y || 20,
            width: el.width || 80,
            height: el.height || 20,
            content: el.content || '',
            zIndex: elIdx + 1,
            style: {
              fontSize: el.style?.fontSize || 22,
              fontWeight: el.style?.fontWeight || 'normal',
              textAlign: el.style?.textAlign || 'left',
              color: el.style?.color || '#ffffff',
              backgroundColor: el.style?.backgroundColor || 'transparent',
              borderColor: el.style?.borderColor,
              borderRadius: el.style?.borderRadius || 8,
              padding: 12,
            },
          })),
        })),
      };

      onDeckGenerated(fullDeck);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to AI slide generation service.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceText = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          action: enhanceAction,
        }),
      });

      const data = await res.json();
      setEnhancedResult(data.enhancedText || rawText);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance text');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNotesToSlide = () => {
    if (enhancedResult) {
      onUpdateSlide({ notes: enhancedResult });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-slate-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Presentation Copilot</h2>
              <p className="text-xs text-slate-400">
                Powered by Gemini 3.8 Flash for outline creation & content polishing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setTab('generate')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              tab === 'generate'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Generate Full Deck
          </button>
          <button
            onClick={() => setTab('enhance')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              tab === 'enhance'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Enhance Text & Notes
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* TAB 1: GENERATE MULTI-SLIDE DECK */}
        {tab === 'generate' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Presentation Topic or Goal *
              </label>
              <input
                type="text"
                placeholder="e.g., Autonomous Driving Fleets Q4 Review, Quantum Qubit Architecture"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Venture Investors, Engineering Team, Academic Faculty"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Slide Count
                </label>
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
                >
                  <option value={3}>3 Slides (Quick Pitch)</option>
                  <option value={5}>5 Slides (Standard Deck)</option>
                  <option value={7}>7 Slides (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Presentation Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none"
                >
                  <option value="modern tech">Modern Tech / Keynote</option>
                  <option value="executive corporate">Executive Corporate</option>
                  <option value="academic research">Academic Research</option>
                  <option value="minimalist">Minimalist Crisp</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateDeck}
              disabled={loading || !topic.trim()}
              className="w-full mt-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Slides with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Full Presentation</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: ENHANCE TEXT & BULLETS */}
        {tab === 'enhance' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Slide Text to Refine
              </label>
              <textarea
                rows={4}
                placeholder="Paste rough text or ideas here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Improvement Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bullets', label: 'Convert to 3 Bullet Points' },
                  { id: 'concise', label: 'Make Punchy & Concise' },
                  { id: 'professional', label: 'Executive Tone Polishing' },
                  { id: 'notes', label: 'Draft Spoken Speaker Notes' },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setEnhanceAction(act.id as any)}
                    className={`p-2 rounded border text-left transition-colors ${
                      enhanceAction === act.id
                        ? 'border-indigo-500 bg-indigo-950/60 text-white font-medium'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleEnhanceText}
              disabled={loading || !rawText.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enhance Text'}
            </button>

            {enhancedResult && (
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Result:
                </span>
                <p className="text-white whitespace-pre-wrap leading-relaxed select-text">
                  {enhancedResult}
                </p>
                {enhanceAction === 'notes' && (
                  <button
                    onClick={handleApplyNotesToSlide}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply as Speaker Notes to Current Slide</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
