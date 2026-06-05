---
title: Code Generation
slug: code-generation
kind: technique
category: AI Engineering
aliases: AI code generation, code synthesis, code completion
related: large-language-model, code-interpreter, ai-agent, in-context-learning, fine-tuning, agentic-workflow, chain-of-thought
summary: The use of language models to write, complete, or transform source code from a natural-language description, surrounding context, or a partial snippet. It reframes programming as predicting the next token of a program, which is powerful for boilerplate and idiom but indifferent, on its own, to whether the result compiles or is correct.
---

Ask a model trained on billions of lines of public code to continue a half-written function, and it will usually finish it the way a competent engineer would, because the patterns of working software are dense, repetitive, and well represented in its training data. Code generation is that capability turned into a tool: a model produces source code from a prompt, a comment, a function signature, or the surrounding file, treating programming as a prediction problem rather than a symbolic one.

The model sees code as just another token stream, so the design decisions are about what context to feed it and how to constrain the output. Fill-in-the-middle training lets it complete a span using both the code before and after the cursor, not just a left-to-right prefix, which is what makes inline completion feel aware of the whole file. Retrieval pulls in the relevant types, signatures, and neighboring files so the model is not guessing at an API it cannot see. And because a plausible-looking program can still be wrong, the strongest systems close the loop: they run the code, read the error, and try again, the move that separates a completion toy from an agent that can land a change.

The defining limitation is that fluency is not correctness. A model optimizes for code that looks like its training distribution, not code that satisfies a specification, so it will confidently invent a method that does not exist, import a package that was never installed, or write a subtly off-by-one loop that survives a casual read. This is the same hallucination failure that haunts text generation, with one saving difference: a compiler, a type checker, or a test can catch it, which is why verification is not optional scaffolding around code generation but the thing that makes it trustworthy.

What changed the field was less the raw quality of any single completion and more the realization that code is the rare domain where the model's output can be checked automatically and cheaply. That feedback loop, generate then verify then repeat, is why coding became the first place agentic systems crossed from demo to daily use, and why the leverage now lives less in the model that writes the line and more in the harness around it that decides whether the line was right.
