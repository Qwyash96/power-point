import React, { useRef, useState, useEffect } from 'react';
import { Slide, SlideElement, TableData, KPIData } from '../types';
import { RotateCw } from 'lucide-react';

interface SlideCanvasProps {
  slide: Slide;
  selectedElementId: string | null;
  onSelectElement: (elementId: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  onDeleteElement: (elementId: string) => void;
  zoomScale: number; // e.g. 1, 0.75, 1.25
}

type DragAction =
  | { type: 'move'; startX: number; startY: number; origElX: number; origElY: number }
  | { type: 'resize'; handle: string; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number }
  | { type: 'rotate'; startAngle: number; origRotation: number };

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  zoomScale,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragAction, setDragAction] = useState<DragAction | null>(null);
  const [activeSnapLines, setActiveSnapLines] = useState<{ x?: number; y?: number }>({});
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const selectedElement = slide.elements.find((el) => el.id === selectedElementId);

  // Keyboard navigation for selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement || editingTextId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElement.id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, {
          y: Math.max(0, selectedElement.y - (e.shiftKey ? 2 : 0.5)),
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, {
          y: Math.min(100 - selectedElement.height, selectedElement.y + (e.shiftKey ? 2 : 0.5)),
        });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, {
          x: Math.max(0, selectedElement.x - (e.shiftKey ? 2 : 0.5)),
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, {
          x: Math.min(100 - selectedElement.width, selectedElement.x + (e.shiftKey ? 2 : 0.5)),
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, editingTextId, onDeleteElement, onUpdateElement]);

  // Global Mouse Move and Mouse Up handlers for smooth dragging & resizing
  useEffect(() => {
    if (!dragAction || !selectedElement || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragAction.type === 'move') {
        const deltaX = ((e.clientX - dragAction.startX) / canvasWidth) * 100;
        const deltaY = ((e.clientY - dragAction.startY) / canvasHeight) * 100;
        let newX = Math.round((dragAction.origElX + deltaX) * 10) / 10;
        let newY = Math.round((dragAction.origElY + deltaY) * 10) / 10;

        // Snapping logic
        const centerX = newX + selectedElement.width / 2;
        const centerY = newY + selectedElement.height / 2;
        const snaps: { x?: number; y?: number } = {};

        // Snap to center X (50%)
        if (Math.abs(centerX - 50) < 1.2) {
          newX = 50 - selectedElement.width / 2;
          snaps.x = 50;
        }
        // Snap to center Y (50%)
        if (Math.abs(centerY - 50) < 1.2) {
          newY = 50 - selectedElement.height / 2;
          snaps.y = 50;
        }

        setActiveSnapLines(snaps);
        onUpdateElement(selectedElement.id, {
          x: Math.max(0, Math.min(100 - selectedElement.width, newX)),
          y: Math.max(0, Math.min(100 - selectedElement.height, newY)),
        });
      } else if (dragAction.type === 'resize') {
        const deltaX = ((e.clientX - dragAction.startX) / canvasWidth) * 100;
        const deltaY = ((e.clientY - dragAction.startY) / canvasHeight) * 100;
        const { handle, origX, origY, origW, origH } = dragAction;
        let newX = origX;
        let newY = origY;
        let newW = origW;
        let newH = origH;

        if (handle.includes('e')) newW = Math.max(4, origW + deltaX);
        if (handle.includes('s')) newH = Math.max(3, origH + deltaY);
        if (handle.includes('w')) {
          const clampedDeltaX = Math.min(deltaX, origW - 4);
          newX = origX + clampedDeltaX;
          newW = origW - clampedDeltaX;
        }
        if (handle.includes('n')) {
          const clampedDeltaY = Math.min(deltaY, origH - 3);
          newY = origY + clampedDeltaY;
          newH = origH - clampedDeltaY;
        }

        onUpdateElement(selectedElement.id, {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
        });
      }
    };

    const handleMouseUp = () => {
      setDragAction(null);
      setActiveSnapLines({});
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragAction, selectedElement, onUpdateElement]);

  const handleStartMove = (e: React.MouseEvent, el: SlideElement) => {
    if (editingTextId === el.id) return;
    e.stopPropagation();
    onSelectElement(el.id);
    setDragAction({
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      origElX: el.x,
      origElY: el.y,
    });
  };

  const handleStartResize = (e: React.MouseEvent, handle: string, el: SlideElement) => {
    e.stopPropagation();
    setDragAction({
      type: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height,
    });
  };

  const renderShapeSvg = (el: SlideElement) => {
    const shapeType = el.style.shapeType || 'rectangle';
    const fill = el.style.backgroundColor || '#6366f1';
    const stroke = el.style.borderColor || 'transparent';
    const strokeWidth = el.style.borderWidth || 0;

    switch (shapeType) {
      case 'circle':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="50" rx="48" ry="48" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        );
      case 'triangle':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,4 96,96 4,96" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        );
      case 'arrow-right':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <polygon points="0,20 60,20 60,0 100,30 60,60 60,40 0,40" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        );
      case 'star':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,5 64,36 98,38 72,60 80,94 50,75 20,94 28,60 2,38 36,36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        );
      case 'diamond':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,2 98,50 50,98 2,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-8 select-none relative"
      onClick={() => {
        onSelectElement(null);
        setEditingTextId(null);
      }}
    >
      {/* Scaled 16:9 Presentation Canvas Container */}
      <div
        ref={containerRef}
        className="aspect-video relative shadow-2xl transition-transform duration-100 ease-out border border-slate-700/60 overflow-hidden"
        style={{
          width: `min(calc(100% - 32px), ${1280 * zoomScale}px)`,
          maxHeight: 'calc(100% - 32px)',
          background:
            slide.backgroundGradient && slide.backgroundGradient !== 'none'
              ? slide.backgroundGradient
              : slide.backgroundColor || '#0f172a',
        }}
      >
        {/* Dynamic Snap Guides */}
        {activeSnapLines.x !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-[1px] bg-sky-400 z-50 pointer-events-none shadow-[0_0_8px_#38bdf8]"
            style={{ left: `${activeSnapLines.x}%` }}
          />
        )}
        {activeSnapLines.y !== undefined && (
          <div
            className="absolute left-0 right-0 h-[1px] bg-sky-400 z-50 pointer-events-none shadow-[0_0_8px_#38bdf8]"
            style={{ top: `${activeSnapLines.y}%` }}
          />
        )}

        {/* Slide Elements */}
        {slide.elements.map((el) => {
          const isSelected = el.id === selectedElementId;
          const isEditing = editingTextId === el.id;
          const s = el.style || {};

          return (
            <div
              key={el.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(el.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (el.type === 'text') {
                  setEditingTextId(el.id);
                }
              }}
              onMouseDown={(e) => handleStartMove(e, el)}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                zIndex: el.zIndex || 1,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              }}
              className={`absolute cursor-move transition-shadow ${
                isSelected
                  ? 'ring-2 ring-indigo-500 shadow-xl z-30'
                  : 'hover:ring-1 hover:ring-indigo-400/40'
              }`}
            >
              {/* Element Content Box */}
              <div
                className="w-full h-full relative overflow-hidden flex flex-col"
                style={{
                  fontFamily: s.fontFamily,
                  fontSize: s.fontSize ? `${s.fontSize * zoomScale * 0.75}px` : undefined,
                  fontWeight: s.fontWeight,
                  fontStyle: s.fontStyle,
                  textDecoration: s.textDecoration,
                  textAlign: s.textAlign,
                  lineHeight: s.lineHeight || 1.3,
                  color: s.color,
                  backgroundColor:
                    s.shapeType && s.shapeType !== 'rectangle' && s.shapeType !== 'rounded'
                      ? 'transparent'
                      : s.backgroundColor,
                  borderColor: s.borderColor,
                  borderWidth: s.borderWidth ? `${s.borderWidth}px` : undefined,
                  borderStyle: s.borderStyle || 'solid',
                  borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
                  padding: s.padding ? `${s.padding * zoomScale * 0.75}px` : undefined,
                  opacity: s.opacity !== undefined ? s.opacity : 1,
                  boxShadow: s.shadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' : undefined,
                }}
              >
                {/* Text Content */}
                {el.type === 'text' && (
                  isEditing ? (
                    <textarea
                      autoFocus
                      defaultValue={el.content}
                      onBlur={(e) => {
                        onUpdateElement(el.id, { content: e.target.value });
                        setEditingTextId(null);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full h-full bg-transparent resize-none border-none outline-none text-inherit font-inherit"
                    />
                  ) : (
                    <div
                      className="w-full h-full whitespace-pre-wrap select-text cursor-text"
                      title="Double-click to edit text"
                    >
                      {el.content || 'Click to add text'}
                    </div>
                  )
                )}

                {/* Shape rendering */}
                {el.type === 'shape' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    {renderShapeSvg(el)}
                    {el.content && (
                      <span className="absolute inset-0 flex items-center justify-center p-2 text-center pointer-events-none">
                        {el.content}
                      </span>
                    )}
                  </div>
                )}

                {/* KPI Card */}
                {el.type === 'kpi' && el.kpiData && (
                  <div className="w-full h-full flex flex-col justify-between p-2">
                    <div
                      className="font-bold tracking-tight"
                      style={{
                        fontSize: `${(s.fontSize || 38) * zoomScale * 0.8}px`,
                        color: s.color || '#38bdf8',
                      }}
                    >
                      {el.kpiData.value}
                    </div>
                    <div className="text-sm font-semibold opacity-90 mt-1">
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

                {/* Code Block */}
                {el.type === 'code' && (
                  <pre className="w-full h-full font-mono text-xs overflow-auto m-0 p-3 leading-relaxed bg-slate-950/90 text-sky-300">
                    <code>{el.content}</code>
                  </pre>
                )}

                {/* Table Data */}
                {el.type === 'table' && el.tableData && (
                  <div className="w-full h-full overflow-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-600/50">
                          {el.tableData.headers.map((h, i) => (
                            <th
                              key={i}
                              className="p-2 font-bold bg-slate-800/40 text-slate-200"
                            >
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
                  </div>
                )}

                {/* Image Element */}
                {el.type === 'image' && (
                  <img
                    src={el.content || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
                    alt="Slide visual"
                    className="w-full h-full object-cover rounded pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* 8-Point Resize Handles & Rotation Handle when Selected */}
              {isSelected && (
                <>
                  {/* Rotation handle */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onUpdateElement(el.id, {
                        rotation: ((el.rotation || 0) + 15) % 360,
                      });
                    }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-indigo-500"
                    title="Rotate 15°"
                  >
                    <RotateCw className="w-3 h-3 text-white" />
                  </div>

                  {/* Corner handles */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, 'nw', el)}
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize z-40"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, 'ne', el)}
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize z-40"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, 'se', el)}
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize z-40"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, 'sw', el)}
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize z-40"
                  />

                  {/* Edge handles */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, 'n', el)}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-ns-resize z-40"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, 's', el)}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-ns-resize z-40"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, 'w', el)}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-ew-resize z-40"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, 'e', el)}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-ew-resize z-40"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
