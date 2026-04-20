// p2p/webrtc.js
// Minimal WebRTC P2P broadcast layer.
// Signaling is intentionally left as TODO.

export class P2PWebRTC {
  constructor({ onDelta }) {
    this.onDelta = onDelta;
    this.peers = new Set();

    // No signaling yet — future extension point.
    console.log("[P2P] WebRTC layer ready (signaling not implemented).");
  }

  // Broadcast a delta to all connected peers
  broadcast(delta) {
    const msg = JSON.stringify(delta);
    for (const peer of this.peers) {
      if (peer.readyState === "open") {
        peer.send(msg);
      }
    }
  }

  // Called when a peer connection is established
  addPeerConnection(pc) {
    const channel = pc.createDataChannel("delta");
    channel.onopen = () => this.peers.add(channel);
    channel.onclose = () => this.peers.delete(channel);

    channel.onmessage = (ev) => {
      try {
        const delta = JSON.parse(ev.data);
        this.onDelta?.(delta);
      } catch (e) {
        console.warn("[P2P] Invalid delta received:", e);
      }
    };
  }
}
