import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  PenTool,
  Sparkles,
  Eraser,
  Monitor,
  Tv,
  Layers,
} from 'lucide-react';
import { Slide, SlideElement } from '../types';

interface PresenterViewProps {
  slides: Slide[];
  initialSlideIndex: number;
  onClose: () => void;
  isPureSlideshow?: boolean;
}

export const PresenterView: React.FC<PresenterViewProps> = ({
  slides,
  initialSlideIndex,
  onClose,
  isPureSlideshow = false,
}) => {
  const [currentIdx, setCurrentIdx] = useState(initialSlideIndex || 0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [viewMode, setViewMode] = useState<'presenter' | 'slideshow'>(
    isPureSlideshow ? 'slideshow' : 'presenter'
  );

  // Presentation Timer (Stopwatch)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Presenter Tools
  const [isLaserPointer, setIsLaserPointer] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [drawings, setDrawings] = useState<{ x: number; y: number; isStart?: boolean }[]>([]);
  const isDrawingRef = useRef(false);

  // Blackout / Whiteout screen
  const [screenBlank, setScreenBlank] = useState<'none' | 'black' | 'white'>('none');
  const [notesFontSize, setNotesFontSize] = useState(18);

  const currentSlide = slides[currentIdx] || slides[0];
  const previousSlide = prevIdx !== null ? slides[prevIdx] : null;
  const nextSlide = slides[currentIdx + 1] || null;

  // Real-time Clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Presentation Stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Clean up transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Slide Transition Trigger helper
  const navigateSlide = (targetIdx: number, direction: 'forward' | 'backward') => {
    if (targetIdx === currentIdx || targetIdx < 0 || targetIdx >= slides.length) return;

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

    setPrevIdx(currentIdx);
    setCurrentIdx(targetIdx);
    setTransitionDirection(direction);
    setDrawings([]); // Clear ink annotations when switching slides

    const targetSlide = slides[targetIdx];
    const duration = (targetSlide.transitionDuration || 0.5) * 1000;

    setIsTransitioning(true);
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setPrevIdx(null);
    }, duration);
  };

  const next = () => {
    if (currentIdx < slides.length - 1) {
      navigateSlide(currentIdx + 1, 'forward');
    }
  };

  const prev = () => {
    if (currentIdx > 0) {
      navigateSlide(currentIdx - 1, 'backward');
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'b' || e.key === 'B') {
        setScreenBlank((prev) => (prev === 'black' ? 'none' : 'black'));
      } else if (e.key === 'w' || e.key === 'W') {
        setScreenBlank((prev) => (prev === 'white' ? 'none' : 'white'));
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserPointer((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPenActive((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, slides.length, onClose]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Laser Pointer tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaserPointer) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }

    if (isPenActive && isDrawingRef.current) {
      const target = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - target.left) / target.width) * 100;
      const y = ((e.clientY - target.top) / target.height) * 100;
      setDrawings((prev) => [...prev, { x, y }]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPenActive) {
      isDrawingRef.current = true;
      const target = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - target.left) / target.width) * 100;
      const y = ((e.clientY - target.top) / target.height) * 100;
      setDrawings((prev) => [...prev, { x, y, isStart: true }]);
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  // Helper to render individual slide content
  const renderSlideContent = (slide: Slide, isPreview = false) => {
    return (
      <div
        className="w-full h-full relative overflow-hidden select-none"
        style={{
          background:
            slide.backgroundGradient && slide.backgroundGradient !== 'none'
              ? slide.backgroundGradient
              : slide.backgroundColor || '#090d16',
        }}
      >
        {(slide.elements || []).map((el) => {
          const s = el.style || {};
          return (
            <div
              key={el.id}
              className="absolute overflow-hidden flex flex-col"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                zIndex: el.zIndex || 1,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                fontFamily: s.fontFamily,
                fontSize: s.fontSize ? `${s.fontSize * (isPreview ? 0.45 : 1)}px` : undefined,
                fontWeight: s.fontWeight,
                fontStyle: s.fontStyle,
                textAlign: s.textAlign,
                color: s.color,
                backgroundColor: s.backgroundColor,
                borderColor: s.borderColor,
                borderWidth: s.borderWidth ? `${s.borderWidth}px` : undefined,
                borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
                padding: s.padding ? `${s.padding * (isPreview ? 0.45 : 1)}px` : undefined,
                opacity: s.opacity !== undefined ? s.opacity : 1,
                boxShadow: s.shadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' : undefined,
              }}
            >
              {el.type === 'text' && (
                <div className="w-full h-full whitespace-pre-wrap">{el.content}</div>
              )}
              {el.type === 'kpi' && el.kpiData && (
                <div className="w-full h-full flex flex-col justify-between p-2">
                  <div
                    className="font-bold tracking-tight"
                    style={{
                      fontSize: `${(s.fontSize || 42) * (isPreview ? 0.45 : 1)}px`,
                      color: s.color || '#38bdf8',
                    }}
                  >
                    {el.kpiData.value}
                  </div>
                  <div className="text-base font-semibold opacity-90 mt-1">
                    {el.kpiData.label}
                  </div>
                  {el.kpiData.subtext && (
                    <div className="text-xs opacity-60 mt-0.5">{el.kpiData.subtext}</div>
                  )}
                  {el.kpiData.trend && (
                    <div className="mt-2 inline-flex items-center text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded w-fit">
                      {el.kpiData.trend}
                    </div>
                  )}
                </div>
              )}
              {el.type === 'code' && (
                <pre className="w-full h-full font-mono text-xs overflow-auto m-0 p-3 leading-relaxed bg-slate-950/90 text-sky-300">
                  <code>{el.content}</code>
                </pre>
              )}
              {el.type === 'table' && el.tableData && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-600/50">
                      {el.tableData.headers.map((h, i) => (
                        <th key={i} className="p-2 font-bold bg-slate-800/40 text-slate-200">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {el.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-700/30">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 text-slate-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {el.type === 'shape' && (
                <div className="w-full h-full flex items-center justify-center">
                  {el.content}
                </div>
              )}
            </div>
          );
        })}

        {/* Live Pen Annotations Overlay */}
        {!isPreview && drawings.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
            {drawings.map((pt, i) => {
              if (i === 0 || pt.isStart) return null;
              const prevPt = drawings[i - 1];
              return (
                <line
                  key={i}
                  x1={`${prevPt.x}%`}
                  y1={`${prevPt.y}%`}
                  x2={`${pt.x}%`}
                  y2={`${pt.y}%`}
                  stroke={penColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        )}
      </div>
    );
  };

  /**
   * SLIDE TRANSITION STAGE RENDERER:
   * Handles 'Fade', 'Slide', and 'Push' animations with directional awareness
   */
  const renderTransitionStage = () => {
    const transitionType = currentSlide.transition || 'fade';
    const durationSec = currentSlide.transitionDuration || 0.5;

    // Normalize transition aliases
    const isFade = transitionType === 'fade';
    const isSlide =
      transitionType === 'slide' ||
      transitionType === 'slide-left' ||
      transitionType === 'slide-right' ||
      transitionType === 'slide-up';
    const isPush = transitionType === 'push';

    if (!isTransitioning || !previousSlide || transitionType === 'none') {
      return (
        <div className="w-full h-full absolute inset-0">
          {renderSlideContent(currentSlide)}
        </div>
      );
    }

    return (
      <div
        className="w-full h-full absolute inset-0 overflow-hidden"
        style={{ '--transition-duration': `${durationSec}s` } as React.CSSProperties}
      >
        {/* CASE 1: PUSH TRANSITION (Previous slide slides out, New slide slides in) */}
        {isPush && (
          <>
            <div
              className={`w-full h-full absolute inset-0 z-10 ${
                transitionDirection === 'forward'
                  ? 'transition-push-exit-forward'
                  : 'transition-push-exit-backward'
              }`}
            >
              {renderSlideContent(previousSlide)}
            </div>
            <div
              className={`w-full h-full absolute inset-0 z-20 ${
                transitionDirection === 'forward'
                  ? 'transition-push-enter-forward'
                  : 'transition-push-enter-backward'
              }`}
            >
              {renderSlideContent(currentSlide)}
            </div>
          </>
        )}

        {/* CASE 2: SLIDE TRANSITION (Incoming slide overlays on top of previous slide) */}
        {isSlide && (
          <>
            <div className="w-full h-full absolute inset-0 z-10">
              {renderSlideContent(previousSlide)}
            </div>
            <div
              className={`w-full h-full absolute inset-0 z-20 shadow-2xl ${
                transitionDirection === 'forward'
                  ? 'transition-slide-enter-forward'
                  : 'transition-slide-enter-backward'
              }`}
            >
              {renderSlideContent(currentSlide)}
            </div>
          </>
        )}

        {/* CASE 3: FADE TRANSITION (Smooth cross-dissolve opacity) */}
        {isFade && (
          <>
            <div className="w-full h-full absolute inset-0 z-10">
              {renderSlideContent(previousSlide)}
            </div>
            <div className="w-full h-full absolute inset-0 z-20 transition-fade-enter">
              {renderSlideContent(currentSlide)}
            </div>
          </>
        )}

        {/* FALLBACK / OTHER TRANSITIONS (e.g. Zoom) */}
        {!isPush && !isSlide && !isFade && (
          <div className="w-full h-full absolute inset-0 z-20 transition-fade-enter">
            {renderSlideContent(currentSlide)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Blackout / Whiteout screen overlay */}
      {screenBlank === 'black' && (
        <div
          onClick={() => setScreenBlank('none')}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer"
        >
          <span className="text-slate-700 text-sm">
            Screen Blackout Active · Press 'B' or click to resume
          </span>
        </div>
      )}
      {screenBlank === 'white' && (
        <div
          onClick={() => setScreenBlank('none')}
          className="fixed inset-0 bg-white z-50 flex items-center justify-center cursor-pointer"
        >
          <span className="text-slate-400 text-sm">
            Screen Whiteout Active · Press 'W' or click to resume
          </span>
        </div>
      )}

      {/* Laser pointer trail */}
      {isLaserPointer && (
        <div
          className="laser-pointer-trail"
          style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
        />
      )}

      {/* TOP PRESENTER BAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        {/* Left: Stopwatch Timer & Real Clock */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm tracking-wider text-slate-300">
              {currentTime}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                isTimerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {formatTime(timerSeconds)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 ml-1"
              title={isTimerRunning ? 'Pause Stopwatch' : 'Resume Stopwatch'}
            >
              {isTimerRunning ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => {
                setTimerSeconds(0);
                setIsTimerRunning(true);
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Reset Stopwatch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Slide Index, Title & Active Transition Tag */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-indigo-400">{currentIdx + 1}</span>
          <span className="text-slate-500">/</span>
          <span className="font-mono text-slate-400">{slides.length}</span>
          <span className="text-slate-600 mx-1">·</span>
          <span className="text-sm font-medium text-slate-200 truncate max-w-xs">
            {currentSlide.title || `Slide ${currentIdx + 1}`}
          </span>
          {/* Active Transition Badge */}
          <span className="ml-2 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 font-mono capitalize">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>
              {currentSlide.transition || 'Fade'} ({currentSlide.transitionDuration || 0.5}s)
            </span>
          </span>
        </div>

        {/* Right: Tools & View Controls */}
        <div className="flex items-center gap-2">
          {/* Laser Pointer toggle */}
          <button
            onClick={() => setIsLaserPointer(!isLaserPointer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              isLaserPointer
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.6)]'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Laser Pointer (L)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Laser</span>
          </button>

          {/* Pen / Highlighter tool */}
          <button
            onClick={() => setIsPenActive(!isPenActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              isPenActive
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Pen Annotations (P)"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>

          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded hover:bg-slate-700"
              title="Clear Slide Ink"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Blackout button */}
          <button
            onClick={() => setScreenBlank(screenBlank === 'black' ? 'none' : 'black')}
            className={`px-2.5 py-1.5 rounded text-xs font-semibold border ${
              screenBlank === 'black'
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Blackout Screen (B)"
          >
            Black (B)
          </button>

          {/* Switch Presenter vs Slideshow */}
          <button
            onClick={() =>
              setViewMode(viewMode === 'presenter' ? 'slideshow' : 'presenter')
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-semibold border border-slate-700"
            title="Switch View Mode"
          >
            {viewMode === 'presenter' ? (
              <>
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                <span>Audience View</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                <span>Presenter Console</span>
              </>
            )}
          </button>

          {/* Exit Presentation */}
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded text-xs font-semibold border border-rose-500/30"
            title="End Slide Show (Esc)"
          >
            <X className="w-4 h-4" />
            <span>End Show</span>
          </button>
        </div>
      </header>

      {/* VIEWPORT CONTENT */}
      {viewMode === 'presenter' ? (
        /* DUAL SCREEN PRESENTER CONSOLE */
        <div className="flex-1 flex overflow-hidden p-6 gap-6 bg-slate-950">
          {/* LEFT 65%: CURRENT ACTIVE SLIDE WITH TRANSITIONS */}
          <div className="flex-[3] flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>CURRENT SLIDE</span>
              <span>{currentSlide.layout.toUpperCase()}</span>
            </div>

            <div
              onMouseDown={handleMouseDown}
              className={`flex-1 aspect-video rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative bg-black ${
                isPenActive
                  ? 'cursor-crosshair'
                  : isLaserPointer
                  ? 'cursor-none'
                  : 'cursor-default'
              }`}
            >
              {renderTransitionStage()}
            </div>

            {/* Bottom Slide Navigation Bar */}
            <div className="mt-4 flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <button
                onClick={prev}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Jump to:</span>
                <select
                  value={currentIdx}
                  onChange={(e) => {
                    const nextIndex = parseInt(e.target.value, 10);
                    navigateSlide(
                      nextIndex,
                      nextIndex > currentIdx ? 'forward' : 'backward'
                    );
                  }}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-xs text-white outline-none cursor-pointer"
                >
                  {slides.map((s, idx) => (
                    <option key={s.id} value={idx}>
                      {idx + 1}. {s.title || `Slide ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={next}
                disabled={currentIdx === slides.length - 1}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT 35%: NEXT SLIDE PREVIEW & SPEAKER NOTES */}
          <div className="flex-[2] flex flex-col gap-6">
            {/* NEXT SLIDE PREVIEW */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                <span>NEXT SLIDE</span>
                <span className="truncate max-w-[200px] text-slate-500">
                  {nextSlide ? nextSlide.title : 'End of presentation'}
                </span>
              </div>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-lg relative">
                {nextSlide ? (
                  renderSlideContent(nextSlide, true)
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                    <span>No more slides</span>
                    <span className="text-[11px] mt-1 text-slate-500">
                      Press Escape to exit presentation
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* SPEAKER NOTES PANE */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col overflow-hidden shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Speaker Notes
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNotesFontSize((prev) => Math.max(12, prev - 2))}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-300"
                    title="Decrease Notes Font"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setNotesFontSize((prev) => Math.min(32, prev + 2))}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-300"
                    title="Increase Notes Font"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto pr-2 text-slate-200 leading-relaxed whitespace-pre-wrap select-text font-normal"
                style={{ fontSize: `${notesFontSize}px` }}
              >
                {currentSlide.notes || (
                  <span className="text-slate-500 italic text-sm">
                    No speaker notes provided for this slide. You can add them in the
                    slide editor.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PURE AUDIENCE SLIDESHOW MODE WITH TRANSITIONS */
        <div
          onMouseDown={handleMouseDown}
          className={`flex-1 flex items-center justify-center p-8 bg-black relative ${
            isPenActive
              ? 'cursor-crosshair'
              : isLaserPointer
              ? 'cursor-none'
              : 'cursor-default'
          }`}
        >
          <div className="aspect-video w-full max-h-full rounded-lg overflow-hidden shadow-2xl relative">
            {renderTransitionStage()}
          </div>

          {/* Floating Hover Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 flex items-center gap-4 text-xs">
            <button
              onClick={prev}
              disabled={currentIdx === 0}
              className="p-1 hover:text-indigo-400 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-mono tabular-nums">
              {currentIdx + 1} / {slides.length}
            </span>
            <button
              onClick={next}
              disabled={currentIdx === slides.length - 1}
              className="p-1 hover:text-indigo-400 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
