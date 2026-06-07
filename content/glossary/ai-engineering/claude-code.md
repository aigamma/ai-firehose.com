---
title: Claude Code
slug: claude-code
kind: tool
category: AI Engineering
aliases: Claude Code CLI
related: ai-agent, agentic-workflow, code-generation, tool-use, agentic-harness, code-interpreter
summary: Anthropic's command-line coding agent, which runs in a terminal with direct access to a developer's files, shell, and tools so it can read a codebase, make multi-file changes, run tests, and iterate, rather than only suggesting snippets in a chat window. It is a reference example of an agentic coding harness.
---

Most AI coding help lives inside the editor as autocomplete or beside it as a chat box, and in both the model only advises while a human acts. Claude Code, Anthropic's terminal-based coding agent, closes that gap by handing the model the same instruments the developer holds: it reads and edits files directly, runs shell commands, executes tests, and uses what comes back to decide what to do next.

What makes it an agent rather than a chat is the loop. It plans a change, edits the relevant files, runs the build or the tests, reads the output, and corrects course, repeating until the task is done or it judges that it should stop and ask. It loads project conventions from a file the team commits, so the house rules are context it never has to be told twice, and it reaches external tools over the same protocol other agents use, so its capabilities are not fixed at the factory. Each of these is a deliberate piece of scaffolding that lets a model work on a real repository instead of a toy snippet.

Claude Code is most useful to understand not as a product but as a worked example of an agentic harness: the model is the engine, and the value sits in everything around it, the tools it may call, the conventions it auto-loads, the rule that a test must pass, the memory that does not reset between sessions. That shape generalizes far past coding, which is why harness engineering became a discipline of its own; coding was simply the first domain where the feedback loop ran tight and cheap enough to make the whole thing work.

The lesson it makes concrete is that frontier capability is necessary but not sufficient for autonomy you can trust. A strong model dropped into a terminal with no tools, no conventions, and no checks is a brilliant advisor that cannot be left alone; the same model inside a disciplined harness becomes a worker you can hand a task and walk away from. Increasingly the progress that matters is in that surrounding structure, not only in the weights.
