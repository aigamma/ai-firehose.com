---
title: Hallucination
slug: hallucination
kind: technique
category: Evaluation and Benchmarks
aliases: hallucination, confabulation, faithfulness
related: retrieval-augmented-generation, calibration, llm-as-judge, perplexity, reward-hacking
summary: A fluent, confident model output that is factually wrong or unsupported by its source, arising because language models are trained to produce likely text rather than to track truth. It is not a bug bolted on but falls out of the objective: a fluent, well-formed falsehood is often more probable than an awkward admission of ignorance, and the model has no separate ledger of what it actually knows.
---

A hallucination is model output that reads as confident and plausible but is false or unsupported. The term covers invented facts, fabricated citations and quotations, and answers that contradict the very source a model was given. The word is imperfect, since the model is not perceiving anything; confabulation is a more accurate analogy, describing a system that smoothly fills a gap with something that fits rather than admitting it does not know.

The behavior is not a bug bolted onto an otherwise truthful system; it falls out of how the model is built, the keeper. A language model is trained to predict likely continuations of text, and a fluent, well-formed falsehood is often more probable under that objective than an awkward admission of ignorance. The model has no separate ledger of what it actually knows, and training with human feedback can make matters worse by rewarding confident, helpful-sounding answers, which teaches the model that guessing is better than abstaining. Knowledge that was rare or absent in training is where fabrication concentrates.

Mitigation works on several fronts. Grounding the model in retrieved evidence through retrieval-augmented generation gives it real text to quote and lets a system check the answer against the source, a property called faithfulness. Better calibration, so a model's expressed confidence matches its accuracy, lets it abstain or hedge when it should. Verification steps, whether a tool, a second model, or an llm-as-judge scoring faithfulness, catch errors before they reach a user. None of these eliminates the problem, and a model that never hallucinated would also have to know the exact bounds of its own knowledge.

Measuring hallucination is itself hard, because it requires deciding what is true and what the source supports. Practical evaluation tends to separate factual accuracy against the world from faithfulness to a provided context, since a model can be perfectly faithful to a document that is itself wrong.
