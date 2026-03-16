# Automa

A simple Chrome extension that opens 8 configured URLs in tabs.

## Run the extension locally

1. Load as an unpacked extension in Chrome/Edge:
   - Go to `chrome://extensions`
   - Enable Developer mode
   - Click **Load unpacked** and select this repository folder

2. Set the 8 URLs in Options.
3. Click the toolbar icon or press **Ctrl+Shift+8** to open them.

---

## Playwright screenshot helper (local)

This repo includes a small local server that uses Playwright to:
- open a provided URL
- trigger a `Ctrl+F` search in the page
- take a full-page screenshot

### Start the helper server

```bash
npm install
npm run server
```

### Use it from the extension

1. Open the extension options page.
2. Fill in **URL** and **Search text**.
3. Click **Take screenshot**.

The extension will call `http://localhost:3000/screenshot` and display the screenshot.
