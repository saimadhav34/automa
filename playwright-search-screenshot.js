#!/usr/bin/env node

const { chromium } = require('playwright');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    url: undefined,
    query: undefined,
    output: 'screenshot.png',
    headless: true,
  };

  for (const arg of args) {
    if (arg.startsWith('--url=')) opts.url = arg.slice('--url='.length);
    else if (arg.startsWith('--query=')) opts.query = arg.slice('--query='.length);
    else if (arg.startsWith('--output=')) opts.output = arg.slice('--output='.length);
    else if (arg === '--headed') opts.headless = false;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node playwright-search-screenshot.js --url=<url> --query=<text> [--output=path] [--headed]\n\nOptions:\n  --url=<url>       URL to open\n  --query=<text>    Text to search (typed after Ctrl+F)\n  --output=<path>   Screenshot output path (default: screenshot.png)\n  --headed           Run with browser UI (non-headless)\n`);
      process.exit(0);
    }
  }

  if (!opts.url || !opts.query) {
    console.error('Error: --url and --query are required. Use --help for usage.');
    process.exit(1);
  }

  return opts;
}

async function run() {
  const opts = parseArgs();

  const browser = await chromium.launch({ headless: opts.headless });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log(`Navigating to ${opts.url}`);
  await page.goto(opts.url, { waitUntil: 'domcontentloaded' });

  // Give the page a moment to settle.
  await page.waitForTimeout(1000);

  console.log('Triggering browser find (Ctrl+F) and typing query...');
  // Some browsers may not allow Ctrl+F in headless, but this is the requested flow.
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyF');
  await page.keyboard.up('Control');
  await page.keyboard.type(opts.query);

  // Wait a moment to allow the find UI to show / results to highlight.
  await page.waitForTimeout(1000);

  console.log(`Taking screenshot: ${opts.output}`);
  await page.screenshot({ path: opts.output, fullPage: true });

  await browser.close();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
