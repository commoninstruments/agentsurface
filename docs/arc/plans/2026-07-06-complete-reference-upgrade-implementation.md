# Complete Reference Upgrade — Implementation Plan

Date: 2026-07-06
Spec: `docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md` (approved)
Branch: `main` (user-directed; no feature branch)
Commit posture: one commit series per workstream, workstreams ordered A → E → B → C → D.

## Quality Gates (repo-adapted)

This is a docs/content repo with no vitest. Gates per task:

- `pnpm docs:check` — link + meta integrity (extended during this plan)
- `pnpm build` — full static build (149+ pages)
- `pnpm lint` — shared oxlint lane
- TDD adaptation: integrity-script extensions are written BEFORE the content they guard. The new check must FAIL against current drift (the failing test), then content fixes make it pass.

## File Structure

New files: `templates/errors-and-auth/rate-limit-headers.ts`, `templates/tools-and-orchestration/memory-bank.ts`, `skills/surface/agents/tool-design-writer.md`, `skills/surface/agents/multi-agent-writer.md`, `src/lib/search.ts`, `src/app/llms.txt/route.ts`, `docs/surface/README.md`, `src/content/docs/reference-links/models.mdx` (canonical model list), `src/content/docs/runtime-boundaries/durable-execution.mdx`, `src/content/docs/agents/sandboxes-and-workspaces.mdx`, `src/content/docs/agents/runtime-guardrails.mdx`, `src/content/docs/agentic-ui/session-control.mdx`, `src/content/docs/agentic-ui/mcp-apps.mdx`, `src/content/docs/cookbook/code-execution.mdx`, `src/content/docs/testing/datasets-and-experiments.mdx`, `src/content/docs/protocols/agentic-commerce.mdx`.

Renames: `disciplines/agent-evaluation.md` → `disciplines/readiness-auditing.md`, `reference-links/coverage-map.mdx` → `reference-links/docs-coverage-audit.mdx`.

Deletions/merges: `error-handling/agent-extensions.mdx` (into rfc-9457), `api-surface/tool-definitions.mdx` (content into tool-design, stub remains), `public/llms.txt` (replaced by route).

---

## Workstream A — Sync Repairs

<task id="A1" depends="" type="auto">
  <name>Extend integrity script: template-path existence check (failing first)</name>
  <files>
    <modify>scripts/check-docs-integrity.mjs</modify>
  </files>
  <read_first>
    scripts/check-docs-integrity.mjs
    docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md (Workstream A.1, B "The system")
  </read_first>
  <action>
    Add a check function: scan src/content/docs/**/*.mdx AND skills/surface/references/*.md for template
    citations matching /\btemplates\/[A-Za-z0-9._/-]+\.(ts|tsx|yaml|json|md|txt|mdc)\b/i (case-insensitive,
    slash-optional, catches uppercase AGENTS.md/CLAUDE.md/monorepo-AGENTS.md). Every hit must resolve to an
    existing file under templates/. Report misses with file:line. Keep as a separate function under the
    existing runner pattern (issues array, exit 1).
  </action>
  <verify>node scripts/check-docs-integrity.mjs — FAILS listing the known flat-path drift in skills/surface/references/ (this is the failing test; do not fix content in this task)</verify>
  <done>Check exists, fails on current state, docs-side citations pass</done>
  <commit>feat(scripts): add template-path existence check to docs integrity</commit>
</task>

<task id="A2" depends="A1" type="auto">
  <name>Re-path skill references; create two missing templates</name>
  <files>
    <modify>skills/surface/references/*.md (all hits from A1 sweep)</modify>
    <create>templates/errors-and-auth/rate-limit-headers.ts</create>
    <create>templates/tools-and-orchestration/memory-bank.ts</create>
  </files>
  <read_first>
    A1 failure output (authoritative hit list)
    templates/errors-and-auth/idempotency-middleware.ts (style reference)
    templates/tools-and-orchestration/tool-registry.ts (style reference)
    skills/surface/references/error-handling.md:367 and multi-agent.md:225 (what the missing templates promise)
  </read_first>
  <action>
    Fix every hit from A1 to the correct 7-kit subdirectory path (docs-side paths are source of truth).
    Author rate-limit-headers.ts: RateLimit/Retry-After header parsing + emission helpers with agent-facing
    retry guidance, matching the errors-and-auth kit's TS style. Author memory-bank.ts: minimal shared
    memory-bank pattern for multi-agent handoffs (read/write/compact interface) matching tools-and-orchestration style.
  </action>
  <verify>node scripts/check-docs-integrity.mjs — template check passes (zero misses); spec's sweep grep returns zero hits</verify>
  <done>All skill-reference template paths resolve; both promised templates exist</done>
  <commit>fix(skill): re-path template references to kit layout; add missing templates</commit>
</task>

<task id="A3" depends="" type="auto">
  <name>Disciplines repair: phantom citations, rename, de-orphan</name>
  <files>
    <modify>disciplines/evaluation.md, disciplines/orchestration.md, disciplines/retrievability.md, disciplines/agentic-patterns.md</modify>
    <modify>README.md (disciplines pointer), skills/surface/SKILL.md (pointer if absent)</modify>
    <create>disciplines/readiness-auditing.md (git mv from agent-evaluation.md)</create>
  </files>
  <read_first>
    disciplines/*.md "See also" sections
    docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md (Workstream A.3)
  </read_first>
  <action>
    Repoint all phantom citations (eval-cookbook.md, metrics.md, orchestration-cookbook.md,
    retrieval-cookbook.md, chunking-guide.md, /references/tool-cookbook.md, /cookbook/goal-decomposition.md,
    /references/safety.md, /references/retrieval-cookbook.md) at real targets: docs pages under
    src/content/docs/ or skills/surface/references/ files. Do NOT author new files. git mv
    agent-evaluation.md → readiness-auditing.md; update any inbound references. Add one-line pointers in
    README + SKILL.md so disciplines/ is discoverable.
  </action>
  <verify>rg '\breferences/(eval-cookbook|metrics|orchestration-cookbook|retrieval-cookbook|chunking-guide|tool-cookbook|safety)\.md' disciplines/ returns nothing; rg 'agent-evaluation' returns nothing outside git history</verify>
  <done>No dangling citations; rename complete; folder discoverable</done>
  <commit>fix(disciplines): repair phantom citations, rename readiness-auditing, de-orphan</commit>
</task>

<task id="A4" depends="" type="auto">
  <name>Add tool-design and multi-agent writer agents</name>
  <files>
    <create>skills/surface/agents/tool-design-writer.md</create>
    <create>skills/surface/agents/multi-agent-writer.md</create>
    <modify>.skill.yaml, README.md (agent lists if enumerated)</modify>
  </files>
  <read_first>
    skills/surface/agents/error-designer.md (format model)
    skills/surface/agents/agentic-patterns-writer.md (overlap boundary)
    skills/surface/references/tool-design.md, skills/surface/references/multi-agent.md
  </read_first>
  <action>
    Author two transform agents in the existing writer format (frontmatter model/tools, dimension scope,
    inputs, outputs). tool-design-writer: transforms tool naming/schemas/annotations/curation per the
    tool-design reference. multi-agent-writer: transforms orchestration/supervisor/memory/tool-sprawl
    surfaces per the multi-agent reference. Define boundary vs agentic-patterns-writer (patterns-writer
    emits cookbook patterns; these transform existing project surfaces). Update .skill.yaml
    specialist-agents list (10 → 12) and README list.
  </action>
  <verify>Both files parse as agent format matching siblings; .skill.yaml and README lists match skills/surface/agents/ non-score contents exactly</verify>
  <done>12 writer agents, lists synchronized</done>
  <commit>feat(skill): add tool-design and multi-agent writer agents</commit>
</task>

<task id="A5" depends="A1,A2,A3,A4" type="checkpoint:verify">
  <name>Workstream A checkpoint</name>
  <action>Present A results: integrity check output, template diffs, renamed discipline, new agents. Run pnpm docs:check + pnpm build + pnpm lint.</action>
  <verify>User approves or describes issues</verify>
  <done>Workstream A approved</done>
</task>

---

## Workstream E — Repo Credibility + Infrastructure

<task id="E1" depends="" type="auto">
  <name>Rewrite CHANGELOG from git history</name>
  <files>
    <modify>CHANGELOG.md</modify>
  </files>
  <read_first>
    CHANGELOG.md (current fiction — do not preserve claims)
    git log --oneline (full history for honest dating)
    .skill.yaml, .claude-plugin/plugin.json (current 2.0.0)
  </read_first>
  <action>
    Replace entirely. Honest entries: 1.0.0 (initial agentify plugin, dated from commit 34bac47), 2.0.0
    (unified surface skill, docs site, 7 template kits, 11 score + 10 writer agents, 7 disciplines — dated
    from the consolidation commits), 2.x unreleased section for this upgrade. No @surface/* packages, no
    Bun/Turborepo, no invented counts. Every claim must correspond to files in the repo.
  </action>
  <verify>Every named artifact in CHANGELOG exists in the repo; version entries match .skill.yaml lineage</verify>
  <done>CHANGELOG describes the actual product</done>
  <commit>docs: rewrite CHANGELOG to match actual product history</commit>
</task>

<task id="E2" depends="E1" type="auto">
  <name>Version + naming alignment across packaging surfaces</name>
  <files>
    <modify>package.json, .skill.yaml, .claude-plugin/plugin.json, src/app/mcp/route.ts, public/.well-known/mcp/server-card.json, INSTALL.md, CLAUDE.md, public/.well-known/agent-skills/index.json</modify>
  </files>
  <read_first>
    docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md (Workstream E.2, E.3)
    All listed files
  </read_first>
  <action>
    Single version 2.1.0 everywhere (package.json version, skill/plugin manifests, McpServer constructor,
    server-card, INSTALL zip name). Drop `@anthropic/surface` npm claim from .skill.yaml (remove or use
    unscoped placeholder marked "not published"). Unify plugin name to `surface` in INSTALL.md
    (`/plugin install surface`). Unify install command to `npx skills add https://github.com/howells/agentsurface`
    everywhere. Fix README "Node.js 20+, pnpm 9" → "Node 24.15+, pnpm 11".
  </action>
  <verify>rg '1\.0\.0|2\.0\.0' across packaging files returns only CHANGELOG history entries; rg '@anthropic/surface' returns nothing; install command identical in all three locations</verify>
  <done>One version, one name, one install command, correct runtime claims</done>
  <commit>fix: align versions, naming, and install commands across packaging surfaces</commit>
</task>

<task id="E3" depends="" type="auto">
  <name>Fix on-site search: shared helper, body indexing, client contract</name>
  <files>
    <create>src/lib/search.ts</create>
    <modify>src/app/api/search/route.ts, src/app/mcp/route.ts, src/app/layout.tsx (RootProvider search config if needed)</modify>
  </files>
  <read_first>
    src/app/api/search/route.ts, src/app/mcp/route.ts (duplicated substring search)
    src/lib/source.ts
    Fumadocs docs for RootProvider search + createFromSource (use context7 or node_modules/fumadocs-core)
  </read_first>
  <action>
    TIME-BOX: half a day. Preferred minimal path: use fumadocs-core's createFromSource search route
    (Orama-backed, indexes structured page content) at /api/search so the default search dialog contract
    just works. Extract shared search logic into src/lib/search.ts consumed by the MCP search_docs tool
    (search title + description + body, ranked). If createFromSource fights the setup, fallback: keep custom
    route but return the SortedResult[] shape the client expects and index body text. Do not build beyond
    the time-box.
  </action>
  <verify>pnpm build passes; dev-server manual check: Cmd+K search returns body-content matches for a term appearing only in page prose (e.g. "observational"); MCP search_docs returns same-quality results</verify>
  <done>Search works against page bodies through both surfaces</done>
  <commit>fix(site): working full-content search shared by search API and MCP tool</commit>
</task>

<task id="E4" depends="" type="auto">
  <name>Create docs/surface/ audit-history home; generate llms.txt</name>
  <files>
    <create>docs/surface/README.md</create>
    <create>src/app/llms.txt/route.ts</create>
    <delete>public/llms.txt</delete>
    <modify>CLAUDE.md (confirm pointer accurate)</modify>
  </files>
  <read_first>
    CLAUDE.md, docs/content-structure-audit-2026-06-02.md, docs/agent-surface-product-vision.md
    src/app/llms-full.txt/route.ts (pattern to mirror)
    public/llms.txt (current hand-curated sections to preserve as route logic)
  </read_first>
  <action>
    docs/surface/README.md: index of audit history + active plans, linking the 2026-06-02 audit, product
    vision, this spec + plan (keep files where they are; the README is the index CLAUDE.md promises).
    llms.txt route: force-static, generated from source.getPages() grouped by section (mirroring
    llms-full.txt's approach), preserving the curated preamble + agent entry points from the static file;
    same Content-Signal headers. Delete public/llms.txt.
  </action>
  <verify>pnpm build passes; /llms.txt renders with all current sections; adding a hypothetical page would appear without manual edits; docs/surface/README.md links resolve</verify>
  <done>CLAUDE.md pointer is real; llms.txt cannot drift from routes</done>
  <commit>feat(site): generated llms.txt; add docs/surface audit-history index</commit>
</task>

<task id="E5" depends="E1,E2,E3,E4" type="checkpoint:verify">
  <name>Workstream E checkpoint</name>
  <action>Present E results: new CHANGELOG, version alignment diff, search demo instructions (pnpm dev, Cmd+K "observational"), /llms.txt output. Run pnpm docs:check + build + lint.</action>
  <verify>User approves or describes issues</verify>
  <done>Workstream E approved</done>
</task>

---

## Workstream B — Currency Sweep + Freshness System

<task id="B1" depends="" type="auto">
  <name>Canonical model list page + model-ID integrity check (failing first)</name>
  <files>
    <create>src/content/docs/reference-links/models.mdx</create>
    <modify>src/content/docs/reference-links/meta.json, scripts/check-docs-integrity.mjs</modify>
  </files>
  <read_first>
    docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md (Workstream B.1 — full verified lineup)
  </read_first>
  <action>
    models.mdx: canonical July-2026 list with lastVerified: 2026-07-06 — Anthropic (claude-fable-5,
    claude-opus-4-8, claude-sonnet-5, claude-haiku-4-5-20251001; Sonnet 4/Opus 4 retired 2026-06-15),
    OpenAI (gpt-5.5 flagship, gpt-5.4 value; o-series sunset Dec 2026), Google (gemini-3.5-flash,
    gemini-3.1-pro-preview), embeddings (text-embedding-3-large, voyage-4 family, voyage-context-4,
    gemini-embedding-2). Integrity check: scan mdx code blocks + templates/ for model-ID-shaped strings
    (claude-*, gpt-*, gemini-*, o[0-9]*, voyage-*, text-embedding-*) and flag any not in the canonical
    allowlist (allowlist includes deliberately-old IDs tagged in an "anti-pattern examples" section of
    models.mdx: claude-3-sonnet in context-files/anti-patterns.mdx etc.).
  </action>
  <verify>node scripts/check-docs-integrity.mjs — FAILS listing stale IDs (claude-3-5-sonnet-20241022, gpt-4-turbo, gpt-4o, gemini-1.5-pro, claude-opus-4-7, gpt-4.1-mini, gpt-5.4-as-flagship contexts)</verify>
  <done>Canonical list published; check fails on current drift</done>
  <commit>feat(docs): canonical model list + model-ID integrity check</commit>
</task>

<task id="B2" depends="B1" type="auto">
  <name>Model-ID sweep across docs and templates</name>
  <files>
    <modify>All files flagged by B1 (docs mdx + all 7 template kits)</modify>
  </files>
  <read_first>
    B1 failure output (authoritative)
    src/content/docs/reference-links/models.mdx
  </read_first>
  <action>
    Replace stale IDs with canonical equivalents by role: flagship→claude-opus-4-8 or gpt-5.5,
    value/fast→claude-haiku-4-5-20251001 or gpt-5.4, Google→gemini-3.5-flash. Templates: bump
    claude-opus-4-7→claude-opus-4-8, claude-sonnet-4-6→claude-sonnet-5, gpt-5.4-as-flagship→gpt-5.5,
    gpt-4.1-mini→gpt-5.4 (tool-loop-vercel-ai.ts, toolpick.ts). Leave allowlisted anti-pattern examples.
    Keep prose claims consistent with swapped IDs (pricing/context-window numbers only where already stated).
  </action>
  <verify>node scripts/check-docs-integrity.mjs — model check passes; pnpm build passes</verify>
  <done>One coherent July-2026 model vocabulary corpus-wide</done>
  <commit>fix(docs): unify model IDs to July 2026 canonical set</commit>
</task>

<task id="B3" depends="" type="auto">
  <name>Rewrite agents/anthropic-platform.mdx to July 2026</name>
  <files>
    <modify>src/content/docs/agents/anthropic-platform.mdx</modify>
  </files>
  <read_first>
    src/content/docs/agents/anthropic-platform.mdx
    docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md (Workstream B.2 — verified platform facts)
  </read_first>
  <action>
    Full rewrite per verified facts: Managed Agents public beta (managed-agents-2026-04-01 header, ant CLI,
    environments/sessions/webhooks/vaults, self-hosted sandboxes, cron); Claude Code 2.1.x surfaces
    (terminal/IDE/desktop/browser, code.claude.com docs); Agent SDK naming unchanged; Skills as cross-vendor
    standard (agentskills.io, 40+ clients, skills.sh marketplace); MCP connector rev mcp-client-2025-11-20 +
    defer_loading; tool search/programmatic tool calling/code execution/web fetch/memory GA (2026-02-17);
    retirement executed 2026-06-15 (past tense); docs domain platform.claude.com. Mark press-only claims
    (session-hour pricing) as unverified or omit. Add lastVerified: 2026-07-06 frontmatter.
  </action>
  <verify>No future-tense claims about past dates; every dated claim traceable to spec's verified facts; pnpm docs:check passes</verify>
  <done>Page reflects July 2026 platform state with freshness stamp</done>
  <commit>docs(agents): rewrite anthropic platform page for July 2026</commit>
</task>

<task id="B4" depends="" type="auto">
  <name>Protocol and standards status updates</name>
  <files>
    <modify>src/content/docs/protocols/{index,mcp,a2a,acp,comparison,emerging-standards}.mdx, src/content/docs/testing/{observability,promptfoo}.mdx, src/content/docs/discovery/llms-txt.mdx, src/content/docs/authentication/auth-md.mdx</modify>
  </files>
  <read_first>
    docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md (Workstream B.3 — all verified statuses)
    Each target page
  </read_first>
  <action>
    MCP: keep 2025-11-25 pin; add 2026-07-28 RC note (stateless core, extensions framework, OAuth
    hardening) with "follow-up pass scheduled post-release". A2A: v1.0.1, production, 150+ orgs, AAIF.
    ACP: three-way disambiguation (commerce: OpenAI+Stripe, NO Meta co-creator, Instant Checkout shut down
    2026-03, beta spec 2026-04-17, momentum→UCP; client: Zed/JetBrains protocol v1, ~50-agent registry;
    IBM: dead, absorbed into A2A 2025-08). OTel GenAI: still Development; moved to unversioned
    semantic-conventions-genai repo at semconv v1.42.0. llms.txt: Ahrefs 97%-zero-requests May 2026,
    Google keywords-meta comparison; keep coding-agent niche as the honest value case. auth.md: emerging,
    WorkOS-published adopters, no standards-body track. Promptfoo: acquisition announced 2026-03-09,
    site banners "part of OpenAI", close unconfirmed, OSS active. lastVerified stamps on all touched pages.
  </action>
  <verify>Claims match spec's verified-facts inline; comparison.mdx maturity table consistent with per-protocol pages; pnpm docs:check passes</verify>
  <done>Protocol pages current to 2026-07-06 with stamps</done>
  <commit>docs(protocols): update protocol and standards statuses to July 2026</commit>
</task>

<task id="B5" depends="" type="auto">
  <name>Framework/tooling refs, KuzuDB removal, competitive citation</name>
  <files>
    <modify>src/content/docs/mcp-servers/nextjs-integration.mdx, src/content/docs/context-files/drift-detection.mdx, src/content/docs/data-retrievability/{knowledge-graphs,index}.mdx, src/content/docs/scoring/rubric.mdx, src/content/docs/discovery/{robots-txt,index}.mdx, src/content/docs/agents/browser-access.mdx</modify>
  </files>
  <read_first>
    docs/arc/specs/2026-07-06-complete-reference-upgrade-spec.md (Workstream B.4–B.6)
    Each target page
  </read_first>
  <action>
    Next.js 15→16 (16.2.x stable; Node 20+ floor in drift-detection example updated). Daytona: OSS repo
    frozen 2026-06, hosted active — fix links. Vercel Sandbox GA 2026-01-30 (+persistence GA), Cloudflare
    Sandbox SDK + Containers GA 2026-04-13, note in browser-access + sandbox mentions. KuzuDB: remove dead
    section knowledge-graphs.mdx:142-174, remove citations index.mdx:104 and rubric.mdx:190 (replace with
    Neo4j/Memgraph). Cite Cloudflare Agent Readiness score (isitagentready.com, 2026-04) from
    discovery/index.mdx as independent category validation. Cloudflare Pay-Per-Use pivot (2026-07-01) noted
    in robots-txt.mdx.
  </action>
  <verify>rg -i kuzu src/content/docs returns nothing; rg 'Next\.js 15' returns nothing current-tense; pnpm docs:check passes</verify>
  <done>Tooling refs current; dead tools excised; category validator cited</done>
  <commit>docs: refresh framework and tooling references to July 2026</commit>
</task>

<task id="B6" depends="B3,B4,B5" type="auto">
  <name>lastVerified freshness system</name>
  <files>
    <modify>scripts/check-docs-integrity.mjs, source.config.ts (frontmatter schema if enforced), src/app/docs/[[...slug]]/page.tsx (render stamp)</modify>
    <modify>Fast-decay pages lacking stamps: mcp-servers/real-world-examples.mdx, discovery/{well-known-endpoints,structured-data}.mdx, data-retrievability/{embeddings,multimodal-embeddings,vector-databases}.mdx, tooling-catalog/*.mdx, protocols/*.mdx (if not stamped in B4)</modify>
  </files>
  <read_first>
    scripts/check-docs-integrity.mjs (post-A1/B1 shape)
    source.config.ts, src/app/docs/[[...slug]]/page.tsx
    docs/arc/specs spec (Workstream B "The system")
  </read_first>
  <action>
    Frontmatter lastVerified: YYYY-MM-DD on fast-decay pages (stamp with the date content was actually
    verified: 2026-07-06 for pages touched this round, 2026-06-02 for data-retrievability's existing
    review notes). Integrity check: pages carrying lastVerified fail when stamp exceeds 120 days; maintain
    a FAST_DECAY list in the script requiring the field on named pages. Render "Last verified" in the docs
    page UI near the title. Keep as separate check function.
  </action>
  <verify>node scripts/check-docs-integrity.mjs passes; artificially backdating a stamp to 2026-01-01 makes it fail; stamp visible on rendered page</verify>
  <done>Freshness decay is mechanically detected; this is the last manual sweep</done>
  <commit>feat(docs): lastVerified freshness stamps with staleness enforcement</commit>
</task>

<task id="B7" depends="B1,B2,B3,B4,B5,B6" type="checkpoint:verify">
  <name>Workstream B checkpoint</name>
  <action>Present B results: integrity output (all checks green), models page, anthropic-platform rewrite, protocol updates summary. Run pnpm docs:check + build + lint.</action>
  <verify>User approves or describes issues</verify>
  <done>Workstream B approved</done>
</task>

---

## Workstream C — Reorg + Dedup

Dedup principle everywhere: canonical page owns the shared explanation; other appearances shrink to section-specific bridges with links. Never delete section-specific framing.

<task id="C1" depends="" type="auto">
  <name>Misfiled pages: tool-definitions merge, discovery/agents-md bridge</name>
  <files>
    <modify>src/content/docs/api-surface/tool-definitions.mdx (→ stub), src/content/docs/tool-design/{naming-and-descriptions,schemas,index}.mdx, src/content/docs/api-surface/meta.json, src/content/docs/discovery/agents-md.mdx (→ bridge), src/content/docs/discovery/meta.json</modify>
  </files>
  <read_first>
    All five content pages
    src/content/docs/context-files/agents-md.mdx (canonical target)
  </read_first>
  <action>
    tool-definitions.mdx: move universal tool-design material (three-field minimum, naming, schemas,
    framework adapters) into the matching tool-design pages (merge, don't duplicate — diff each section
    against existing coverage first); leave an API-specific stub covering only OpenAPI-operation→tool
    mapping with links. discovery/agents-md.mdx: shrink to a short discovery-facing bridge (why context
    files matter for discovery + link to context-files section); context-files/agents-md.mdx is canonical.
    Update inbound links repo-wide (rg for both slugs).
  </action>
  <verify>pnpm docs:check passes (catches dangling links); no paragraph appears verbatim in two pages (spot-check by grepping distinctive sentences)</verify>
  <done>Tool design lives in tool-design; AGENTS.md has one canonical home</done>
  <commit>refactor(docs): merge misfiled tool-definitions into tool-design; bridge discovery agents-md</commit>
</task>

<task id="C2" depends="C1" type="auto">
  <name>Canonical elections: six dedup clusters</name>
  <files>
    <modify>error-handling/{idempotency,rfc-9457,retry-patterns,errors-for-agents,meta.json}, authentication/{mcp-auth-model,idempotency-and-replay}, mcp-servers/{authentication,annotations,auto-generation}, tool-design/{tool-curation,idempotency-and-safety}, api-surface/openapi-extensions, cookbook/{semantic-tool-selection,tool-annotations}, multi-agent/tool-sprawl, getting-started.mdx, scoring/*.mdx (inbound links)</modify>
    <delete>src/content/docs/error-handling/agent-extensions.mdx (merged into rfc-9457)</delete>
  </files>
  <read_first>
    docs/arc/specs spec (Workstream C.2 table — canonical/bridge assignments)
    Each cluster's pages before editing
  </read_first>
  <action>
    Per spec table: idempotency mechanism → error-handling/idempotency canonical (auth keeps DPoP/jti,
    tool-design keeps annotation semantics as bridges). MCP auth → authentication/mcp-auth-model canonical
    (mcp-servers/authentication becomes practical overview + links). Dynamic tool selection →
    tool-design/tool-curation canonical (cookbook keeps embedding recipe, tool-sprawl bridges). Tool
    annotations → mcp-servers/annotations canonical (tool-design keeps safety-design framing). MCP-from-
    OpenAPI → mcp-servers/auto-generation canonical (api-surface keeps extension mapping table). RFC 9457
    extensions: merge agent-extensions.mdx content into rfc-9457.mdx, delete page, update
    error-handling/meta.json AND all inbound prose links (getting-started, retry-patterns,
    errors-for-agents, scoring/*).
  </action>
  <verify>pnpm docs:check passes; rg 'agent-extensions' src/content/docs returns nothing; each cluster's shared explanation exists in exactly one place</verify>
  <done>Six clusters deduped to canonical + bridges</done>
  <commit>refactor(docs): elect canonical pages for six duplication clusters</commit>
</task>

<task id="C3" depends="C2" type="auto">
  <name>Emerging-standards split, map renames, scored-vs-reference explainer</name>
  <files>
    <modify>src/content/docs/protocols/emerging-standards.mdx, src/content/docs/reference-links/{meta.json,index.mdx}, src/content/docs/tooling-catalog/capability-map.mdx, src/content/docs/scoring/index.mdx, src/content/docs/getting-started.mdx</modify>
    <create>src/content/docs/reference-links/docs-coverage-audit.mdx (git mv from coverage-map.mdx)</create>
  </files>
  <read_first>
    protocols/emerging-standards.mdx (note orphan headers ~75-121)
    reference-links/coverage-map.mdx, tooling-catalog/capability-map.mdx
    scoring/index.mdx, getting-started.mdx
  </read_first>
  <action>
    emerging-standards: remove re-coverage of stable material (Arazzo→api-surface link, OTel GenAI→
    testing/observability link, AGENTS.md→context-files link, llms.txt→discovery link); keep as a true
    draft watchlist: WebMCP (Chrome 149 origin trial), Web Bot Auth (IETF WG chartered), A2UI v0.9, AIPREF,
    NLWeb (losing mindshare), OASF, card-network payment protocols (Visa TAP, Mastercard Agent Pay —
    one-liners). Prune orphan scaffolding headers. git mv coverage-map → docs-coverage-audit (title:
    "Docs Coverage Audit"), update meta.json + inbound links; cross-link with capability-map; dedupe shared
    freshness boilerplate only. Explainer: short section on scoring/index + getting-started mapping 11
    scored dimensions ↔ sections and naming reference-only sections (agents, agentic-ui, runtime-boundaries,
    cookbook, protocols, reference-links, tooling-catalog, scoring).
  </action>
  <verify>pnpm docs:check passes; emerging-standards contains no full re-explanations of stable standards; both map pages cross-link</verify>
  <done>Watchlist is a watchlist; maps disambiguated; dimension model explained</done>
  <commit>refactor(docs): split emerging-standards, rename coverage audit, explain dimension model</commit>
</task>

<task id="C4" depends="C1,C2,C3" type="checkpoint:verify">
  <name>Workstream C checkpoint</name>
  <action>Present C results: dedup summary (cluster → canonical), nav diffs, rubric-sync spot check (skills/surface/references/scoring-rubric.md ↔ docs/scoring/rubric.mdx still identical). Run pnpm docs:check + build + lint.</action>
  <verify>User approves or describes issues</verify>
  <done>Workstream C approved</done>
</task>

---

## Workstream D — New 2026 Coverage

House pattern for every new page: agent-facing problem in first 150 words → decision rule → implementation shape → failure modes → related links. All new pages get lastVerified: 2026-07-06. Extraction, not duplication: when a new leaf takes over an index section, the index shrinks to a router entry.

<task id="D1" depends="" type="auto">
  <name>runtime-boundaries: durable-execution page + index becomes router</name>
  <files>
    <create>src/content/docs/runtime-boundaries/durable-execution.mdx</create>
    <modify>src/content/docs/runtime-boundaries/{index.mdx,meta.json}</modify>
  </files>
  <read_first>
    src/content/docs/runtime-boundaries/index.mdx (extract background/workflow section)
    src/content/docs/cookbook/autonomous-background-agents.mdx (boundary: scheduling/idempotency already covered)
    docs/arc/specs spec (Workstream D.1)
  </read_first>
  <action>
    durable-execution.mdx thesis: the non-determinism-inside-durable-workflow problem for agent loops —
    LLM calls as replay-safe activities, checkpointing partial agent state, resumption semantics, liveness/
    progress signaling (Temporal heartbeats as one vendor's mechanism), mid-run signal injection (workflow-
    primitive side), replay/time-travel debugging. Anchors with equal weight: Temporal, Inngest, Cloudflare
    Workflows, AWS LangGraph+DynamoDB pattern; Mastra as one option. Extract existing "Background And
    Workflow Agents" material from index into this page; index shrinks to router with boundary-type table
    retained.
  </action>
  <verify>pnpm docs:check passes; extracted content no longer duplicated in index (grep distinctive sentences); house pattern followed</verify>
  <done>Durable execution has a real home; index routes</done>
  <commit>docs(runtime-boundaries): add durable execution guidance for agent loops</commit>
</task>

<task id="D2" depends="" type="auto">
  <name>agents/sandboxes-and-workspaces.mdx</name>
  <files>
    <create>src/content/docs/agents/sandboxes-and-workspaces.mdx</create>
    <modify>src/content/docs/agents/meta.json, src/content/docs/runtime-boundaries/index.mdx (cross-link from its sandbox section)</modify>
  </files>
  <read_first>
    src/content/docs/agents/browser-access.mdx (structural sibling — mirror its decision-matrix format)
    src/content/docs/tooling-catalog/browser-sandbox-and-integration.mdx (existing catalog rows — don't restate)
    docs/arc/specs spec (Workstream D.2 + B.4 sandbox statuses)
  </read_first>
  <action>
    Decision-matrix page mirroring browser-access.mdx: when an agent needs a sandbox (untrusted code, file
    manipulation, long-lived workspaces), provider landscape (E2B, Daytona hosted [OSS frozen 2026-06],
    Modal, Vercel Sandbox GA, Cloudflare Sandbox/Containers GA, AWS AgentCore; Anthropic Managed Agents
    self-hosted sandboxes), agent filesystems, LSP-backed code inspection, workspace persistence + search
    (BM25/vector/hybrid). Placed beside browser-access as its counterpart; catalog page keeps the full
    vendor table (link, don't duplicate).
  </action>
  <verify>pnpm docs:check passes; house pattern; no vendor-table duplication with tooling-catalog</verify>
  <done>Sandbox decision guidance pairs with browser-access</done>
  <commit>docs(agents): add sandboxes and workspaces decision guidance</commit>
</task>

<task id="D3" depends="" type="auto">
  <name>agentic-ui: session-control + mcp-apps pages, index becomes router</name>
  <files>
    <create>src/content/docs/agentic-ui/session-control.mdx</create>
    <create>src/content/docs/agentic-ui/mcp-apps.mdx</create>
    <modify>src/content/docs/agentic-ui/{index.mdx,meta.json}, src/content/docs/protocols/mcp.mdx (reciprocal link)</modify>
  </files>
  <read_first>
    src/content/docs/agentic-ui/index.mdx (extract Correction And Steering + Approval States)
    src/content/docs/multi-agent/human-in-the-loop.mdx (boundary: approval checkpoints already covered)
    docs/arc/specs spec (Workstream D.3)
  </read_first>
  <action>
    session-control.mdx: controller layer between UI and agent loop — generalized modes (draft→execute→
    review, not coding-only), subagent surfacing, tool approvals, thread state, mid-run steering UX. Equal-
    weight anchors: Claude Code, Cursor, Codex CLI, Copilot; applies to product agents. Note voice barge-in
    as canonical hard case, out of scope. Extract index's steering/approval sections here. mcp-apps.mdx:
    MCP Apps extension (SEP-1865, Stable 2026-01-26, SDK 1.7.4; clients: ChatGPT, Claude, VS Code, Goose,
    Postman, M365 Copilot; merges MCP-UI + OpenAI Apps SDK lineages), written against 2026-07-28 RC
    normalization, tool-UI lifecycle, security model; lastVerified + explicit "recheck after 2026-07-28"
    note. Reciprocal link from protocols/mcp.mdx. Index becomes router.
  </action>
  <verify>pnpm docs:check passes; extraction verified; both pages house pattern; AG-UI mentioned in index with emerging-standards link</verify>
  <done>agentic-ui is a real section (3 pages)</done>
  <commit>docs(agentic-ui): add session control and MCP Apps pages</commit>
</task>

<task id="D4" depends="" type="auto">
  <name>agents/runtime-guardrails.mdx + code-execution + datasets pages</name>
  <files>
    <create>src/content/docs/agents/runtime-guardrails.mdx</create>
    <create>src/content/docs/cookbook/code-execution.mdx</create>
    <create>src/content/docs/testing/datasets-and-experiments.mdx</create>
    <modify>src/content/docs/{agents,cookbook,testing}/meta.json, src/content/docs/testing/{red-teaming,braintrust,ci-integration}.mdx (cross-links + experiment folds)</modify>
  </files>
  <read_first>
    src/content/docs/testing/{red-teaming,braintrust,ci-integration,evaluation-framework}.mdx (boundaries)
    src/content/docs/cookbook/index.mdx (pattern format)
    docs/arc/specs spec (Workstream D.4–D.6)
  </read_first>
  <action>
    runtime-guardrails.mdx: processor pipelines as runtime defense — input processors (PII detection,
    prompt-injection detection, moderation), output processors (cost guards, token limiters, response
    filtering), placement in the agent loop. Anchors: NeMo Guardrails, Guardrails AI, Bedrock Guardrails,
    Azure AI Content Safety, Lakera; Mastra processors as one implementation. Cross-link red-teaming as
    offense side. code-execution.mdx: agent writes orchestration code instead of chained tool calls — when
    it wins (API breadth, token cost), when it's dangerous (sandbox required — link D2), "Code Mode" as
    Cloudflare/Mastra term, Anthropic code-execution-with-MCP as parallel discovery, token figures
    attributed as vendor benchmarks. datasets-and-experiments.mdx: golden-dataset curation methodology,
    drift detection, labeling workflows — vendor-neutral; experiment-comparison specifics fold INTO
    braintrust.mdx/ci-integration.mdx as small updates, linked not restated.
  </action>
  <verify>pnpm docs:check passes; three pages house pattern; datasets page contains no restated braintrust/ci material</verify>
  <done>Guardrails, code execution, datasets covered without duplication</done>
  <commit>docs: add runtime guardrails, code execution, and dataset curation guidance</commit>
</task>

<task id="D5" depends="" type="auto">
  <name>Procedural memory + agentic commerce + distributed updates</name>
  <files>
    <modify>src/content/docs/multi-agent/memory-patterns.mdx, src/content/docs/authentication/agent-identity.mdx, src/content/docs/discovery/{robots-txt,well-known-endpoints}.mdx, src/content/docs/protocols/meta.json</modify>
    <create>src/content/docs/protocols/agentic-commerce.mdx</create>
  </files>
  <read_first>
    src/content/docs/multi-agent/memory-patterns.mdx (observational is type 4 — verify compressionPolicy example currency)
    src/content/docs/protocols/{acp,emerging-standards}.mdx (post-B4/C3 state)
    docs/arc/specs spec (Workstream D.7–D.9)
  </read_first>
  <action>
    memory-patterns: add procedural memory as fifth type (agent-learned instructions/skills; Letta, Zep,
    Mem0, LangMem convergence); verify observational example against current APIs. agentic-commerce.mdx:
    foundation-backed only — UCP (Google+Shopify, council incl. Amazon/Meta/Microsoft/Salesforce/Stripe,
    spec 2026-01-11, 8k+ stores), AP2 (FIDO Alliance donation 2026-04-28, v0.2.0, human-not-present flows),
    x402 (x402 Foundation under LF, AWS+Cloudflare edge deployments, 169M+ self-reported payments);
    ACP-commerce covered honestly as deflating post-Instant-Checkout-shutdown; card-network protocols
    one-line watchlist pointers to emerging-standards. Touchpoint section in agent-identity.mdx: payment
    mandates as signed authorization for autonomous purchases. Distributed: WebMCP mention in
    well-known-endpoints (navigator.modelContext, Chrome 149 origin trial); Web Bot Auth in agent-identity +
    robots-txt (IETF WG, RFC 9421-based, Cloudflare production).
  </action>
  <verify>pnpm docs:check passes; five memory types listed; commerce page covers exactly UCP/AP2/x402 + honest ACP note; house pattern</verify>
  <done>Memory taxonomy complete; commerce protocols covered per user direction</done>
  <commit>docs: add procedural memory, agentic commerce protocols, distributed standards updates</commit>
</task>

<task id="D6" depends="D1,D2" type="auto">
  <name>Tooling-catalog update pass</name>
  <files>
    <modify>src/content/docs/tooling-catalog/{browser-sandbox-and-integration,frameworks-and-runtimes,capability-map,index}.mdx</modify>
  </files>
  <read_first>
    Each catalog page (post-B5 state)
    docs/arc/specs spec (Workstream D.10)
  </read_first>
  <action>
    Row updates only: add Fly Machines/Sprites, Blaxel (sandboxes); Daytona OSS-frozen note; Temporal
    Standalone Activity; Claude Managed Agents (frameworks/runtimes); sandbox GA statuses (Vercel,
    Cloudflare). Refresh "Last curated" stamps to 2026-07-06. Link new D1/D2 pages from relevant rows.
  </action>
  <verify>pnpm docs:check passes; stamps updated; no new prose sections (rows only)</verify>
  <done>Catalog current to July 2026</done>
  <commit>docs(tooling-catalog): July 2026 row refresh</commit>
</task>

<task id="D7" depends="D1,D2,D3,D4,D5,D6" type="checkpoint:verify">
  <name>Workstream D checkpoint + whole-plan gate</name>
  <action>Run full gates (pnpm docs:check + build + lint). Present new-page list with one-line theses, extraction verification, nav structure. Then run plan-completion verification against this plan before closing.</action>
  <verify>User approves; plan-completion-reviewer passes</verify>
  <done>All workstreams complete</done>
</task>

## Test Coverage Plan (repo-adapted)

| Guard | Mechanism | Introduced |
|---|---|---|
| Template-path drift | integrity script check (fails first) | A1 |
| Model-ID drift | integrity script check vs canonical list (fails first) | B1 |
| Freshness decay | lastVerified staleness check | B6 |
| Link/meta integrity | existing checks, run per task | — |
| Build integrity | pnpm build per workstream | — |
| Search behavior | manual dev-server verification (E3) | E3 |
