import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization adhering to @google/genai guidelines
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Route: AI Slide Deck Generator
app.post('/api/ai/generate-deck', async (req, res) => {
  try {
    const { topic, audience, slideCount = 5, style = 'professional' } = req.body;

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Please provide a topic for the slide deck.' });
      return;
    }

    if (!ai) {
      // Fallback structured starter if API key is not configured
      const fallbackDeck = {
        title: topic,
        slides: [
          {
            title: topic,
            layout: 'title',
            notes: 'Welcome everyone. Today we are exploring ' + topic + '.',
            elements: [
              {
                id: 'e1',
                type: 'text',
                x: 10,
                y: 35,
                width: 80,
                height: 25,
                content: topic,
                style: {
                  fontSize: 54,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#ffffff',
                },
              },
              {
                id: 'e2',
                type: 'text',
                x: 15,
                y: 62,
                width: 70,
                height: 15,
                content: `An in-depth presentation crafted for ${audience || 'stakeholders and teams'}`,
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
      res.json({ deck: fallbackDeck, generatedWith: 'template' });
      return;
    }

    const prompt = `Create a high-impact presentation deck about: "${topic}".
Target audience: "${audience || 'General professional audience'}".
Total slides desired: ${Math.min(Math.max(slideCount, 3), 8)}.
Style: "${style}".

For each slide, return:
- title: concise slide header
- layout: one of ["title", "title-content", "two-column", "kpi", "quote"]
- notes: clear presenter notes for the speaker
- elements: array of visual and text elements with relative percentage positions (x: 0-100, y: 0-100, width: 0-100, height: 0-100) and styling.
Make sure the slide designs look polished, well-spaced, with strong typographic contrast.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a master presentation designer and PowerPoint expert. Output structured JSON matching the requested schema with visually compelling, modern slide content.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            theme: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  layout: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  elements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING }, // text, shape, table, kpi
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER },
                        content: { type: Type.STRING },
                        style: {
                          type: Type.OBJECT,
                          properties: {
                            fontSize: { type: Type.NUMBER },
                            fontWeight: { type: Type.STRING },
                            textAlign: { type: Type.STRING },
                            color: { type: Type.STRING },
                            backgroundColor: { type: Type.STRING },
                            borderColor: { type: Type.STRING },
                            borderRadius: { type: Type.NUMBER },
                            shapeType: { type: Type.STRING },
                          },
                        },
                      },
                      required: ['id', 'type', 'x', 'y', 'width', 'height', 'content'],
                    },
                  },
                },
                required: ['title', 'layout', 'notes', 'elements'],
              },
            },
          },
          required: ['title', 'slides'],
        },
      },
    });

    const parsedDeck = JSON.parse(response.text || '{}');
    res.json({ deck: parsedDeck, generatedWith: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('AI Slide Generation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate presentation deck' });
  }
});

// API Route: AI Text Enhancer & Bullet Formatter
app.post('/api/ai/enhance-text', async (req, res) => {
  try {
    const { text, action = 'concise' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required.' });
      return;
    }

    if (!ai) {
      res.json({ enhancedText: text });
      return;
    }

    let instruction = 'Improve this slide text for maximum presentation clarity.';
    if (action === 'bullets') {
      instruction = 'Convert this paragraph into 3-4 punchy, executive-level presentation bullet points with bold leading phrases.';
    } else if (action === 'concise') {
      instruction = 'Shorten this text to be ultra-concise, memorable, and impactful for a presentation slide.';
    } else if (action === 'professional') {
      instruction = 'Refine this text to sound polished, authoritative, and boardroom-ready.';
    } else if (action === 'notes') {
      instruction = 'Write engaging, spoken conversational speaker notes explaining this slide content to an audience.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${instruction}\n\nOriginal Text:\n${text}`,
    });

    res.json({ enhancedText: (response.text || text).trim() });
  } catch (err: any) {
    console.error('AI Text Enhancement Error:', err);
    res.status(500).json({ error: err.message || 'Failed to enhance text' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SlideCraft Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
