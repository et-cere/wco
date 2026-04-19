// substrate/adapters/ingest/wco.js

export async function ingest(config = {}) {
  const endpoint = config.endpoint || "https://wco.example.org/api";

  return {
    countries: [],
    slots: [],
    nodes: [],
    links: []
  };
}
