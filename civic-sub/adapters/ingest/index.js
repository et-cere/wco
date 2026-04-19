import * as democracyos from "./democracyos.js";
import * as decidim from "./decidim.js";
import * as polis from "./polis.js";
import * as osm from "./osm.js";
import * as wco from "./wco.js";

const registry = {
  democracyos,
  decidim,
  polis,
  osm,
  wco
};

export async function ingestFrom(source, config = {}) {
  const adapter = registry[source];
  if (!adapter) throw new Error(`Unknown adapter: ${source}`);
  return adapter.ingest(config);
}
