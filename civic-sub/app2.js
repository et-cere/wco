let p2p = {
  webrtc: null,
  merge: null,
};

(async function initP2P() {
  try {
    const [{ P2PWebRTC }, { applyDeltaToState }] = await Promise.all([
      import("./p2p/webrtc.js"),
      import("./p2p/merge.js"),
    ]);

    p2p.merge = applyDeltaToState;
    p2p.webrtc = new P2PWebRTC({
      onDelta: async (delta) => {
        await p2p.merge(delta, state.data);
        if (state.currentView) setView(state.currentView);
      },
    });

    console.log("[P2P] WebRTC + merge initialized (signaling still TODO).");
  } catch (e) {
    console.log("[P2P] Optional p2p modules not present or failed to load.", e);
  }
})();


// Simple state
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
    // placeholder hook for generative engine
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
  // basic loader from /data
  const files = [
    "topics",
    "proposals",
    "actors",
    "processes",
    "decisions",
    "civic-pulse",
    "wco-stressors",
  ];

  for (const key of files) {
    try {
      const res = await fetch(`data/${key}.json`);
      if (res.ok) {
        state.data[normalizeKey(key)] = await res.json();
      }
    } catch (e) {
      // ignore missing optional files (civic-pulse, wco-stressors)
    }
  }

  setView("topics");
}

function normalizeKey(k) {
  if (k === "civic-pulse") return "civicPulse";
  if (k === "wco-stressors") return "wcoStressors";
  return k;
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
    alert("Data imported into substrate state.");
    if (state.currentView) setView(state.currentView);
  } catch (e) {
    alert("Invalid JSON file.");
  }
}

// --- View renderers registry ---

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
      // simple re-render with filter
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
    subtitle: "Civic proposals across platforms, normalized into a single substrate.",
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
    subtitle: "People, organizations, and working groups participating in civic processes.",
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
    subtitle: "World Coordination Overlay: countries, slots, nodes, and links.",
    render(container, state) {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>This panel will summarize WCO countries, slots, and nodes from the substrate.</p>
        <p>Once your WCO data is in <code>data/</code>, this view can aggregate it.</p>
      `;
      container.appendChild(div);
    },
  },

  "wco-stressor-map": {
    title: "WCO Global Civic Stressor Map",
    subtitle: "Stressor signals mapped to countries and WCO slots.",
    render(container, state) {
      renderWcoStressorMap(container, state.data.wcoStressors || []);
    },
  },

  "civic-pulse": {
    title: "Civic Pulse",
    subtitle: "Incoming civic signals from the extension, uploads, and contributors.",
    render(container, state) {
      renderCivicPulsePanel(container, state.data.civicPulse || []);
    },
  },

  graph: {
    title: "Graph View",
    subtitle: "A simple adjacency view of topics, proposals, and actors.",
    render(container, state) {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>Graph view placeholder. You can later replace this with a canvas/SVG graph.</p>
      `;
      container.appendChild(div);
    },
  },

  timeline: {
    title: "Timeline",
    subtitle: "Events and processes over time.",
    render(container, state) {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>Timeline view placeholder. You can later add a proper temporal visualization.</p>
      `;
      container.appendChild(div);
    },
  },
};

// --- Context render helpers ---

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
function renderWcoStressorMap(container, stressors) {
  const info = document.createElement("div");
  info.innerHTML = `
    <p>This is a tabular view of WCO stressors. You can later replace or augment this with a world map.</p>
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