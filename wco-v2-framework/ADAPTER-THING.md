Adapter interface (v1)

Purpose Adapters isolate platform-specific logic (ingest, normalize, export). They must:

Present metadata.json describing the adapter
Implement a standardized ingest() and optional export() entry
Use the canonical schema (schemas/) for normalization
Minimal adapter layout

adapters//
metadata.json
adapter.js ← exports ingest({source, options}) -> normalized objects
README.md
