# AI Firehose: OpenCode pointer

OpenCode honors the cross-vendor `AGENTS.md` convention natively, so the canonical entry point is `AGENTS.md` at this repository's root.

If OpenCode also discovers this file (some configurations read root-level `opencode.md`), the substantive project conventions live in `CLAUDE.md`. Read `CLAUDE.md` end to end before substantive work.

## What `CLAUDE.md` contains

- The **Writing Rules**: no em dashes in generative output; never "RRG" or "Relative Rotation Graph" (cite Mansfield Relative Performance, 1979); Title Case headings; cite claims.
- The **Core Contracts** (non-negotiable for pipeline or data work): idempotency, the rolling-quarter retention, classification without guessing, the AI-grown taxonomy, determinism in precompute, and the no-chatbot rule.
- **Documentation as Durable Source of Truth, and the Dialectical Absorption Protocol**, with the "Sources of Truth and How to Update Them" routing table.
- The architecture (subsystems `src/`, `worker/`, `rag/`, `netlify/functions/`, `public/data/`, `docs/`).

For onboarding a feature, read `docs/FEATURE_PLAYBOOK.md`. For the document map, read `STEERING_DOCS.md`.

Note: `CLAUDE.md` also contains a "Pacing Constraints" section that is Claude-Code-specific (it references Eric's Anthropic billing relationship and parallel-subagent patterns native to Claude Code's harness). That section does not apply to OpenCode or any other agent that does not share Claude Code's runtime; read past it.

## The self-improvement rule

When you learn a convention, a failure mode, or a better contract, commit it to the right durable doc before the turn ends (the routing table in `CLAUDE.md`). Session memory decays; the repository does not. A working tree where the docs lie is a process failure.

## Why this file exists

Belt-and-suspenders pointer alongside `AGENTS.md` for OpenCode configurations that look for `opencode.md` specifically. Canonical content lives in `CLAUDE.md`. This is the hub-and-spoke pattern used across every vendor-specific steering file in this repo (`.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md`, and the root `AGENTS.md` plus this `opencode.md`).
