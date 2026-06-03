# AI Firehose: Gemini pointer

Gemini (including the Antigravity Gemini agent in this project's ensemble): this file is the agent-discovery entry point that some Gemini tooling reads as `GEMINI.md`. The substantive project conventions live in `CLAUDE.md`. Read `CLAUDE.md` end to end before substantive work.

## What `CLAUDE.md` contains

- The **Writing Rules**: em dashes are forbidden in all generative output; never use "RRG" or "Relative Rotation Graph" (this project cites Mansfield Relative Performance, 1979, and uses "rotation plane", "rotation ratio", "rotation momentum"); Title Case headings; cite claims.
- The **Core Contracts** (non-negotiable for pipeline or data work): idempotency, the rolling-quarter retention, classification without guessing, the AI-grown taxonomy by embedding similarity, determinism in precompute, and the no-chatbot rule.
- **Documentation as Durable Source of Truth, and the Dialectical Absorption Protocol**, with the "Sources of Truth and How to Update Them" routing table.
- The architecture (subsystems `src/`, `worker/`, `netlify/functions/`, `public/data/`, `docs/`).

For onboarding a feature, read `docs/FEATURE_PLAYBOOK.md`. For the document map and "when to read what", read `STEERING_DOCS.md`. For cumulative wisdom, read `LESSONS_LEARNED.md`.

Note: `CLAUDE.md` also contains a "Pacing Constraints" section that is Claude-Code-specific (it references Eric's Anthropic billing relationship and parallel-subagent patterns native to Claude Code's harness). That section does not apply to Gemini; read past it.

## The self-improvement rule

When you discover a convention, a failure mode, or a better contract, commit it to the right durable doc before the turn ends (the routing table in `CLAUDE.md`). Session memory decays; the repository does not. A working tree where the docs lie is a process failure.

## Multi-agent collaboration

This project runs a cross-vendor ensemble (Claude Code, Codex, Cursor Composer, Antigravity Gemini, Aider) against the deterministic, idempotent Core Contracts. `AGENTS.md` is the hub-and-spoke delegator; canonical content lives in `CLAUDE.md`; per-model driving prompts live in `D:\prompts`. Keep agent-specific files as thin pointers so there is no duplicated content and no drift.

## Why this file exists

Gemini tooling looks for `GEMINI.md` at the repository root. This is the hub-and-spoke pattern used across every vendor-specific steering file here (`.cursor/rules/`, `.github/copilot-instructions.md`, `opencode.md`, and the root `AGENTS.md`). Canonical content lives in `CLAUDE.md`; vendor-specific files are pointers.
