---
title: Claude Code
slug: claude-code
kind: tool
category: AI Engineering
aliases: Claude Code CLI
related: ai-agent, agentic-workflow, code-generation, tool-use, agentic-harness, code-interpreter
summary: Anthropic's command-line coding agent, which runs in a terminal with direct access to a developer's files, shell, and tools so it can read a codebase, make multi-file changes, run tests, and iterate, rather than only suggesting snippets in a chat window. It is a reference example of an agentic coding harness.
---

Most AI coding help lives inside an editor as autocomplete or beside it as a chat box, and in both the model only suggests while a human does the acting. Claude Code, Anthropic's terminal-based coding agent, removes that gap by giving the model the same tools the developer has: it reads and edits files directly, runs shell commands, executes tests, and uses the results to decide what to do next.

What makes it an agent rather than a chat is the loop. It plans a change, edits the relevant files, runs the build or the tests, reads the output, and corrects course, repeating until the task is done or it decides to ask. It loads project conventions from a file the team commits, so the house rules are context it never has to be re-told, and it calls external tools over the same protocol other agents use, so its reach is not fixed. Each of these is a deliberate piece of the scaffolding that lets a model work on a real repository instead of a toy snippet.

Claude Code is most usefully read not as a product but as a worked example of an agentic harness: the model is the engine, and the value is in everything around it, the tools it can call, the conventions it auto-loads, the verification that a test must pass, the memory that does not reset between sessions. The same shape generalizes far beyond coding, which is why harness engineering became a discipline of its own; coding was simply the first domain where the feedback loop was tight and cheap enough to make it work.

The deeper lesson it demonstrates is that frontier capability is necessary but not sufficient for useful autonomy. A strong model dropped into a terminal with no tools, no conventions, and no checks is a brilliant assistant that cannot be trusted to act; the same model inside a disciplined harness becomes a worker you can hand a task and walk away from. The progress that matters is increasingly in that harness, not only in the weights.
