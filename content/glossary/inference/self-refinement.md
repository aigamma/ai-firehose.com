---
title: Self-Refinement
slug: self-refinement
kind: technique
category: Inference and Sampling
aliases: self-refine, iterative refinement, self-correction
related: reflection, chain-of-thought, self-consistency, test-time-compute, verifier, tree-of-thoughts
summary: An inference-time strategy in which a model improves its own output across iterations by generating an answer, critiquing it, and rewriting it based on that critique, spending extra generation to raise quality without any additional training.
---

Self-refinement turns a single forward attempt into a short improvement loop driven entirely by the model itself. Rather than accept a first draft, the system asks the same model to produce feedback on that draft, pointing out errors, gaps, or weaknesses, and then to generate a revised answer that addresses the feedback. The cycle of draft, critique, and revise can repeat for a few rounds, with each revision conditioned on the prior answer and its critique, until the output stops improving or a step budget is reached. No weights change; the gains come from using more inference, which makes it a form of test-time compute closely related to reflection.

The method works because generating a critique and generating an answer are different tasks, and a model is often a better judge of a finished draft than it was a planner at the blank page. Reviewing concrete text lets it catch a missed requirement, an arithmetic slip, or an unhandled edge case that it did not foresee while writing, and feeding that observation back gives the next attempt something specific to fix. This is the same intuition behind chain-of-thought, that giving the model more to condition on improves what it produces, applied across iterations instead of within a single pass.

Self-refinement is most reliable when the feedback can be grounded in something outside the model's own opinion. Code can be run and its errors or failing tests handed back; a math solution can be checked; a claim can be compared against retrieved evidence. Grounded feedback like this is far more trustworthy than ungrounded self-critique, which can stall or even degrade output, because a model that cannot see its mistake will also fail to critique it, and may "correct" a right answer into a wrong one or loop on superficial edits. An external verifier or executor is therefore the strongest signal a refinement loop can use.

It contrasts with parallel strategies such as self-consistency and best-of-n, which sample many independent attempts and select among them rather than improving one attempt in place. Self-refinement is sequential and stateful: it carries information from each round into the next, which can fix specific defects that resampling would only stumble onto by chance. The cost is added latency and tokens per round, and a real risk of diminishing or negative returns, so practical use caps the iterations and prefers checkable feedback over the model grading itself unaided.
