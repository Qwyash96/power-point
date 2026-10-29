import React from 'react';
import { LayoutGrid, X, Check, Sparkles } from 'lucide-react';
import { PresentationDeck } from '../types';
import { PRELOADED_DECKS } from '../data/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDeck: (deck: PresentationDeck) => void;
  currentDeckId: string;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onLoadDeck,
  currentDeckId,
}) => {
  if (!isOpen) return null;

  const handleBlankDeck = () => {
    const blankDeck: PresentationDeck = {
      id: `deck-${Date.now()}`,
      title: 'Untitled Presentation',
      aspectRatio: '16:9',
      theme: 'minimal-light',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: [
        {
          id: `slide-${Date.now()}`,
          title: 'Title Slide',
          layout: 'title',
          notes: 'Welcome everyone.',
          transition: 'fade',
          backgroundColor: '#090d16',
          elements: [
            {
              id: 'el-title',
              type: 'text',
              x: 10,
              y: 35,
              width: 80,
              height: 25,
              content: 'Click to add Title',
              zIndex: 1,
              style: {
                fontSize: 54,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ffffff',
              },
            },
            {
              id: 'el-sub',
              type: 'text',
              x: 20,
              y: 65,
              width: 60,
              height: 15,
              content: 'Click to add Subtitle or Presenter Name',
              zIndex: 2,
              style: {
                fontSize: 22,
                textAlign: 'center',
                color: '#94a3b8',
              },
            },
          ],
        },
      ],
    };
    onLoadDeck(blankDeck);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 text-slate-200 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Presentation Templates Gallery</h2>
              <p className="text-xs text-slate-400">
                Pick a professionally designed multi-purpose starter deck with full unlocked features
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

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 overflow-y-auto pr-1">
          {PRELOADED_DECKS.map((deck) => {
            const isCurrent = deck.id === currentDeckId;
            return (
              <div
                key={deck.id}
                onClick={() => {
                  onLoadDeck(deck);
                  onClose();
                }}
                className={`group border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer bg-slate-950/70 hover:bg-slate-800/60 ${
                  isCurrent
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Miniature Cover Preview */}
                  <div
                    className="w-full aspect-video rounded-lg overflow-hidden border border-slate-800 relative mb-3 shadow-inner flex items-center justify-center p-4"
                    style={{
                      background:
                        deck.slides[0]?.backgroundGradient ||
                        deck.slides[0]?.backgroundColor ||
                        '#0f172a',
                    }}
                  >
                    <span
                      className="text-center font-bold text-sm truncate px-2"
                      style={{
                        color:
                          deck.slides[0]?.elements.find((el) => el.type === 'text')?.style.color ||
                          '#ffffff',
                      }}
                    >
                      {deck.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                      {deck.title}
                    </h3>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded font-mono">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {deck.slides.length} pre-formatted slides featuring bespoke KPI cards, data
                    visualizations, and presenter cues.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-indigo-400 font-mono">
                    Theme: {deck.theme}
                  </span>
                  <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-xs">
                    Use Template
                  </button>
                </div>
              </div>
            );
          })}

          {/* Blank Presentation Option */}
          <div
            onClick={handleBlankDeck}
            className="border border-dashed border-slate-700 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-900/30 hover:bg-slate-800/40 min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 mb-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Start Blank Presentation</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Start with a clean 16:9 canvas and build your custom presentation from scratch.
            </p>
            <button className="mt-4 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-xs border border-slate-700">
              Create Blank
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
