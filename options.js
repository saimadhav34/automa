const DEFAULT_STATE = {
  urls: ["", "", "", "", "", "", "", ""],
  openInNewWindow: false,
  openActiveIndex: 0
};

function normalizeUrl(input) {
  if (!input) return null;
  const v = input.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function isValidUrl(s) {
  try { new URL(s); return true; } catch { return false; }
}

async function getState() {
  const data = await chrome.storage.sync.get(DEFAULT_STATE);
  return { ...DEFAULT_STATE, ...data };
}

async function setState(state) {
  await chrome.storage.sync.set(state);
}

function createInputs(container, values) {
  container.innerHTML = "";
  values.forEach((val, idx) => {
    const label = document.createElement("label");
    label.textContent = idx + 1;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "https://example.com";
    input.value = val || "";

    container.appendChild(label);
    container.appendChild(input);
  });
}

async function restore() {
  const state = await getState();
  const grid = document.getElementById("inputs");
  createInputs(grid, state.urls);
  document.getElementById("openInNewWindow").checked = state.openInNewWindow;
  document.getElementById("activeIndex").value = state.openActiveIndex;
}

function readInputs() {
  const grid = document.getElementById("inputs");
  const inputs = Array.from(grid.querySelectorAll("input[type='text']"));
  return inputs.map(i => i.value.trim());
}

function showSaved() {
  const el = document.getElementById("savedMsg");
  el.style.visibility = "visible";
  setTimeout(() => (el.style.visibility = "hidden"), 1200);
}

function showError(msg) {
  const box = document.getElementById("errorBox");
  box.textContent = msg;
  box.style.display = "block";
}

function clearError() {
  const box = document.getElementById("errorBox");
  box.style.display = "none";
  box.textContent = "";
}

document.getElementById("save").addEventListener("click", async () => {
  clearError();

  const raw = readInputs();
  if (raw.length !== 8) {
    showError("Please provide exactly 8 URLs.");
    return;
  }

  const normalized = raw.map(normalizeUrl);
  if (normalized.some(v => !v || !isValidUrl(v))) {
    showError("One or more URLs look invalid. Include a domain (we add https:// if missing).");
    return;
  }

  const openInNewWindow = document.getElementById("openInNewWindow").checked;
  const openActiveIndex = parseInt(document.getElementById("activeIndex").value, 10) || 0;

  await setState({
    urls: normalized,
    openInNewWindow,
    openActiveIndex: Math.min(Math.max(openActiveIndex, 0), 7)
  });

  showSaved();
});

document.getElementById("openNow").addEventListener("click", async () => {
  try {
    await chrome.runtime.sendMessage({ type: "OPEN_NOW" });
  } catch {}
});

restore();