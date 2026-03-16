// Helper: sanitize & normalize a URL (adds https:// if missing).
function normalizeUrl(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If user typed something like "example.com", prefix https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  try {
    // Validate URL format
    new URL(trimmed);
    return trimmed;
  } catch (_) {
    return null;
  }
}

const DEFAULT_STATE = {
  urls: ["", "", "", "", "", "", "", ""], // 8 placeholders
  openInNewWindow: false, // easy to extend later if you want this toggle
  openActiveIndex: 0       // which tab becomes active (0..7)
};

async function getState() {
  const data = await chrome.storage.sync.get(DEFAULT_STATE);
  // If sync is not available, this still works locally
  // Ensure structure integrity in case of partial storage
  return { ...DEFAULT_STATE, ...data };
}

async function setState(state) {
  await chrome.storage.sync.set(state);
}

async function openAllPages() {
  const state = await getState();
  const normalized = state.urls.map(normalizeUrl).filter(Boolean);

  // If nothing configured yet, open the Options page to collect URLs.
  if (normalized.length < 8) {
    await chrome.runtime.openOptionsPage();
    return;
  }

  if (state.openInNewWindow) {
    // Open in a brand-new window with all tabs
    await chrome.windows.create({ url: normalized, focused: true });
  } else {
    // Open in current window as new tabs
    const current = await chrome.windows.getCurrent();
    for (let i = 0; i < normalized.length; i++) {
      await chrome.tabs.create({
        windowId: current.id,
        url: normalized[i],
        active: i === state.openActiveIndex
      });
    }
  }
}

// When the extension icon is clicked, open all pages.
chrome.action.onClicked.addListener(openAllPages);

// Keyboard shortcut support
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-all") {
    openAllPages();
  }
});

// Initialize defaults on install/update if needed
chrome.runtime.onInstalled.addListener(async () => {
  const current = await getState();
  // If first install (all blanks), keep defaults; options page will appear on first click.
  // You could also automatically open options page now if you prefer:
  // await chrome.runtime.openOptionsPage();
});
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "OPEN_NOW") openAllPages();
});