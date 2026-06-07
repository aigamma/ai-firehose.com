---
title: SWE-bench
slug: swe-bench
kind: technique
category: Evaluation and Benchmarks
aliases: SWE-bench, software engineering benchmark
related: pass-at-k, humaneval, benchmark-contamination, llm-as-judge
summary: A benchmark that tests a model on real software-engineering tasks, resolving actual GitHub issues in real repositories, graded by whether the generated patch makes the project's hidden test suite pass, a far harder and more realistic bar than self-contained function problems. Solving one means localizing code across many files, respecting existing conventions, and not breaking anything, which is why it became the reference benchmark for coding agents.
---

SWE-bench measures whether a model can do the actual job of a software engineer, not just write a small function. Each task is a real issue from a real open-source repository, paired with the codebase at the moment before the fix. The model must understand the issue, navigate a large unfamiliar codebase, and produce a patch. The patch is then applied and the repository's own hidden test suite is run; the task is solved only if the tests pass. There is no partial credit for plausible-looking code.

This is a sharp step up from earlier coding benchmarks like HumanEval, which ask for one self-contained function against a few tests. Solving a SWE-bench task means localizing the relevant code across many files, understanding existing conventions and dependencies, making a minimal correct edit, and not breaking anything else. It rewards the skills real engineering demands rather than algorithmic puzzle-solving, which is why it became the reference benchmark for coding agents.

Because the tasks come from real projects with real test suites, SWE-bench is harder to saturate and somewhat more resistant to contamination than synthetic benchmarks, though issues from public repositories can still leak into training data. Curated subsets such as SWE-bench Verified (human-validated to be solvable and well-specified) and SWE-bench Lite address noise and cost in the original set.

Progress on SWE-bench has tracked the rise of agentic coding systems that plan, edit, run tests, and iterate, and it has become a headline number for how genuinely useful a model is at engineering work rather than at toy problems.
