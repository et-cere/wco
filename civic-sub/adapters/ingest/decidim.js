// substrate/adapters/ingest/decidim.js

function mapStatus(decidimState) {
  const map = {
    "accepted": "approved",
    "rejected": "rejected",
    "evaluating": "in-review",
    "withdrawn": "withdrawn",
    "published": "draft"
  };
  return map[decidimState] || "unknown";
}

function extractSummary(body) {
  if (!body) return "";
  return body.length > 160 ? body.slice(0, 157) + "…" : body;
}

function mapAuthor(author) {
  if (!author) return "actor-unknown";
  return `actor-${author.id}`;
}

function mapTopic(process) {
  if (!process) return "topic-unknown";
  return `topic-process-${process.id}`;
}

export async function ingest(config = {}) {
  const endpoint = config.endpoint || "https://decidim.example.org/api";

  // Placeholder fetch
  // const proposals = await fetch(`${endpoint}/proposals`).then(r => r.json());

  const proposals = []; // Replace with real fetch

  const transformed = proposals.map(p => ({
    id: `proposal-${p.id}`,
    title: p.title,
    summary: extractSummary(p.body),
    status: mapStatus(p.state),
    author: mapAuthor(p.author),
    topic: mapTopic(p.participatory_process),
    created_at: p.created_at
  }));

  return {
    proposals: transformed,
    actors: [],        // to be filled later
    processes: [],     // to be filled later
    meetings: [],      // to be filled later
    decisions: []      // to be filled later
  };
}
