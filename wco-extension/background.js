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

  // 1. Store locally (existing behavior)
  chrome.storage.local.get({ civicPulse: [] }, (data) => {
    const updated = data.civicPulse.concat([signal]);
    chrome.storage.local.set({ civicPulse: updated });
  });

  // 2. Forward to open viewer tab (new tight integration)
  try {
    const tabs = await chrome.tabs.query({ url: "*://*/*" }); // broad search

    for (const tab of tabs) {
      if (tab.url && tab.url.includes("civic-substrate") || tab.url.includes("your-domain.example")) { 
        // Adjust the condition to match your viewer_url or index.html path
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: "NEW_CIVIC_SIGNAL",
            signal: signal
          });
          console.log("[WCO Extension] Signal forwarded to viewer tab:", tab.id);
          break; // send to first matching viewer
        } catch (e) {
          // tab not listening or closed
        }
      }
    }
  } catch (e) {
    console.log("[WCO Extension] No open viewer tab found (that's ok).");
  }

  console.log("[WCO Extension] Civic signal captured:", signal.title || signal.id);
}