// substrate/adapters/ingest/framework.js

import * as registry from "./index.js"; // your existing index.js that maps source → adapter
import { buildRelations } from "../../../engine/relations-builder.js";

export async function ingestFromSource(source, config = {}) {
  const result = await registry.ingestFrom(source, config);

  // Normalize into canonical WCO bundle
  const bundle = {
    actors: result.actors || [],
    topics: result.topics || [],
    proposals: result.proposals || [],
    processes: result.processes || [],
    decisions: result.decisions || [],
    comments: result.comments || [],
    votes: result.votes || [],
    petitions: result.petitions || [],
    amendments: result.amendments || [],
    budget: result.budget || [],
    documents: result.documents || [],
    events: result.events || [],
    civicPulse: result.civicPulse || [],
    wcoStressors: result.wcoStressors || [],
    nodes: result.nodes || [],
    links: result.links || [],
    jurisdictions: result.jurisdictions || [],
    constituencies: result.constituencies || []
  };

  return bundle;
}

export function buildBundleWithRelations(staticDataBundle) {
  const relations = buildRelations();
  return {
    ...staticDataBundle,
    relations
  };
}
