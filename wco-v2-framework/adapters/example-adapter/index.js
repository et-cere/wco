// Example adapter skeleton (CommonJS/Node)
const metadata = require('./metadata.json');

async function ingest({ source, options = {} }) {
  // 1) fetch raw data (source could be URL, file, or API descriptor)
  // 2) normalize to canonical schema
  // 3) return array of normalized objects
  return [
    {
      id: 'example:1',
      type: 'topic',
      title: 'Example topic',
      source: metadata.id,
      raw: {},
      meta: {}
    }
  ];
}

module.exports = {
  metadata,
  ingest
};
