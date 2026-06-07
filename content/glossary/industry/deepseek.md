---
title: DeepSeek
slug: deepseek
kind: tool
category: Industry and Markets
related: open-models, frontier-model, mixture-of-experts, reasoning-model, compute-efficiency, large-language-model
summary: A Chinese AI lab whose efficient, openly-released models, trained for a reported fraction of the usual cost, became a landmark in the open-versus-closed and efficiency-versus-scale debates. Its significance is less any single model than the proof that frontier-level capability did not obviously require frontier-level budgets.
---

DeepSeek is a Chinese AI lab that drew outsized attention not for being the largest or most capable but for being startlingly efficient: it released strong, open-weight models reportedly trained at a small fraction of the cost the leading labs were spending. That combination, frontier-adjacent capability, open weights, and a low training bill, made it a reference point in nearly every argument about where AI is heading.

The efficiency was not one trick but a stack of them. Its large models are sparse mixture-of-experts designs, where each token activates only a small slice of the total parameters, so a network with hundreds of billions of weights runs at the cost of a far smaller one. It paired that with multi-head latent attention, which compresses the memory-hungry key-value cache that otherwise dominates the cost of long-context inference. And its reasoning model, R1, was trained heavily with reinforcement learning rather than vast hand-labeled data, showing that chain-of-thought reasoning could be coaxed out of a base model comparatively cheaply. Crucially, the weights were released under a permissive license, so the claims were not a press release but something anyone could download and check.

The impact was about expectations more than any single model. The prevailing story had been that frontier capability required enormous, concentrated compute budgets only a few firms could afford, which justified closed models and premium prices. DeepSeek's efficient, open releases complicated that story, and the market reaction was violent: R1's release helped trigger one of the largest single-day market-value losses any company had ever suffered, at the dominant AI-chip maker, as investors abruptly repriced the assumption that the moat was raw spending on hardware.

DeepSeek matters most as evidence in the field's central economic debate: whether the advantage in AI is durable scale or fleeting efficiency. If frontier-adjacent results can be reached far more cheaply and then given away, the moat that justifies the spending and the secrecy looks thinner, and power tilts toward whoever innovates on efficiency rather than whoever spends the most. Whether that reading holds is unsettled, but DeepSeek is the example people reach for when they make the case.
