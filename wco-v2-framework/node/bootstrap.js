// Minimal node bootstrap
const path = require('path');

// config should point to adapters dir, schema dir, p2p config
async function startNode(config) {
  console.info('Starting WCO node with config:', config);
  // load adapters
  // initialize storage (local JSON or DB)
  // start P2P stack (webrtc / rendezvous if configured)
  // expose API according to api/openapi.yaml
}

module.exports = { startNode };
