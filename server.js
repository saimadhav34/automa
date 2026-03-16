const express = require('express');
const cors = require('cors');
const path = require('path');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.post('/screenshot', async (req, res) => {
  const { url, query } = req.body || {};
  if (!url || !query) {
    return res.status(400).json({ error: 'Missing required fields: url and query' });
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.keyboard.down('Control');
    await page.keyboard.press('KeyF');
    await page.keyboard.up('Control');
    await page.keyboard.type(query);

    await page.waitForTimeout(500);
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    await browser.close();

    res.json({
      success: true,
      screenshot: screenshotBuffer.toString('base64'),
      width: 1280,
      height: 800,
    });
  } catch (error) {
    console.error('Screenshot error', error);
    res.status(500).json({ error: error.message || 'Failed to take screenshot' });
  }
});

app.get('/', (req, res) => {
  res.send('Automa Playwright API is running. POST /screenshot with {url,query}');
});

app.listen(PORT, () => {
  console.log(`Automa Playwright server running on http://localhost:${PORT}`);
});
