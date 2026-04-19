document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-add-signal").onclick = addSignalFromPage;
  document.getElementById("btn-open-viewer").onclick = openViewer;
});

function addSignalFromPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { type: "REQUEST_SIGNAL_FROM_PAGE" }, (signal) => {
      if (!signal) return;
      chrome.runtime.sendMessage({ type: "CIVIC_SIGNAL", payload: signal }, (res) => {
        window.close();
      });
    });
  });
}

async function openViewer() {
  const res = await fetch(chrome.runtime.getURL("config/substrate-extension-config.json"));
  const cfg = await res.json();
  if (cfg.viewer_url) {
    chrome.tabs.create({ url: cfg.viewer_url });
  }
}
