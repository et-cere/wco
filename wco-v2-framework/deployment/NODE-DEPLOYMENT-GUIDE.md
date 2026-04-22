# WCO Node Deployment Guide

Platforms
- Local (developer): node + adapters directory
- VPS (DigitalOcean, Hetzner): PM2/systemd + reverse proxy (NGINX) + TLS
- Free/Shared hosts (InfinityFree): static viewer only + remote node via API
- Docker: official image + docker-compose for quick start
- Kubernetes: helm chart (future)

Contents
- environment variables
- storage options (filesystem, sqlite, postgres)
- P2P bootstrap options (rendezvous servers)
