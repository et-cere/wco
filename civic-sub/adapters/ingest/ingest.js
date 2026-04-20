// substrate/adapters/ingest/ingest.js

import { ingestFromSource, buildBundleWithRelations } from "./framework.js";

// Example: ingest from Decidim and build full bundle
export async function runIngest(source = "decidim", config = {}) {
  const bundle = await ingestFromSource(source, config);
  const fullBundle = buildBundleWithRelations(bundle);

  // At this point you can:
  // - write fullBundle back to /data/*.json (in a Node context)
  // - or pass it directly into app.js in a browser context

  return fullBundle;
}
