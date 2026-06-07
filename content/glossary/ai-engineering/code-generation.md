---
title: Code Generation
slug: code-generation
kind: technique
category: AI Engineering
aliases: AI code generation, code synthesis, code completion
related: large-language-model, code-interpreter, ai-agent, in-context-learning, fine-tuning, agentic-workflow, chain-of-thought
summary: The use of language models to write, complete, or transform source code from a natural-language description, surrounding context, or a partial snippet. It reframes programming as predicting the next token of a program, which is powerful for boilerplate and idiom but indifferent, on its own, to whether the result compiles or is correct.
---

Ask a model trained on billions of lines of public code to continue a half-written function, and it will usually finish it the way a competent engineer would, because working software is dense, repetitive, and overwhelmingly well represented in its training data. Code generation is that statistical fluency turned into a tool: from a comment, a signature, or the surrounding file, a model emits source code, treating programming as next-token prediction rather than the symbolic construction it was long assumed to require.

Because the model sees code as just another token stream, the engineering lives in what you feed it and how you constrain what comes back. Fill-in-the-middle training lets it complete a span from the code on both sides of the cursor instead of a left-to-right prefix, which is what makes inline completion feel aware of the whole file. Retrieval pulls the relevant types, signatures, and neighboring files into context so the model is not guessing at an API it cannot see. And the output is pinned to a shape, a diff, a function body, a typed return, so it lands where the program needs it instead of wandering into prose.

The defining failure is that fluency is not correctness. A model optimizes for code that resembles its training distribution, not code that satisfies a specification, so it will invent a method that sounds real, import a package that was never installed, or write an off-by-one that survives a casual read. This is the same hallucination that haunts text generation, with one decisive difference: a compiler, a type checker, or a test returns an automatic verdict that no paragraph of prose ever gets. The training data sharpens the trap, because public code is selected to look finished rather than proven right, so the model learned the surface of working software more faithfully than its substance.

That asymmetry, cheap to produce and cheap to check, is what made code the first place generation became dependable, because a confident wrong answer cannot hide from the build. The practical consequence is that a raw completion is a draft, not a result: its worth is realized only inside a loop that runs it and reads the outcome. The unit of useful code generation is never the line the model wrote, but the line the tests let stand.
