import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import getColors from 'get-image-colors';
import fs from 'fs/promises';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

// Image upload and color palette extraction endpoint
app.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  try {
    const colors = await getColors(req.file.buffer, req.file.mimetype);
    const palette = colors.map(c => c.rgb());
    // Safely format palette colors
    const safePalette = palette.map(rgb => Array.isArray(rgb) ? `rgb(${rgb.join(',')})` : String(rgb));
    const [primary, secondary, tertiary, ...rest] = safePalette;
    return res.json({
      palette: { primary, secondary, tertiary, others: rest }
    });
  } catch (err) {
    console.error('Image analysis error:', err);
    return res.status(500).json({ error: 'Failed to analyze image', details: err.message });
  }
});

// Helper: Extract fonts from page
async function extractFonts(page) {
  return await page.evaluate(() => {
    const fontSet = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const el = walker.currentNode;
      const style = window.getComputedStyle(el);
      fontSet.add(style.fontFamily);
    }
    return Array.from(fontSet);
  });
}

// Analyze endpoint
app.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.setViewport({ width: 1280, height: 800 });
    // Screenshot
    const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 80, fullPage: true });
    // Color analysis (in-memory, no temp file)
    const colors = await getColors(screenshotBuffer, 'image/jpeg');
    const palette = colors.map(c => c.rgb());
    // Font extraction
    const fonts = await extractFonts(page);
    // Clean up

    await browser.close();
    // Debug palette
    console.log('Palette:', palette);
    // Safely format palette colors
    const safePalette = palette.map(rgb => Array.isArray(rgb) ? `rgb(${rgb.join(',')})` : String(rgb));
    const [primary, secondary, tertiary, ...rest] = safePalette;
    return res.json({
      palette: { primary, secondary, tertiary, others: rest },
      fonts
    });
  } catch (err) {
    console.error('Analysis error:', err);
    if (browser) await browser.close();
    return res.status(500).json({ error: 'Failed to analyze site', details: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
