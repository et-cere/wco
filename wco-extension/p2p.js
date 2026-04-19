// wco-extension/p2p.js
// Single-file P2P bridge for the WCO extension → civic substrate

import { P2PWebRTC } from "./webrtc.js";   // your existing WebRTC helper

let p2p = null;

// Initialize P2P and connect to peers
export function initP2P() {
  p2p = new P2PWebRTC({
    onDelta: (delta) => {
      console.log("[WCO EXT] Incoming delta:", delta);

      // Forward to substrate if available
      if (window.applyDelta) {
        window.applyDelta(delta);
      } else {
        console.warn("[WCO EXT] Substrate not ready for delta");
      }
    }
  });

  console.log("[WCO EXT] P2P initialized");
  return p2p;
}

// Publish an update to all peers
export function publishDelta(delta) {
  if (!p2p) {
    console.warn("[WCO EXT] P2P not initialized");
    return;
  }
  if (!delta || typeof delta !== "object") {
    console.warn("[WCO EXT] Invalid delta");
    return;
  }

  console.log("[WCO EXT] Broadcasting delta:", delta);
  p2p.broadcast(delta);
}
