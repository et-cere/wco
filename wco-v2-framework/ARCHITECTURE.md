# WCO v2: Decentralized Framework Architecture

## Overview
This document outlines the technical architecture for the revamped WCO (World Citizens Organization) platform, designed for true decentralization, modularity, and community-driven growth.

## Core Design Principles

1. **Decentralization First**: No single point of control or failure
2. **Modularity**: Clean plugin/adapter interfaces for extensibility
3. **Interoperability**: Seamless node-to-node communication and federation
4. **User Empowerment**: Non-coders can contribute content and configurations
5. **Trust as a First-Class Citizen**: Reputation, verification, and permission systems
6. **Extensibility**: New adapters, data types, and services can be added without core changes

## System Architecture

### 1. Node Architecture
Each WCO node is an independent instance that can:
- Run on its own infrastructure (self-hosted, cloud, infinityfree, etc.)
- Use a custom domain
- Connect to a federated network of other nodes
- Manage its own data, adapters, and configurations
- Expose standardized APIs for inter-node communication

**Node Components:**
```
wco-node/
├── core/                    # Core engine & data structures
│   ├── entity-store.js      # Local data persistence
│   ├── schema-validator.js  # Data type validation
│   └── relation-engine.js   # Relationship building & linking
├── adapters/                # Platform integrations
│   ├── registry.js          # Adapter discovery & loading
│   └── [platform]/          # Individual adapter modules
├── api/                     # Node REST/GraphQL APIs
│   ├── endpoints/
│   └── federation/          # Inter-node communication
├── plugins/                 # Extended functionality
├── p2p/                     # Peer-to-peer networking
├── trust/                   # Reputation & verification
└── config/                  # Node configuration & settings
```

### 2. Adapter Framework (Redesigned)
Adapters are the bridge between WCO and external civic platforms.

**Adapter Interface:**
```javascript
{
  metadata: {
    id: "platform-name",
    version: "1.0.0",
    name: "Platform Display Name",
    description: "What this adapter does",
    author: "contributor-name",
    trust_level: "community|verified|trusted",
    api_endpoints: ["ingest", "send", "query"],
    dependencies: []
  },
  ingest: async (source_config) => { ... },    // Pull data FROM platform
  send: async (data, target_config) => { ... }, // Push data TO platform
  schema_mapping: { ... }                       // Data type transformation
}
```

**Adapter Registry:**
- Central registry of available adapters (curated + community)
- Versioning and dependency management
- Trust scoring and verification badges
- One-click installation and updates

### 3. Data & Type System
Standardized, extensible data schemas for all civic information.

**Schema Structure:**
```
substrate/
├── core-types/              # Base types (unchanging)
│   ├── civic-signal.json
│   ├── actor.json
│   └── ...
├── extended-types/          # Community-contributed types
│   ├── [community]/
│   └── [verified]/
├── validators/              # Type validation & transformation
└── migrations/              # Version compatibility
```

**Key Features:**
- Semantic versioning for schemas
- Backward compatibility layer
- Community submission process
- Verification workflow

### 4. Federation & Node Discovery
Nodes can connect and share data across a decentralized network.

**Federation Protocol:**
```
federation/
├── node-registry.js         # Discover peers
├── sync-engine.js           # Cross-node data sync
├── conflict-resolution.js   # Handle divergent data
├── federation-manifest.json # Node capabilities & endpoints
└── interop-standards.md     # Protocol documentation
```

**Features:**
- Voluntary participation
- Optional data sharing agreements
- Rate limiting and load balancing
- Privacy-preserving aggregation

### 5. Trust & Reputation System
Multi-layered trust model for contributors, adapters, and nodes.

**Trust Framework:**
```
trust/
├── contributor-reputation.js    # Track quality and reliability
├── adapter-verification.js      # Adapter security & correctness
├── node-trust-score.js          # Network node credibility
├── delegation-engine.js         # Trust-based permissions
└── reputation-badges.json       # Visual & data trust indicators
```

**Trust Levels:**
- **Community**: New, unverified
- **Verified**: Passed basic security/quality checks
- **Trusted**: Long track record, community consensus
- **Core**: Project maintainers

### 6. Gamification & Incentives
Built-in systems to encourage quality participation and engagement.

**Gamification Module:**
```
gamification/
├── achievement-engine.js    # Badge & milestone tracking
├── contribution-tracker.js  # Activity metrics
├── reward-system.js         # Incentive distribution
├── leaderboard.js           # Community showcase
└── schemas/
    ├── badges.json
    ├── milestones.json
    └── reward-pools.json
```

**Mechanisms:**
- Badges for various contributions (first adapter, 100 signals, etc.)
- Contribution streaks and consistency tracking
- Rewards pool (allocation to top contributors)
- Public leaderboards (opt-in)
- Integration with trust system

### 7. User Interface & Extension
Client-facing tools for capturing and managing civic data.

**Extension & Viewer:**
```
client/
├── browser-extension/       # Signal capture
│   ├── content.js
│   ├── background.js
│   ├── popup/
│   └── config/
├── civic-substrate-viewer/  # Data visualization & management
│   ├── app.js
│   ├── views/
│   └── components/
├── node-connector.js        # Link to local/remote node
└── federation-ui.js         # Peer discovery & management
```

## Data Flow

```
User captures signal via extension
    ↓
Signal stored locally (with node option)
    ↓
Node receives & validates via core schema
    ↓
Adapter processes & optionally sends to external platform
    ↓
Contributor reputation updated
    ↓
(Optional) Signal broadcast to federated peers
    ↓
Gamification engine awards points/badges
```

## API Design

### Core Node API
```
/api/v1/

# Signals & Data
POST   /signals                 # Create new signal
GET    /signals                 # Query signals
GET    /signals/:id             # Get signal details
PUT    /signals/:id             # Update signal
DELETE /signals/:id             # Archive signal

# Adapters
GET    /adapters                # List installed adapters
POST   /adapters                # Install new adapter
POST   /adapters/:id/ingest     # Run adapter ingest
POST   /adapters/:id/send       # Send via adapter

# Federation
GET    /federation/peers        # Discover peers
POST   /federation/sync         # Sync with peer
GET    /federation/status       # Network status

# Trust & Reputation
GET    /contributors            # List contributors
GET    /contributors/:id/stats  # Contributor stats
GET    /adapters/:id/trust      # Adapter trust info

# Gamification
GET    /gamification/profile    # User profile & badges
GET    /gamification/leaderboard
POST   /gamification/claim-reward
```

## Deployment & Hosting

**Supported Deployment Targets:**
- Self-hosted (Docker, Node.js)
- Cloud platforms (AWS, DigitalOcean, Heroku, etc.)
- Static hosting + backend (Vercel + Function, Netlify Functions, etc.)
- Community platforms (InfinityFree, etc.)
- Federated node networks

**Deployment Template:**
```
deployment/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── cloud-templates/
│   ├── aws/
│   ├── digitalocean/
│   └── heroku/
├── static-hosting/
│   ├── netlify/
│   └── vercel/
└── guides/
    ├── self-hosted.md
    ├── domain-setup.md
    └── federation-joining.md
```

## Migration & Compatibility

**Path from v1 → v2:**
- Adapter for ingesting existing v1 data
- Gradual migration tools
- Dual-mode operation during transition
- Preservation of existing civic signals

## Security Considerations

1. **Signal Integrity**: Cryptographic signing of important data
2. **Adapter Sandboxing**: Adapters run with limited permissions
3. **Privacy**: User-controlled data sharing and export
4. **Rate Limiting**: Prevent abuse and DoS
5. **Encryption**: TLS for federation; optional E2E for P2P
6. **Audit Logging**: Track all significant actions

## Development Roadmap

**Phase 1: Foundation**
- Core node architecture & API
- Basic adapter framework
- Single-node deployment

**Phase 2: Federation**
- Node discovery & communication
- Cross-node sync
- Data conflict resolution

**Phase 3: Trust & Community**
- Reputation system
- Adapter verification
- Community contribution workflows

**Phase 4: Gamification**
- Badge & achievement system
- Leaderboards & recognition
- Reward mechanism

**Phase 5: Advanced Features**
- Advanced federation options
- Plugin system expansion
- Analytics & insights
