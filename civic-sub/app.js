// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
const state = {
  data: {
    topics: [],
    proposals: [],
    actors: [],
    processes: [],
    decisions: [],
    civicPulse: [],
    wcoStressors: [],
    relations: []
  },
  currentView: null,
  selectedItem: null,
};

// ------------------------------------------------------------
// BOOT
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireHeaderButtons();
  loadInitialData();
  initOptionalP2P();
});

// ------------------------------------------------------------
// NAV + HEADER
// ------------------------------------------------------------
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
    alert("Generative engine would run here.");
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

// ------------------------------------------------------------
// DATA LOADING (dynamic, robust, UI-compatible)
// ------------------------------------------------------------
async function loadInitialData() {
  const files = [
    "topics",
    "proposals",
    "actors",
    "processes",
    "decisions",
    "civic-pulse",
    "wco-stressors"
  ];

  const bundle = {};

  for (const key of files) {
    try {
      const res = await fetch(`data/${key}.json`);
      if (res.ok) {
        bundle[normalizeKey(key)] = await res.json();
      } else {
        bundle[normalizeKey(key)] = [];
      }
    } catch (e) {
      bundle[normalizeKey(key)] = [];
    }
  }

  Object.assign(state.data, bundle);

  // Build relations if available
  if (window.buildRelations) {
    state.data.relations = window.buildRelations(state.data);
  }

  // Enrich objects so UI works
  postProcessData(state.data);

  // Render initial view
  setView("topics");
}

function normalizeKey(k) {
  if (k === "civic-pulse") return "civicPulse";
  if (k === "wco-stressors") return "wcoStressors";
  return k;
}

// ------------------------------------------------------------
// DATA ENRICHMENT (critical for UI)
// ------------------------------------------------------------
function postProcessData(data) {
  data.topics.forEach(t => t.proposals = []);
  data.actors.forEach(a => a.proposals = []);

  // proposals → topics
  data.proposals.forEach(p => {
    const topic = data.topics.find(t => t.id === p.topic_id);
    if (topic) {
      topic.proposals.push(p);
      p.topic_label = topic.label || topic.title || topic.id;
    }
  });

  // proposals → actors
  data.proposals.forEach(p => {
    if (p.author_id) {
      const actor = data.actors.find(a => a.id === p.author_id);
      if (actor) {
        actor.proposals.push(p);
      }
    }
  });
}

// ------------------------------------------------------------
// VIEW MANAGEMENT
// ------------------------------------------------------------
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
  document.getElementById("context-content").innerHTML = html;
}

function clearContext() {
  setContext("<p>Select an item to see details, relationships, and timelines.</p>");
}

// ------------------------------------------------------------
// IMPORT
// ------------------------------------------------------------
async function handleFileImport(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const json = JSON.parse(text);
    Object.assign(state.data, json);
    postProcessData(state.data);
    if (state.currentView) setView(state.currentView);
  } catch (e) {
    alert("Invalid JSON file.");
  }
}

// ------------------------------------------------------------
// VIEW RENDERERS (unchanged from your working version)
// ------------------------------------------------------------
const viewRenderers = {
  topics: {
    title: "Topics",
    subtitle: "Normalized civic topics from the substrate.",
    render(container, state) {
      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Label</th>
            <th>Category</th>
            <th>Proposals</th>
          </tr>
        </thead>
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

  proposals: {
    title: "Proposals",
    subtitle: "Civic proposals across platforms.",
    render(container, state) {
      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Title</th>
            <th>Topic</th>
            <th>Status</th>
          </tr>
        </thead>
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

  actors: {
    title: "Actors",
    subtitle: "People, organizations, and working groups.",
    render(container, state) {
      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Proposals</th>
          </tr>
        </thead>
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

  "wco-overview": {
    title: "WCO Overview",
    subtitle: "Countries, slots, nodes, and links.",
    render(container, state) {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>This panel will summarize WCO countries, slots, and nodes.</p>
      `;
      container.appendChild(div);
    },
  },

  "wco-stressor-map": {
    title: "WCO Global Civic Stressor Map",
    subtitle: "Stressor signals mapped to countries.",
    render(container, state) {
      renderWcoStressorMap(container, state.data.wcoStressors || []);
    },
  },

  "civic-pulse": {
    title: "Civic Pulse",
    subtitle: "Incoming civic signals.",
    render(container, state) {
      renderCivicPulsePanel(container, state.data.civicPulse || []);
    },
  },

  graph: {
    title: "Graph View",
    subtitle: "Adjacency view.",
    render(container) {
      const div = document.createElement("div");
      div.innerHTML = `<p>Graph view placeholder.</p>`;
      container.appendChild(div);
    },
  },

  timeline: {
    title: "Timeline",
    subtitle: "Events over time.",
    render(container) {
      const div = document.createElement("div");
      div.innerHTML = `<p>Timeline view placeholder.</p>`;
      container.appendChild(div);
    },
  },
};

// ------------------------------------------------------------
// CONTEXT HELPERS
// ------------------------------------------------------------
function renderTopicContext(t) {
  return `
    <h3>${escapeHtml(t.label || t.title || t.id)}</h3>
    <p><strong>Category:</strong> ${escapeHtml(t.category || "—")}</p>
    <p><strong>Description:</strong> ${escapeHtml(t.description || "—")}</p>
  `;
}

function renderProposalContext(p) {
  return `
    <h3>${escapeHtml(p.title || p.label || p.id)}</h3>
    <p><strong>Topic:</strong> ${escapeHtml(p.topic_label || p.topic || "—")}</p>
    <p><strong>Status:</strong> ${escapeHtml(p.status || "unknown")}</p>
    <p><strong>Summary:</strong> ${escapeHtml(p.summary || p.body || "—")}</p>
  `;
}

function renderActorContext(a) {
  return `
    <h3>${escapeHtml(a.name || a.label || a.id)}</h3>
    <p><strong>Type:</strong> ${escapeHtml(a.type || a.kind || "actor")}</p>
    <p><strong>Affiliations:</strong> ${escapeHtml((a.affiliations || []).join(", ") || "—")}</p>
  `;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ------------------------------------------------------------
// WCO + CIVIC PULSE HELPERS
// ------------------------------------------------------------
function renderWcoStressorMap(container, stressors) {
  const info = document.createElement("div");
  info.innerHTML = `
    <p>This is a tabular view of WCO stressors.</p>
  `;
  container.appendChild(info);

  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Label</th>
        <th>Country</th>
        <th>Category</th>
        <th>Severity</th>
        <th>Signals</th>
      </tr>
    </thead>
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
        <p><strong>Signals:</strong> ${s.signals || 0}</p>
      `);
    };
    tbody.appendChild(tr);
  });
  container.appendChild(table);
}

function renderCivicPulsePanel(container, signals) {
  const div = document.createElement("div");
  div.innerHTML = `<p>Civic Pulse signals will appear here.</p>`;
  container.appendChild(div);
}

// human insert
// Quick listener for signals coming from the extension popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "NEW_CIVIC_SIGNAL" && msg.signal) {
    state.data.civicPulse = state.data.civicPulse || [];
    state.data.civicPulse.unshift(msg.signal);   // newest on top

    // Refresh current view if we're on Civic Pulse
    if (state.currentView === "civic-pulse") {
      setView("civic-pulse");
    }

    console.log("New civic signal received from extension:", msg.signal.title);
  }
});

// ------------------------------------------------------------
// OPTIONAL P2P (never breaks boot)
// ------------------------------------------------------------
async function initOptionalP2P() {
  try {
    const webrtcModule = await import("./p2p/webrtc.js").catch(() => null);
    const mergeModule = await import("./p2p/merge.js").catch(() => null);

    if (!webrtcModule || !mergeModule) {
      console.log("[P2P] Optional modules not found. Skipping P2P.");
      return;
    }

    const { P2PWebRTC } = webrtcModule;
    const { applyDeltaToState } = mergeModule;

    const p2p = new P2PWebRTC({
      onDelta: async (delta) => {
        await applyDeltaToState(delta, state.data);
        postProcessData(state.data);
        if (state.currentView) setView(state.currentView);
      },
    });

    console.log("[P2P] WebRTC + merge initialized.");
  } catch (e) {
    console.log("[P2P] Failed to initialize P2P.", e);
  }
}
