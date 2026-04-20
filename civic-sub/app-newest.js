// app.js — minimal civic substrate with dynamic relations + optional extension hooks

import { buildRelations } from "./engine/relations-builder.js";

const state = {
  data: {},
  ui: {
    initialized: false
  }
};

// --- Data loading ---------------------------------------------------------

const DATA_FILES = [
  "actors",
  "topics",
  "proposals",
  "processes",
  "decisions",
  "comments",
  "votes",
  "amendments",
  "petitions",
  "documents",
  "events",
  "budget",
  "civic-pulse",
  "wco-stressors"
];

function normalizeKey(name) {
  if (name === "civic-pulse") return "civicPulse";
  if (name === "wco-stressors") return "wcoStressors";
  return name;
}

async function loadDataBundle() {
  const bundle = {};

  for (const name of DATA_FILES) {
    const key = normalizeKey(name);
    const url = `./data/${name}.json`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Failed to load ${url}:`, res.status);
        bundle[key] = [];
        continue;
      }
      const json = await res.json();
      bundle[key] = Array.isArray(json) ? json : (json || []);
    } catch (err) {
      console.warn(`Error loading ${url}:`, err);
      bundle[key] = [];
    }
  }

  return bundle;
}

// --- Relations + delta application ---------------------------------------

function recomputeRelations() {
  // Assumes buildRelations accepts the full data bundle
  state.data.relations = buildRelations(state.data);
}

function applyDelta(target, delta) {
  // Minimal, generic merge strategy; extension can choose to override
  if (!delta || typeof delta !== "object") return;

  for (const [key, value] of Object.entries(delta)) {
    if (Array.isArray(value)) {
      // Replace whole collection by default
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

// --- Rendering ------------------------------------------------------------

function render() {
  // Minimal placeholder; keep your existing UI wiring here.
  // Example: render topics, proposals, etc. into the DOM.
  if (!state.ui.initialized) {
    state.ui.initialized = true;
  }

  // You can keep or adapt your existing render logic:
  // - read from state.data.*
  // - use state.data.relations to show connections
  // For now, we just log to make behavior visible.
  console.log("Civic substrate render:", {
    counts: {
      actors: state.data.actors?.length || 0,
      topics: state.data.topics?.length || 0,
      proposals: state.data.proposals?.length || 0,
      relations: state.data.relations?.length || 0
    }
  });
}

// --- Initialization -------------------------------------------------------

async function init() {
  state.data = await loadDataBundle();
  recomputeRelations();
  render();
}

// --- Optional extension / P2P hooks --------------------------------------

if (typeof window !== "undefined") {
  // Expose substrate state for the extension (read-only by convention)
  window.substrate = state;

  // Allow the extension (or any external script) to apply deltas
  window.applyDelta = function (delta) {
    applyDelta(state.data, delta);
    recomputeRelations();
    render();
  };

  // Allow explicit relations rebuild (e.g., after custom mutations)
  window.rebuildRelations = function () {
    recomputeRelations();
    render();
  };

  // Optional: extension can register its own P2P handler here, e.g.:
  // window.registerP2PHandler = function (onDelta) {
  //   // extension calls onDelta(delta) when new data arrives
  // };

  // Kick off the substrate once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
} else {
  // Non-browser context (if ever used)
  init();
}
