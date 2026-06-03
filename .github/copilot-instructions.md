# AI Firehose: GitHub Copilot instructions

GitHub Copilot: this file is auto-injected into your context for any chat, inline, or agent invocation in this repository. It is a pointer to the canonical project documentation; substantive conventions live in `CLAUDE.md` to avoid drift across the agent-discovery conventions this repo supports.

## Authoritative source

**Read [`CLAUDE.md`](../CLAUDE.md) end to end** before substantive work. It contains:

- The **Writing Rules**: em dashes are forbidden in all generative output (UI copy, JSX strings, comments, Markdown, JSON artifact content, and model prompts); never use "RRG" or "Relative Rotation Graph" (this project cites Mansfield Relative Performance, 1979, and uses "rotation plane", "rotation ratio", "rotation momentum"); Title Case headings; cite claims.
- The **Core Contracts** (non-negotiable for pipeline or data work): idempotency (content-hash every chunk, deterministic vector IDs), the rolling-quarter retention (nothing older than `RETENTION_DAYS` is kept), classification without guessing (strict-schema Claude pass), the AI-grown taxonomy (concept resolution by voyage-3 cosine), determinism in precompute, and the no-chatbot rule (the embedding layer powers organization, visualization, and one live semantic search surface only).
- **Documentation as Durable Source of Truth, and the Dialectical Absorption Protocol**, including the "Sources of Truth and How to Update Them" routing table.
- The architecture (subsystems `src/`, `worker/`, `netlify/functions/`, `public/data/`, `docs/`).

For onboarding a feature, read **[`docs/FEATURE_PLAYBOOK.md`](../docs/FEATURE_PLAYBOOK.md)**.

Note: `CLAUDE.md` also contains a "Pacing Constraints" section that is Claude-Code-specific (it references Eric's Anthropic billing relationship and parallel-subagent patterns native to Claude Code's harness). That section does not apply to Copilot; read past it.

## The self-improvement rule

When you discover a convention, a failure mode, or a better contract, commit it to the right durable doc before the turn ends (the routing table in `CLAUDE.md`). Session memory decays; the repository does not. A working tree where the docs lie is a process failure.

## Quick start

- Touching the ingestion pipeline or a source: read `CLAUDE.md` plus `docs/INGESTION.md` and `docs/SOURCES.md`.
- Touching the embedding substrate or the served artifacts: read `CLAUDE.md` plus `docs/RAG.md`.
- Changing the rotation math or thresholds: read `docs/RAG.md` plus `docs/INGESTION_LOG.md`.
- Deploying or changing infrastructure: read `docs/DEPLOYMENT.md` plus `docs/OPERATIONS.md`.

`STEERING_DOCS.md` has the full "when to read what" cheat sheet.

## Why this file exists

GitHub Copilot reads `.github/copilot-instructions.md` automatically. Without it, a Copilot session here would not discover the Core Contracts or the no-em-dash rule and might suggest edits that violate them. The same hub-and-spoke pattern applies to `.cursor/rules/project-context.mdc` (Cursor), `opencode.md` (OpenCode), `GEMINI.md` (Antigravity Gemini), and the root `AGENTS.md` (cross-vendor, used by Codex and Aider). Canonical content lives in `CLAUDE.md`; vendor-specific files are pointers.
