function guessCivicTitle() {
  const og = document.querySelector('meta[property="og:title"]');
  if (og && og.content) return og.content;
  if (document.title) return document.title;
  return window.location.hostname;
}

function buildSignalFromPage() {
  return {
    id: `ext-${Date.now()}`,
    source: "extension",
    kind: "page-observation",
    title: guessCivicTitle(),
    location: "",
    tags: [],
    linked_topic: null,
    linked_proposal: null,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };
}

import { initP2P, publishDelta } from "./p2p.js";

// Start P2P when the content script loads
const p2p = initP2P();

// Optional: expose publishDelta for UI buttons or devtools
window.wcoPublishDelta = publishDelta;


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "REQUEST_SIGNAL_FROM_PAGE") {
    sendResponse(buildSignalFromPage());
  }
});
