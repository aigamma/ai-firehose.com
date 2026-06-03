# AI Firehose, agent instructions

This is the agent-discovery entry point for **AI Firehose** (ai-firehose.com), a personal AI-industry intelligence dashboard structured as a daily outlier hunt. It ingests the most salient AI signal each day, organizes it with a non-chat embedding and RAG substrate, and surfaces what is new and breaking out across Day, Week, Month, and Quarter.

## Authoritative Source

**Read [`CLAUDE.md`](CLAUDE.md) for all project conventions.** This file (`AGENTS.md`) is a hub-and-spoke delegator that exists so agents looking for the cross-vendor `AGENTS.md` convention (Codex, Cursor Composer, Antigravity Gemini, Aider, and other tools in the ensemble) discover the project's substantive conventions through the canonical document. The substance lives in `CLAUDE.md`; this file does not duplicate it, so there is no drift risk.

`CLAUDE.md` has sections that are non-negotiable for any agent doing pipeline or data work:

1. **Core Contracts**: idempotency, the rolling-quarter retention, classification without guessing, the AI-grown taxonomy (concept resolution by embedding similarity), determinism in precompute, and the no-chatbot rule.
2. **Documentation as Durable Source of Truth, and the Dialectical Absorption Protocol**: how lessons from one session are absorbed into the docs for the next, so this harness never goes stale.

## Agent-Specific Override Files

When agent-specific instructions are needed beyond the project-wide conventions, place them in the agent's conventional location rather than expanding this file. Each is a thin pointer to `CLAUDE.md`, so there is no duplicated content and no drift:

- **Claude Code**: `CLAUDE.md` (canonical, the content this file delegates to)
- **Cursor**: `.cursor/rules/project-context.mdc` (`alwaysApply: true`)
- **GitHub Copilot**: `.github/copilot-instructions.md`
- **OpenCode**: `opencode.md` (belt-and-suspenders alongside this file)
- **Antigravity Gemini**: `GEMINI.md`
- **Codex, Aider, others**: this `AGENTS.md`, the cross-vendor convention they read natively

The per-model driving prompts for the ensemble accumulate in the prompt library at `D:\prompts` (`codex`, `cursor`, `antigravity`). The principle: this file stays a delegator, substance lives in `CLAUDE.md`, agent-specific overrides live in their own locations. No duplicated content, no drift.

## Quick Start for a New Agent

1. Read `CLAUDE.md` end to end.
2. Read `LESSONS_LEARNED.md` for accumulated wisdom.
3. Read `STEERING_DOCS.md` to find the tier-2 doc for the subsystem you are touching.
4. Read that subsystem doc (for example `docs/INGESTION.md` before touching the pipeline).
5. If you are onboarding a feature, read `docs/FEATURE_PLAYBOOK.md`, the repeatable recipe with a dedicated path for a fully Pinecone/Voyage-integrated feature.
6. Before your turn ends, absorb any new process insight back into the docs (the protocol in `CLAUDE.md`, routed by the "Sources of Truth and How to Update Them" table).
