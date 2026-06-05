---
title: Compute Efficiency
slug: compute-efficiency
kind: opinion
category: Systems and Infrastructure
aliases: efficient AI, AI efficiency
related: scaling-laws, mixture-of-experts, quantization, knowledge-distillation, frontier-model, kv-cache
summary: Getting more capability out of each unit of computation, through better architectures, training methods, and inference techniques, rather than only spending more. It is the counterweight to brute-force scaling, and the lever that decides whether AI's appetite for compute stays sustainable.
---

The dominant story of recent AI is scale: more data, more parameters, more compute, more capability. But compute is not free, and its appetite has grown faster than the hardware, the budgets, and the power grids that supply it. Compute efficiency is the opposing discipline, getting more from each unit of computation rather than simply buying more units, and it has become urgent precisely because the brute-force path is running into physical and economic walls.

Efficiency is won at every layer. In architecture, designs that activate only part of the model per input, or attention variants that avoid the quadratic cost of long contexts, do more with the same parameters. In training, better data and methods reach a given capability in fewer steps. In inference, quantization, caching, and distillation cut the cost of actually running a model, which over its lifetime dwarfs the cost of training it. The recurring pattern is that the same capability delivered for less compute is as valuable as a new capability.

The non-obvious point is that efficiency and scale are not opposites but multipliers, and the relationship cuts a surprising way. A more efficient method does not just save money; it raises the ceiling of what a given budget can reach, so efficiency gains compound with scale rather than substituting for it. This is why the labs pushing the largest models also pour effort into efficiency: every efficiency win is leverage applied to a budget already at the limit, and the frontier is set by the product of the two, not either alone.

Compute efficiency is where AI's growth meets its constraints, and how that tension resolves shapes the field's trajectory. If efficiency keeps pace, capability can keep climbing without compute demand becoming physically or environmentally untenable; if it stalls, scaling hits a wall that no amount of capital can buy through. The quiet work of squeezing more from each unit of compute is therefore not a footnote to the scaling story but a determinant of how long that story can run.
