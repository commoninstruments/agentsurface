# Changelog

All notable changes to Agent Surface are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

Reference-upgrade program: repairing drift between the skill, the disciplines, and the shipped docs so every reference points at something that exists.

### Added

- Two writer agents: `tool-design-writer` and `multi-agent-writer` (`skills/surface/agents/`)
- Two templates: `errors-and-auth/rate-limit-headers.ts` and `tools-and-orchestration/memory-bank.ts`
- Template-path existence check in the docs-integrity script, so template references are verified in CI

### Changed

- Re-pathed template references in the skill to match the kit layout under `templates/`
- Renamed the `readiness-auditing` discipline and de-orphaned it from the guide set
- Rewrote this changelog to reflect the project's actual history (see below)

### Fixed

- Repaired phantom citations in the discipline guides

More repairs to follow; this section will grow.

---

## [2.0.0] — 2026-04-19

Consolidated the two earlier skills (`agentify` and `agents`) into a single unified `surface` skill covering guide, audit, and scaffold workflows. Version `2.0.0` is recorded in both `.claude-plugin/plugin.json` and `.skill.yaml`.

### Added

- Unified `surface` skill (guide / audit / scaffold) replacing the separate `agentify` and `agents` skills
- Next.js + Fumadocs documentation site with 19 sections and 141 MDX pages under `src/content/docs/`
- 7 template kits under `templates/` (`cli-and-evals`, `cookbook`, `data-retrievability`, `discovery`, `errors-and-auth`, `mcp-and-api`, `tools-and-orchestration`) — 59 template files in total
- 11 scoring agents (`score-*`) and 10 writer agents under `skills/surface/agents/`
- 7 discipline guides under `disciplines/` (agentic patterns, evaluation, orchestration, proactive agents, readiness auditing, retrievability, tool design)
- Agent-discovery surfaces served by the site: an MCP server (`/mcp`), `llms.txt` and `llms-full.txt`, a served `AGENTS.md`, and `.well-known/` endpoints for agent-skills and MCP
- Agentic glossary with an animated card-to-overlay treatment
- Neutral design system applied across the homepage and docs

---

## [1.0.0] — 2026-04-17

Initial release as the `agentify` plugin: a Claude Code plugin with a cookbook, discipline guides, and agent scaffolding, plus a docs scaffold.
