<!-- app.js -->
<script>
// app.js - Civic Substrate Viewer with P2P support

let p2p = {
  webrtc: null,
  merge: null,
};

(async function initP2P() {
  try {
    const base = chrome?.runtime?.getURL?.("") || "./";
    
    const [{ P2PWebRTC }, { applyDeltaToState }] = await Promise.all([
      import(`${base}p2p/webrtc.js`),
      import(`${base}p2p/merge.js`),
    ]);

    p2p.merge = applyDeltaToState;
    p2p.webrtc = new P2PWebRTC({
      onDelta: async (delta) => {
        await p2p.merge(delta, state.data);
        if (state.currentView) setView(state.currentView);
      },
    });

    console.log("[P2P] WebRTC + merge initialized successfully.");
  } catch (e) {
    console.log("[P2P] Optional P2P modules not available or failed to load.", e);
  }
})();

// Simple shared state (aligned with substrate)
const state = {
  data: {
    topics: [],
    proposals: [],
    actors: [],
    processes: [],
    decisions: [],
    civicPulse: [],
    wcoStressors: [],
  },
  currentView: null,
  selectedItem: null,
};

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireHeaderButtons();
  loadInitialData();

  // Listen for messages from the extension
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "NEW_CIVIC_SIGNAL") {
        broadcastSignal(msg.signal);
      }
    });
  }
});

function wireNav() {
  const buttons = document.querySelectorAll(".nav-item");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      setView(view);
    });
  });
}

function wireHeaderButtons() {
  document.getElementById("btn-import-json").onclick = () => {
    document.getElementById("file-input").click();
  };
  document.getElementById("file-input").onchange = handleFileImport;

  document.getElementById("btn-run-engine").onclick = () => {
    alert("Generative engine would run here (linking, clustering, WCO slots, etc.).");
  };

  document.getElementById("btn-export").onclick = () => {
    const snapshot = JSON.stringify(state.data, null, 2);
    const blob = new Blob([snapshot], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "civic-substrate-snapshot.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    if (state.currentView && viewRenderers[state.currentView]?.onSearch) {
      viewRenderers[state.currentView].onSearch(searchInput.value.trim());
    }
  });
}

async function loadInitialData() {
  const files = [
    "topics", "proposals", "actors", "processes", "decisions",
    "civic-pulse", "wco-stressors"
  ];

  for (const key of files) {
    try {
      const res = await fetch(`data/${key}.json`);
      if (res.ok) {
        const data = await res.json();
        state.data[normalizeKey(key)] = data;
      }
    } catch (e) {
      // Silent fail for missing optional files
    }
  }

  setView("topics");
}

function normalizeKey(k) {
  if (k === "civic-pulse") return "civicPulse";
  if (k === "wco-stressors") return "wcoStressors";
  return k;
}

// === BROADCAST NEW SIGNAL (called by extension) ===
async function broadcastSignal(signal) {
  if (!signal) return;

  // Add locally to substrate state
  state.data.civicPulse = state.data.civicPulse || [];
  state.data.civicPulse.unshift(signal); // newest first

  // Broadcast via P2P if available
  if (p2p.webrtc) {
    const delta = {
      id: `delta-${Date.now()}`,
      kind: "civic-signal",
      payload: signal,
      meta: {
        source: "extension",
        timestamp: new Date().toISOString(),
        channel: "webrtc",
        hash: "sha256-todo",           // TODO: compute real hash
        parent_snapshot: null
      },
      signature: {
        public_key: "arty-main",     // TODO: real key later
        signature: "todo-signature"
      }
    };
    p2p.webrtc.broadcastDelta(delta);
  }

  // Refresh current view if it's the pulse
  if (state.currentView === "civic-pulse") {
    setView("civic-pulse");
  }

  console.log("[Substrate] New civic signal added:", signal.title);
}

// === VIEW RENDERERS ===
const viewRenderers = {
  topics: { /* your existing topics renderer unchanged */ 
    title: "Topics",
    subtitle: "Normalized civic topics from the substrate.",
    render(container, state) {
      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead><tr><th>Label</th><th>Category</th><th>Proposals</th></tr></thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
      state.data.topics.forEach((t) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(t.label || t.title || t.id)}</td>
          <td>${escapeHtml(t.category || "")}</td>
          <td>${(t.proposals || []).length}</td>
        `;
        tr.onclick = () => {
          state.selectedItem = t;
          setContext(renderTopicContext(t));
        };
        tbody.appendChild(tr);
      });
      container.appendChild(table);
    },
    onSearch(query) {
      const filtered = state.data.topics.filter((t) =>
        (t.label || t.title || "").toLowerCase().includes(query.toLowerCase())
      );
      const content = document.getElementById("view-content");
      content.innerHTML = "";
      this.render(content, { data: { ...state.data, topics: filtered } });
    },
  },

  proposals: { /* your existing proposals renderer unchanged */ 
    title: "Proposals",
    subtitle: "Civic proposals across platforms, normalized into a single substrate.",
    render(container, state) {
      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead><tr><th>Title</th><th>Topic</th><th>Status</th></tr></thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
      state.data.proposals.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(p.title || p.label || p.id)}</td>
          <td>${escapeHtml(p.topic_label || p.topic || "")}</td>
          <td><span class="badge">${escapeHtml(p.status || "unknown")}</span></td>
        `;
        tr.onclick = () => {
          state.selectedItem = p;
          setContext(renderProposalContext(p));
        };
        tbody.appendChild(tr);
      });
      container.appendChild(table);
    },
    onSearch(query) {
      const filtered = state.data.proposals.filter((p) =>
        (p.title || p.label || "").toLowerCase().includes(query.toLowerCase())
      );
      const content = document.getElementById("view-content");
      content.innerHTML = "";
      this.render(content, { data: { ...state.data, proposals: filtered } });
    },
  },

  actors: { /* your existing actors renderer unchanged */ 
    title: "Actors",
    subtitle: "People, organizations, and working groups participating in civic processes.",
    render(container, state) {
      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead><tr><th>Name</th><th>Type</th><th>Proposals</th></tr></thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
      state.data.actors.forEach((a) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(a.name || a.label || a.id)}</td>
          <td>${escapeHtml(a.type || a.kind || "actor")}</td>
          <td>${(a.proposals || []).length}</td>
        `;
        tr.onclick = () => {
          state.selectedItem = a;
          setContext(renderActorContext(a));
        };
        tbody.appendChild(tr);
      });
      container.appendChild(table);
    },
    onSearch(query) {
      const filtered = state.data.actors.filter((a) =>
        (a.name || a.label || "").toLowerCase().includes(query.toLowerCase())
      );
      const content = document.getElementById("view-content");
      content.innerHTML = "";
      this.render(content, { data: { ...state.data, actors: filtered } });
    },
  },

  "civic-pulse": {
    title: "Civic Pulse",
    subtitle: "Incoming civic signals from the extension, uploads, and P2P contributors.",
    render(container, state) {
      renderCivicPulsePanel(container, state.data.civicPulse || []);
    },
  },

  "wco-overview": { /* your placeholder unchanged */ 
    title: "WCO Overview",
    subtitle: "World Coordination Overlay: countries, slots, nodes, and links.",
    render(container) {
      container.innerHTML = `<p>WCO overview coming soon. Data will be pulled from substrate/data/.</p>`;
    },
  },

  "wco-stressor-map": {
    title: "WCO Global Civic Stressor Map",
    subtitle: "Stressor signals mapped to countries and WCO slots.",
    render(container, state) {
      renderWcoStressorMap(container, state.data.wcoStressors || []);
    },
  },

  graph: { /* your placeholder */ 
    title: "Graph View",
    subtitle: "A simple adjacency view of topics, proposals, and actors.",
    render(container) {
      container.innerHTML = `<p>Graph view placeholder. Canvas/SVG graph can be added later.</p>`;
    },
  },

  timeline: { /* your placeholder */ 
    title: "Timeline",
    subtitle: "Events and processes over time.",
    render(container) {
      container.innerHTML = `<p>Timeline view placeholder.</p>`;
    },
  },
};

// === MISSING RENDER FUNCTION (added) ===
function renderCivicPulsePanel(container, pulses) {
  if (pulses.length === 0) {
    container.innerHTML = `<p>No civic signals yet.<br>Use the browser extension to add signals from any page.</p>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <thead>
      <tr><th>Title</th><th>Source</th><th>Time</th></tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");

  pulses.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(p.title || p.id)}</td>
      <td>${escapeHtml(p.source || "—")}</td>
      <td>${new Date(p.timestamp).toLocaleString()}</td>
    `;
    tr.onclick = () => {
      setContext(`
        <h3>${escapeHtml(p.title || "Signal")}</h3>
        <p><strong>URL:</strong> <a href="${p.url}" target="_blank">${p.url}</a></p>
        <p><strong>Kind:</strong> ${escapeHtml(p.kind || "—")}</p>
      `);
    };
    tbody.appendChild(tr);
  });
  container.appendChild(table);
}

// === CONTEXT RENDERERS (unchanged from yours) ===
function renderTopicContext(t) { /* your code */ 
  return `
    <h3>${escapeHtml(t.label || t.title || t.id)}</h3>
    <p><strong>Category:</strong> ${escapeHtml(t.category || "—")}</p>
    <p><strong>Description:</strong> ${escapeHtml(t.description || "—")}</p>
  `;
}

function renderProposalContext(p) { /* your code */ 
  return `
    <h3>${escapeHtml(p.title || p.label || p.id)}</h3>
    <p><strong>Topic:</strong> ${escapeHtml(p.topic_label || p.topic || "—")}</p>
    <p><strong>Status:</strong> ${escapeHtml(p.status || "unknown")}</p>
    <p><strong>Summary:</strong> ${escapeHtml(p.summary || p.body || "—")}</p>
  `;
}

function renderActorContext(a) { /* your code */ 
  return `
    <h3>${escapeHtml(a.name || a.label || a.id)}</h3>
    <p><strong>Type:</strong> ${escapeHtml(a.type || a.kind || "actor")}</p>
    <p><strong>Affiliations:</strong> ${escapeHtml((a.affiliations || []).join(", ") || "—")}</p>
  `;
}

function renderWcoStressorMap(container, stressors) { /* your code */ 
  const info = document.createElement("div");
  info.innerHTML = `<p>Tabular view of WCO stressors. World map can be added later.</p>`;
  container.appendChild(info);

  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <thead><tr><th>Label</th><th>Country</th><th>Category</th><th>Severity</th><th>Signals</th></tr></thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  stressors.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(s.label)}</td>
      <td>${escapeHtml(s.country || s.region || "—")}</td>
      <td>${escapeHtml(s.category || "—")}</td>
      <td><span class="badge">${escapeHtml(s.severity || "—")}</span></td>
      <td>${s.signals || 0}</td>
    `;
    tr.onclick = () => {
      setContext(`
        <h3>${escapeHtml(s.label)}</h3>
        <p><strong>Country:</strong> ${escapeHtml(s.country || "—")}</p>
        <p><strong>Category:</strong> ${escapeHtml(s.category || "—")}</p>
        <p><strong>Severity:</strong> ${escapeHtml(s.severity || "—")}</p>
        <p><strong>WCO Slot:</strong> ${escapeHtml(s.wco_slot || "—")}</p>
      `);
    };
    tbody.appendChild(tr);
  });
  container.appendChild(table);
}

function setView(view) {
  state.currentView = view;
  const headerTitle = document.getElementById("view-title");
  const headerSubtitle = document.getElementById("view-subtitle");
  const content = document.getElementById("view-content");
  const renderer = viewRenderers[view];

  if (!renderer) {
    headerTitle.textContent = "Unknown view";
    headerSubtitle.textContent = "";
    content.innerHTML = "<p>View not implemented yet.</p>";
    return;
  }

  headerTitle.textContent = renderer.title;
  headerSubtitle.textContent = renderer.subtitle;
  content.innerHTML = "";
  renderer.render(content, state);
  clearContext();
}

function setContext(html) {
  const ctx = document.getElementById("context-content");
  ctx.innerHTML = html;
}

function clearContext() {
  setContext("<p>Select an item to see details, relationships, and timelines.</p>");
}

async function handleFileImport(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const json = JSON.parse(text);
    Object.assign(state.data, json);
    alert("Data imported successfully into the substrate.");
    if (state.currentView) setView(state.currentView);
  } catch (e) {
    alert("Invalid JSON file.");
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Make broadcast available to extension
window.broadcastSignal = broadcastSignal;

</script>