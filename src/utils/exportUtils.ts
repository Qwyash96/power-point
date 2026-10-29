import { PresentationDeck } from '../types';

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportDeckToJson(deck: PresentationDeck) {
  const json = JSON.stringify(deck, null, 2);
  const cleanTitle = (deck.title || 'presentation')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  downloadFile(json, `${cleanTitle}.slidecraft`, 'application/json');
}

export function importDeckFromJson(file: File): Promise<PresentationDeck> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.slides || !Array.isArray(parsed.slides)) {
          throw new Error('Invalid presentation file structure: missing slides array.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read presentation file.'));
    reader.readAsText(file);
  });
}

export function triggerPrintPdf() {
  window.print();
}

/**
 * Generates a completely self-contained, offline-ready HTML presentation.
 * Can be opened in any web browser with full interactive keyboard controls!
 */
export function exportToStandaloneHtml(deck: PresentationDeck) {
  const safeTitle = deck.title || 'SlideCraft Presentation';
  const slidesData = JSON.stringify(deck.slides);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — SlideCraft</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Outfit:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #020617;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    #stage-container {
      width: 100vw;
      height: 56.25vw; /* 16:9 */
      max-height: 100vh;
      max-width: 177.78vh;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      background: #090d16;
      overflow: hidden;
    }
    .slide-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .slide-wrapper.active {
      opacity: 1;
      pointer-events: auto;
      transform: translate3d(0, 0, 0) !important;
      z-index: 10;
    }
    .slide-wrapper.slide-exit-forward {
      opacity: 0;
      transform: translate3d(-100%, 0, 0);
    }
    .slide-wrapper.slide-exit-backward {
      opacity: 0;
      transform: translate3d(100%, 0, 0);
    }
    .slide-wrapper.slide-enter-forward {
      transform: translate3d(100%, 0, 0);
    }
    .slide-wrapper.slide-enter-backward {
      transform: translate3d(-100%, 0, 0);
    }
    .slide-canvas {
      width: 1920px;
      height: 1080px;
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: top left;
      overflow: hidden;
    }
    .element-box {
      position: absolute;
      overflow: hidden;
      word-break: break-word;
    }
    /* Controls Bar */
    #deck-controls {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      padding: 6px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 14px;
      z-index: 1000;
      opacity: 0.3;
      transition: opacity 0.2s ease;
    }
    #deck-controls:hover { opacity: 1; }
    button.ctrl-btn {
      background: transparent;
      border: none;
      color: #cbd5e1;
      font-size: 16px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }
    button.ctrl-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    #notes-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.95);
      border-top: 2px solid #3b82f6;
      padding: 20px 40px;
      max-height: 250px;
      overflow-y: auto;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      z-index: 999;
    }
    #notes-drawer.open { transform: translateY(0); }
    #blackout-overlay {
      position: fixed;
      inset: 0;
      background: black;
      z-index: 9999;
      display: none;
    }
  </style>
</head>
<body>
  <div id="blackout-overlay"></div>
  <div id="stage-container">
    <div id="canvas-scaler"></div>
  </div>

  <div id="deck-controls">
    <button class="ctrl-btn" onclick="prevSlide()" title="Previous (Left Arrow)">◀</button>
    <span id="slide-num" style="font-variant-numeric: tabular-nums;">1 / 1</span>
    <button class="ctrl-btn" onclick="nextSlide()" title="Next (Right Arrow / Space)">▶</button>
    <button class="ctrl-btn" onclick="toggleFullscreen()" title="Fullscreen (F)">⛶</button>
    <button class="ctrl-btn" onclick="toggleNotes()" title="Speaker Notes (N)">Notes</button>
  </div>

  <div id="notes-drawer">
    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px;">Speaker Notes</div>
    <div id="notes-content" style="font-size: 16px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;"></div>
  </div>

  <script>
    const slides = ${slidesData};
    let currentIdx = 0;
    const scaler = document.getElementById('canvas-scaler');
    const container = document.getElementById('stage-container');
    const numDisplay = document.getElementById('slide-num');
    const notesContent = document.getElementById('notes-content');
    const notesDrawer = document.getElementById('notes-drawer');
    const blackout = document.getElementById('blackout-overlay');

    function renderDeck() {
      scaler.innerHTML = '';
      slides.forEach((slide, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'slide-wrapper' + (idx === currentIdx ? ' active' : '');
        wrap.id = 'slide-' + idx;

        const canvas = document.createElement('div');
        canvas.className = 'slide-canvas';
        if (slide.backgroundGradient && slide.backgroundGradient !== 'none') {
          canvas.style.background = slide.backgroundGradient;
        } else if (slide.backgroundColor) {
          canvas.style.background = slide.backgroundColor;
        }

        (slide.elements || []).forEach(el => {
          const elDiv = document.createElement('div');
          elDiv.className = 'element-box';
          elDiv.style.left = (el.x / 100 * 1920) + 'px';
          elDiv.style.top = (el.y / 100 * 1080) + 'px';
          elDiv.style.width = (el.width / 100 * 1920) + 'px';
          elDiv.style.height = (el.height / 100 * 1080) + 'px';
          elDiv.style.zIndex = el.zIndex || 1;
          if (el.rotation) elDiv.style.transform = 'rotate(' + el.rotation + 'deg)';

          const s = el.style || {};
          if (s.fontSize) elDiv.style.fontSize = s.fontSize + 'px';
          if (s.fontFamily) elDiv.style.fontFamily = s.fontFamily;
          if (s.fontWeight) elDiv.style.fontWeight = s.fontWeight;
          if (s.fontStyle) elDiv.style.fontStyle = s.fontStyle;
          if (s.textAlign) elDiv.style.textAlign = s.textAlign;
          if (s.color) elDiv.style.color = s.color;
          if (s.backgroundColor) elDiv.style.backgroundColor = s.backgroundColor;
          if (s.borderColor) elDiv.style.borderColor = s.borderColor;
          if (s.borderWidth) elDiv.style.borderWidth = s.borderWidth + 'px';
          if (s.borderWidth) elDiv.style.borderStyle = s.borderStyle || 'solid';
          if (s.borderRadius) elDiv.style.borderRadius = s.borderRadius + 'px';
          if (s.padding) elDiv.style.padding = s.padding + 'px';
          if (s.lineHeight) elDiv.style.lineHeight = s.lineHeight;

          if (el.type === 'text') {
            elDiv.innerHTML = (el.content || '').replace(/\\n/g, '<br/>');
          } else if (el.type === 'kpi' && el.kpiData) {
            elDiv.innerHTML = '<div style="font-size: 48px; font-weight: bold; color: ' + (s.color || '#3b82f6') + '">' + el.kpiData.value + '</div>' +
              '<div style="font-size: 20px; font-weight: 600; margin-top: 6px;">' + el.kpiData.label + '</div>' +
              '<div style="font-size: 14px; opacity: 0.7; margin-top: 4px;">' + (el.kpiData.subtext || '') + '</div>' +
              (el.kpiData.trend ? '<div style="display:inline-block; margin-top: 10px; font-size: 13px; font-weight: bold; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 8px; border-radius: 4px;">' + el.kpiData.trend + '</div>' : '');
          } else if (el.type === 'code') {
            elDiv.innerHTML = '<pre style="font-family: JetBrains Mono, monospace; font-size: inherit; margin: 0; white-space: pre-wrap;"><code>' + (el.content || '') + '</code></pre>';
          } else if (el.type === 'table' && el.tableData) {
            let tHtml = '<table style="width: 100%; border-collapse: collapse; font-size: inherit;"><thead><tr>';
            (el.tableData.headers || []).forEach(h => {
              tHtml += '<th style="border-bottom: 2px solid rgba(255,255,255,0.2); padding: 8px 12px; text-align: left; font-weight: bold;">' + h + '</th>';
            });
            tHtml += '</tr></thead><tbody>';
            (el.tableData.rows || []).forEach(r => {
              tHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">';
              r.forEach(c => {
                tHtml += '<td style="padding: 8px 12px;">' + c + '</td>';
              });
              tHtml += '</tr>';
            });
            tHtml += '</tbody></table>';
            elDiv.innerHTML = tHtml;
          } else if (el.type === 'shape') {
            elDiv.innerHTML = el.content ? el.content.replace(/\\n/g, '<br/>') : '';
          }

          canvas.appendChild(elDiv);
        });

        wrap.appendChild(canvas);
        scaler.appendChild(wrap);
      });
      updateScale();
      updateSlideDisplay();
    }

    function updateScale() {
      const containerW = container.clientWidth;
      const scale = containerW / 1920;
      document.querySelectorAll('.slide-canvas').forEach(c => {
        c.style.transform = 'scale(' + scale + ')';
      });
    }

    function updateSlideDisplay() {
      document.querySelectorAll('.slide-wrapper').forEach((w, idx) => {
        w.classList.toggle('active', idx === currentIdx);
      });
      numDisplay.textContent = (currentIdx + 1) + ' / ' + slides.length;
      notesContent.textContent = slides[currentIdx]?.notes || 'No speaker notes for this slide.';
    }

    function nextSlide() {
      if (currentIdx < slides.length - 1) {
        currentIdx++;
        updateSlideDisplay();
      }
    }

    function prevSlide() {
      if (currentIdx > 0) {
        currentIdx--;
        updateSlideDisplay();
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    function toggleNotes() {
      notesDrawer.classList.toggle('open');
    }

    window.addEventListener('resize', updateScale);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        toggleNotes();
      } else if (e.key === 'b' || e.key === 'B') {
        blackout.style.display = blackout.style.display === 'block' ? 'none' : 'block';
      }
    });

    renderDeck();
  </script>
</body>
</html>`;

  const cleanTitle = (deck.title || 'presentation')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  downloadFile(html, `${cleanTitle}.html`, 'text/html');
}
