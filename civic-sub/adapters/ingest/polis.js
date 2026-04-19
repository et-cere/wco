// substrate/adapters/ingest/polis.js

export async function ingest(config = {}) {
  const endpoint = config.endpoint || "https://pol.is/api/v3";

  return {
    comments: [],
    actors: [],
    clusters: [],
    statements: []
  };
}
