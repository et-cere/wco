# WCO v2 Framework (Browser-first Minimal)

This is a minimal, dependency-free foundation for WCO v2 focused on browser-first operation and adapter-as-data support. It intentionally avoids requiring Node.js or other runtimes so contributors can add adapters as plain JSON or browser ES modules.

Quick start
- Drop an adapter folder under wco-v2-framework/adapters/ (see docs/contributing.md).
- Open a static demo (wco-v2-framework/demo/index.html) or load the framework/ingest/loader.mjs in the browser to run adapters.

Goals
- Allow data-only adapters (metadata + data.json) and browser ES module adapters (metadata + adapter.mjs).
- Keep runtime zero-dependency for users testing in a browser.
- Provide canonical schemas and a registry so adapters are discoverable.