// p2p/merge.js
// Minimal delta merge helper for P2P updates.

export async function applyDeltaToState(delta, target) {
  if (!delta || typeof delta !== "object") return;

  for (const [key, value] of Object.entries(delta)) {
    if (Array.isArray(value)) {
      // Replace entire collection
      target[key] = value;
    } else if (value && typeof value === "object") {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      Object.assign(target[key], value);
    } else {
      target[key] = value;
    }
  }
}
