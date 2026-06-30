# Agent Surface - Agent Instructions

## Communication Expectations
- Explain what you are changing before editing, especially when touching skills, templates, or published docs.
- Treat `AGENTS.md` as operational guidance; keep product positioning in `README.md`, `INSTALL.md`, and docs content.
- When a task is about agent-readiness, say which surface is being improved: docs, skill, template, API, CLI, MCP, auth, evals, or retrievability.

## How To Work In This Codebase
- Start with `README.md`, then `skills/surface/SKILL.md` for operative workflow details.
- Published docs live under `src/content/docs/`; reusable templates live under `templates/`; specialist agent prompts live under `skills/surface/agents/`.
- Use the `surface` skill for guide, audit, scaffold, transform, and generate workflows instead of inventing parallel instructions.
- Keep examples and claims aligned with files that actually exist in this repo.

## Editing Constraints
- Do not duplicate long explanations between this file and source docs; update the canonical doc page instead.
- Do not claim framework, auth, CLI, MCP, or eval support exists unless code or templates provide it.
- Keep lint and format routed through the existing `@howells/lint` scripts; do not add direct lint tool dependencies.
- Do not change generated Fumadocs output by hand.

## Search Preferences
- Use `rg` over `src/content/docs`, `skills/surface`, and `templates` before creating new guidance.
- For ambiguous agent terms, prefer this repo's docs and `skills/surface/references/` over general web memory.
- Search existing templates before adding a new template variant.

## Commands
- `pnpm dev` - Next/Fumadocs dev server on port 3900.
- `pnpm docs:check` - documentation integrity checks.
- `pnpm build` - production build.
- `pnpm lint` / `pnpm lint:fix` / `pnpm format` - shared lint and format lanes.
- `pnpm env:check` - validate local env through Envy.

## Repo-Specific Rules
- Agent Surface is a guide and implementation kit for agent-readable software. Do not narrow it to one framework.
- Keep the scoring model, template names, and specialist-agent names synchronized across docs and skill files.
- Arc may help structure large implementation work, but Agent Surface owns agent-readiness guidance.
- Mastra is one supported orchestration option, not the default answer for every agent system.
