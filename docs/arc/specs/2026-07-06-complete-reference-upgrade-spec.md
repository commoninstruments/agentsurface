# Complete Reference Upgrade — Feature Spec

Date: 2026-07-06
Status: approved through collaborative review (arc:ideate)
Scope owner: Daniel Howells

## Reference Materials

- `docs/agent-surface-product-vision.md` — strategic framing (2026-06-13). All vision items (Standard section, maturity model, what-is page, example reports, patterns gallery) are **deferred** from this round.
- `docs/content-structure-audit-2026-06-02.md` — prior audit; its nav restructure and consolidation phases are already applied. This spec builds on that baseline.
- Research inputs (2026-07-06): full docs coverage/staleness map; Mastra docs mining (`~/Sites/mastra-docs`, v1.48-era, 2026-07-05); skill/templates/disciplines coherence audit; repo infrastructure + dogfooding audit; live web landscape verification. Key findings inlined below — the session task outputs are ephemeral.

## Problem Statement

Agent Surface aims to be the definitive reference for agent-readable software and production agent systems. A July 2026 review found four kinds of drift plus a credibility layer of repo-infrastructure issues:

1. **Coverage gaps** — durable execution, sandboxed workspaces, runtime guardrails, session-controller layers, MCP Apps, code-execution orchestration, procedural memory, agentic payments: mainstream multi-vendor patterns with no home in the current 19 sections.
2. **Structural friction** — two misfiled pages, six duplication clusters, two single-page sections in prime nav positions, an unexplained 11-dimensions-vs-19-sections split.
3. **Stale claims** — past-dated events, a model-ID schism (2024 IDs alongside 2026 IDs), claims contradicted by current primary sources, freshness stamps on only 2 of 19 sections.
4. **Broken internal sync** — skill references cite a dead flat `templates/` layout; two referenced templates don't exist; `disciplines/` is orphaned with phantom citations.
5. **Repo credibility** — CHANGELOG describes a product that doesn't exist; on-site search likely broken; version/naming drift across six files; `docs/surface/` referenced by CLAUDE.md but missing.

## Approach

Five workstreams, each independently shippable and committable, in this order:

| # | Workstream | Nature |
|---|---|---|
| A | Sync repairs (skill/templates/disciplines) | Mechanical |
| E | Repo credibility + infrastructure | Mechanical-to-small |
| B | Currency sweep + freshness system | Verification-heavy |
| C | Reorg + dedup | Structural |
| D | New 2026 coverage | Net-new writing |

C precedes D so new pages link to stable canonical targets. The tooling-catalog row refresh lives in D; the map-page rename lives in C (rename-only, no conflict).

---

## Workstream A — Sync Repairs

1. **Re-path skill references** to the 7-kit `templates/` layout. Affected: `skills/surface/references/{authentication,api-surface,testing,mcp-servers,tool-design,error-handling,context-files}.md` (11+ files use flat `/templates/foo.ts` paths). Docs-side paths are already correct and are the source of truth.
2. **Create two referenced-but-missing templates**: `templates/errors-and-auth/rate-limit-headers.ts` (cited `references/error-handling.md:367`) and `templates/tools-and-orchestration/memory-bank.ts` (cited `references/multi-agent.md:225`).
3. **Fix `disciplines/`**:
   - Remove/repoint the five phantom citations (an entire never-built reference layer): `eval-cookbook.md`, `metrics.md` (evaluation.md); `orchestration-cookbook.md` (orchestration.md); `retrieval-cookbook.md`, `chunking-guide.md` (retrievability.md) — **decision: point "See also" lines at real existing docs pages / skill references; do not author new files.**
   - Rename `disciplines/agent-evaluation.md` → `disciplines/readiness-auditing.md` (naming collision: `evaluation.md` = evaluating agent system behavior; `agent-evaluation.md` = the readiness audit loop).
   - Add a pointer from README/SKILL.md so the folder is no longer orphaned.
4. **Writer-agent parity**: add transform agents for `tool-design` and `multi-agent` dimensions (the two gaps in the otherwise 1:1 score↔writer mapping), or explicitly document `agentic-patterns-writer` as owning both. Default: add the two agents.

## Workstream E — Repo Credibility + Infrastructure

1. **Rewrite `CHANGELOG.md`** — current content describes a nonexistent product (`@surface/*` packages, Bun/Turborepo stack, 42+ templates, fictional sub-agents). Replace with an honest history: 1.0.0 (what actually shipped), 2.0.0 (current skill/plugin), dated from git history.
2. **Version alignment** — single version (2.x) across `package.json`, `.skill.yaml`, `.claude-plugin/plugin.json`, `src/app/mcp/route.ts` McpServer, `public/.well-known/mcp/server-card.json`, `INSTALL.md` zip name. Consider reading version from one source.
3. **Naming/claims cleanup** — `.skill.yaml` drops the `@anthropic/surface` npm scope claim; reconcile `surface` vs `agentsurface` plugin naming between `plugin.json` and `INSTALL.md`; unify the `npx skills add` command form across INSTALL/CLAUDE/`.well-known`.
4. **README corrections** — "Node.js 20+, pnpm 9" → Node 24.15 / pnpm 11.5.2 (matching engines/.node-version).
5. **Fix on-site search** — custom `/api/search` returns a shape incompatible with Fumadocs' search client, and only substring-matches title+description. Fix the client/server contract and index page body content (shared search helper for `/api/search` and the MCP `search_docs` tool — same weak search is duplicated in both).
6. **Create `docs/surface/`** (or repoint CLAUDE.md) — CLAUDE.md instructs agents to check `docs/surface/` for audit history; it doesn't exist. Create it and move/index the two existing docs plus this spec's lineage.
7. **Generate `llms.txt`** from `source.getPages()` (like `llms-full.txt`) instead of hand-maintaining `public/llms.txt`, so the index can't drift from actual routes.

## Workstream B — Currency Sweep + Freshness System

Ground truth established by live research 2026-07-06. One-off sweep:

1. **Canonical model list** (single doc, all examples reference it):
   - Anthropic: Fable 5 (`claude-fable-5`, flagship), Opus 4.8 (`claude-opus-4-8`, default), Sonnet 5 (`claude-sonnet-5`), Haiku 4.5 (`claude-haiku-4-5-20251001`). Sonnet 4/Opus 4 retired 2026-06-15 (executed — update past-tense).
   - OpenAI: GPT-5.5 (`gpt-5.5`, flagship), GPT-5.4 (`gpt-5.4`, value tier). o-series winding down.
   - Google: Gemini 3.5 Flash (`gemini-3.5-flash`, current), 3.1 Pro preview.
   - Embeddings: `text-embedding-3-large` still current; Voyage 4 family (`voyage-4-large/-4/-4-lite/-4-nano`, `voyage-context-4`); `gemini-embedding-2`.
   - Purge `claude-3-5-sonnet-20241022`, `gpt-4-turbo`, `gpt-4o`, `gemini-1.5-pro` etc. from non-anti-pattern examples (`knowledge-graphs.mdx`, `multimodal-embeddings.mdx`, `tool-sprawl.mdx`, `agentic-loop.mdx`, cookbook, multi-agent). Deliberately-old anti-pattern examples stay.
   - Bump template model IDs (all 7 kits pin `claude-opus-4-7` era; reconcile `gpt-4.1-mini` stragglers in `tool-loop-vercel-ai.ts`, `toolpick.ts`).
2. **`agents/anthropic-platform.mdx` full rewrite** — Managed Agents public beta (header `managed-agents-2026-04-01`, `ant` CLI, environments/sessions, self-hosted sandboxes), Claude Code 2.1.x surfaces, Agent SDK naming unchanged, Skills as cross-vendor standard (agentskills.io, 40+ clients), MCP connector rev `mcp-client-2025-11-20`, tool search/programmatic tool calling/code execution GA. Docs domain: platform.claude.com.
3. **Protocol/status updates**:
   - MCP: `2025-11-25` pin remains correct. Add a note that `2026-07-28` (stateless core, extensions framework, OAuth hardening, deprecation lifecycle) is in RC; **schedule a follow-up pass after July 28** — do not chase the RC now.
   - A2A → v1.0.1, production-grade, 150+ orgs.
   - ACP three-way disambiguation: Agentic Commerce Protocol (OpenAI+Stripe — **remove any Meta co-creator claim; contradicted by primary sources**; Instant Checkout shut down March 2026, momentum → UCP), Agent Client Protocol (Zed/JetBrains, protocol v1, ~50-agent registry), IBM ACP (dead, absorbed into A2A).
   - Arazzo 1.1.0 confirmed still latest — no change.
   - OTel GenAI: still Development status; conventions moved to dedicated **unversioned** repo `semantic-conventions-genai` (v1.42.0 split) — update `testing/observability.mdx` + `protocols/emerging-standards.mdx`.
   - llms.txt: strengthen skepticism (Ahrefs: 97% of files got zero requests May 2026; Google compares to keywords meta tag) while keeping the real niche: coding agents fetch it on demand for docs sites.
   - auth.md: keep "new/emerging"; adopters are WorkOS-published (Cloudflare, Resend, Firecrawl…); no standards-body track.
   - Promptfoo: acquisition announced 2026-03-09, promptfoo.dev banners "part of OpenAI"; OSS continues. Soften to verifiable wording.
4. **Framework/tooling refs**: Next.js 15 → 16 (16.2.x stable) in `mcp-servers/nextjs-integration.mdx`, `context-files/drift-detection.mdx`; Daytona OSS repo frozen June 2026 (hosted product active) — fix any OSS links; Vercel Sandbox GA; Cloudflare Sandbox SDK + Containers GA.
5. **KuzuDB removal** — three files: `data-retrievability/knowledge-graphs.mdx:142-174` (dead section), `data-retrievability/index.mdx:104`, `scoring/rubric.mdx:190`.
6. **Cite the competitive validator**: Cloudflare's Agent Readiness score (isitagentready.com, April 2026) checks robots, markdown negotiation, Content Signals, Web Bot Auth, MCP server cards, WebMCP, x402/UCP — reference it from discovery/scoring as independent validation of the category.

**The system** (last manual sweep):
- `lastVerified` frontmatter on fast-decay pages (anthropic-platform, protocols/*, promptfoo, nextjs-integration, real-world-examples, well-known-endpoints, robots-txt, structured-data, embeddings pages, tooling-catalog), surfaced in page UI.
- Extend `scripts/check-docs-integrity.mjs` (today: internal-link validity + top-level meta.json bidirectional completeness only) with: (a) stale `lastVerified` threshold check; (b) template paths cited in docs **and** `skills/surface/references/` must exist on disk; (c) model IDs in examples must appear in the canonical list. Keep as separate check functions under the existing runner; split the script only when it outgrows this.

## Workstream C — Reorg + Dedup

**Dedup principle (all clusters): dedupe the shared explanation into one canonical page; shrink other appearances to section-specific bridges with links. No literal wholesale merges.** (Pattern validated by the existing agents-md treatment.)

1. **Moves**:
   - `api-surface/tool-definitions.mdx` ("Universal Tool Design Patterns") → merge content into `tool-design/` pages (`naming-and-descriptions`, `schemas`); leave an API-specific stub in `api-surface`.
   - `discovery/agents-md.mdx` → shrink to a discovery-facing bridge; `context-files/agents-md.mdx` canonical.
2. **Canonical elections**:
   | Topic | Canonical | Bridges keep |
   |---|---|---|
   | Idempotency mechanism | `error-handling/idempotency.mdx` | auth keeps DPoP/jti replay specifics; tool-design keeps annotation semantics |
   | MCP auth | `authentication/mcp-auth-model.mdx` | `mcp-servers/authentication.mdx` stays as practical overview w/ links |
   | Dynamic tool selection | `tool-design/tool-curation.mdx` | cookbook keeps the embedding-technique recipe |
   | Tool annotations | `mcp-servers/annotations.mdx` (MCP semantics) | tool-design keeps safety-design framing |
   | MCP-from-OpenAPI | `mcp-servers/auto-generation.mdx` | api-surface keeps extension mapping table |
   | RFC 9457 agent extensions | merge `agent-extensions.mdx` → `rfc-9457.mdx` | **update inbound links**: `getting-started.mdx`, `error-handling/{retry-patterns,errors-for-agents}.mdx`, `scoring/*.mdx`, `error-handling/meta.json` |
3. **`protocols/emerging-standards.mdx` split**: stable material (Arazzo, OTel GenAI, AGENTS.md, llms.txt) moves to pointers at canonical homes; the page becomes a true draft/emerging watchlist (WebMCP, Web Bot Auth, A2UI, AIPREF, NLWeb, OASF, card-network payment protocols); prune the orphan scaffolding headers (lines ~75–121).
4. **Map-page renames (not merge)**: `reference-links/coverage-map.mdx` → `docs-coverage-audit.mdx` (self-audit) vs `tooling-catalog/capability-map.mdx` (external tool index). Cross-link; dedupe only shared freshness boilerplate.
5. **Scored-vs-reference explainer**: short note on `scoring/index.mdx` + `getting-started.mdx` mapping the 11 scored dimensions to sections and naming the reference-only sections.

## Workstream D — New 2026 Coverage

**All new pages follow the house pattern** (agent-facing problem in first 150 words → decision rule → implementation shape → failure modes → related links) **and must be scoped by extraction, not duplication** — pull existing material out of index pages into the new leaf pages, shrink the index to a router.

1. **`runtime-boundaries/` 1 → 3 pages**:
   - `index.mdx` — becomes section router (extract existing background-worker and sandbox sections into the new leaves).
   - `durable-execution.mdx` — differentiator: the non-determinism-inside-durable-workflow problem for agent loops (LLM calls as activities, replay safety, checkpointing partial state, liveness signaling — Temporal heartbeats as one vendor's implementation). Anchors: Temporal, Inngest, AWS LangGraph+DynamoDB pattern, Cloudflare. Mid-run signal injection mechanics live here (workflow-primitive side).
   - *(signals-and-steering as standalone page: dropped — split between this page and session-control.)*
2. **`agents/sandboxes-and-workspaces.mdx`** (placed beside `browser-access.mdx`, its established counterpart) — sandbox provider landscape (E2B, Daytona, Modal, Vercel Sandbox GA, Cloudflare Sandbox/Containers GA, AgentCore), agent filesystems, LSP-backed inspection, workspace persistence. Cross-link from runtime-boundaries.
3. **`agentic-ui/` 1 → 3 pages**:
   - `index.mdx` — router; extract "Correction And Steering"/"Approval States" into session-control.
   - `session-control.mdx` — the controller layer between UI and agent loop: modes (generalized draft→execute→review, not coding-agent-only), subagent surfacing, tool approvals, thread state, mid-run steering UX. Equal-weight anchors: Claude Code, Cursor, Codex CLI, Copilot; applies to product agents too. Note: voice barge-in is the canonical hard case and is out of scope (link when voice coverage exists).
   - `mcp-apps.mdx` — MCP Apps extension (SEP-1865, Stable `2026-01-26`, SDK 1.7.4; clients: ChatGPT, Claude, VS Code, Goose, Postman). Written against the 2026-07-28 RC normalization; `lastVerified` + scheduled recheck after July 28. Reciprocal links from `protocols/mcp.mdx`.
4. **`agents/runtime-guardrails.mdx`** — processor pipelines: PII/prompt-injection detection, moderation, cost guards, token limits as runtime defense. Anchors: NeMo Guardrails, Guardrails AI, Bedrock Guardrails, Azure AI Content Safety, Lakera. Cross-link `testing/red-teaming.mdx` as the offense side.
5. **`cookbook/code-execution.mdx`** — agent writes orchestration code instead of chained tool calls; when it wins (API breadth, token cost), when it's dangerous (sandboxing required). "Code Mode" attributed as the Cloudflare/Mastra term; Anthropic code-execution-with-MCP as parallel discovery; token-savings figures attributed as vendor benchmarks.
6. **`testing/datasets-and-experiments.mdx`** — sharp thesis: vendor-neutral golden-dataset curation, drift detection, labeling workflows. Experiment-comparison material folds into `braintrust.mdx`/`ci-integration.mdx` as updates, not restated here.
7. **`multi-agent/memory-patterns.mdx` update** — add **procedural memory** (agent-learned instructions/skills; Letta, Zep, Mem0, LangMem convergence) as the fifth type. Observational memory already exists as type 4 — verify its `compressionPolicy` example against current APIs while there.
8. **`protocols/agentic-commerce.mdx`** — foundation-backed protocols with real deployment only: **UCP** (Google+Shopify, council incl. Amazon/Meta/Microsoft/Stripe, 8k+ stores), **AP2** (FIDO Alliance, v0.2.0), **x402** (x402 Foundation under LF; AWS + Cloudflare edge deployments). ACP-commerce covered honestly as deflating (Instant Checkout shutdown). Card-network branded protocols (Visa TAP, Mastercard Agent Pay) = watchlist one-liners in emerging-standards only. Touchpoint from `authentication/agent-identity.mdx` (payment mandates as signed authorization).
9. **Distributed updates** (no new pages): WebMCP (Chrome 149 origin trial) → emerging-standards watchlist + `discovery/well-known-endpoints` mention; Web Bot Auth (IETF WG, Cloudflare production) → `authentication/agent-identity.mdx` + `discovery/robots-txt.mdx`; AG-UI (multi-vendor SDK adoption) → `agentic-ui/index.mdx` + emerging-standards; Cloudflare Pay-Per-Use pivot → `discovery/robots-txt.mdx`.
10. **Tooling-catalog update pass** (rows, not new coverage): Fly Machines/Sprites, Blaxel; Daytona OSS-frozen note; Temporal Standalone Activity; Managed Agents; sandbox GA statuses.

## Out of Scope (this round)

- Voice/realtime agents; channel integrations (Slack etc.) — adjacent ecosystems; `cookbook/notification-to-conversation.mdx` and `external-app-routing.mdx` already serve channel patterns.
- Scoring-rubric changes — the 11 dimensions stay stable.
- All vision-doc items: what-is page, Standard section, maturity model, example reports, patterns gallery — next round.
- Chasing the MCP 2026-07-28 RC — follow-up pass scheduled post-release instead.

## Design Decisions

| Decision | Rationale |
|---|---|
| Five workstreams, A→E→B→C→D | Mechanical wins first; C before D so new pages link to stable canonical targets |
| Dedup = canonical + bridges, never wholesale merges | Preserves section-specific framing; validated by existing agents-md treatment |
| Drop standalone signals-and-steering page | Would be a third overlap with agentic-ui steering + human-in-the-loop; mechanics split durable-execution/session-control |
| Sandboxes page under `agents/` not `runtime-boundaries/` | Pairs with `browser-access.mdx`, the established conceptual counterpart |
| Procedural memory, not observational | Observational already exists as type 4; procedural is the industry-converged gap |
| Payments page covers foundation-backed protocols only | User direction: ignore branded protocols likely to die; UCP/AP2/x402 have governance + deployments |
| Map pages renamed, not merged | Different audiences (self-audit vs tool index); reviewer blocker |
| `llms.txt` becomes generated | A retrievability guide shouldn't hand-maintain its own index; matches llms-full.txt |
| Disciplines phantom citations removed, not authored | Five never-built docs; pointing at real pages is proportionate |
| Fresh follow-up pass scheduled for MCP 2026-07-28 | Largest spec revision since launch lands in 22 days; don't write against a moving RC except mcp-apps (RC-normalized paths already public) |

## Verification

- `pnpm docs:check` + `pnpm build` green after every workstream; one commit (series) per workstream.
- Integrity-script extensions (Workstream B) act as regression guards for the exact failure modes found: template-path drift, model-ID drift, freshness decay.
- Every fast-moving claim touched gets a source link + `lastVerified` stamp.
- New pages: house pattern compliance; extraction-not-duplication verified by grepping for restated blocks.
- Rubric sync (`skills/surface/references/scoring-rubric.md` ↔ `docs/scoring/rubric.mdx`) spot-checked after C.

## Open Questions

- Whether `search_docs` (MCP) and `/api/search` should gain real full-text indexing (e.g. Orama over page bodies) or minimal contract fix only — decide during Workstream E by effort.
- Whether the two new writer agents (tool-design, multi-agent) are worth authoring vs documenting agentic-patterns-writer ownership — decide during Workstream A.
- Post-July-28 MCP pass timing and scope (stateless core + extensions framework will touch protocols/mcp, mcp-servers section, mcp-apps page, templates).
