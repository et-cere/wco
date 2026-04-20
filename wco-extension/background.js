// background.js - WCO Civic Substrate Extension

let config = {
  enable_intelligence: false,
  intel_bundle_url: null,
  viewer_url: null,
};

chrome.runtime.onInstalled.addListener(() => {
  loadConfig();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CIVIC_SIGNAL") {
    handleCivicSignal(msg.payload);
    sendResponse({ ok: true });
  }
});

async function loadConfig() {
  try {
    const res = await fetch(chrome.runtime.getURL("substrate/substrate-extension-config.json"));
    if (res.ok) {
      config = await res.json();
      if (config.enable_intelligence && config.intel_bundle_url) {
        await loadIntelBundle(config.intel_bundle_url);
      }
    }
  } catch (e) {
    console.warn("[WCO Extension] Config load failed, using defaults.");
  }
}

async function loadIntelBundle(url) {
  try {
    const res = await fetch(url);
    const code = await res.text();
    // eslint-disable-next-line no-eval
    eval(code);
    console.log("[WCO Extension] Intelligence layer loaded.");
  } catch (e) {
    console.warn("[WCO Extension] Failed to load intel bundle:", e);
  }
}

async function handleCivicSignal(signal) {
  if (!signal) return;

  // 1. Save to local storage
  chrome.storage.local.get({ civicPulse: [] }, (result) => {
    const updated = [...result.civicPulse, signal];
    chrome.storage.local.set({ civicPulse: updated });
  });

  // 2. Try to forward to any open viewer tab (more reliable)
  const tabs = await chrome.tabs.query({});

  let forwarded = false;

  for (const tab of tabs) {
    if (!tab.id) continue;

    const isLikelyViewer = 
      tab.url?.includes("civic-substrate") || 
      tab.url?.includes("wco") || 
      tab.url?.includes("index.html") ||
      tab.url?.startsWith("chrome-extension://" + chrome.runtime.id);

    if (isLikelyViewer) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: "NEW_CIVIC_SIGNAL",
          signal: signal
        });
        console.log(`[WCO] Signal forwarded to viewer tab ${tab.id}`);
        forwarded = true;
        break;   // only send to first matching tab
      } catch (err) {
        // tab not listening — continue
      }
    }
  }

  if (!forwarded) {
    console.log("[WCO] Signal saved locally (no viewer tab open)");
  }
}