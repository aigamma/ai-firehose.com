---
title: DPO
slug: dpo
kind: technique
category: Training and Fine-Tuning
aliases: direct preference optimization, DPO
related: rlhf, fine-tuning, instruction-tuning, constitutional-ai, pretraining
summary: A preference-tuning method that aligns a model directly from pairs of preferred and rejected responses with a simple classification-style loss, avoiding RLHF's separate reward model and reinforcement-learning loop. Its trick is a mathematical identity that folds the reward model into the policy loss, collapsing the whole fiddly pipeline into one stable stage that behaves like ordinary fine-tuning.
---

DPO, direct preference optimization, aligns a language model with human preferences, reaching a similar goal as reinforcement learning from human feedback (RLHF) but by a much simpler route. Like RLHF it learns from comparison data, prompts paired with a preferred response and a rejected one, but unlike RLHF it does not train a separate reward model and does not run a reinforcement learning loop. Instead it optimizes the model directly with a single supervised-style loss, which makes it far easier to implement and more stable to train.

DPO matters because it lowered the barrier to preference alignment. The RLHF pipeline is notoriously fiddly, requiring a reward model and then Proximal Policy Optimization with careful tuning to avoid instability and reward hacking; DPO collapses that into one training stage that looks and behaves much like ordinary fine-tuning, which is why it was adopted quickly across the open-source community and many production models. It delivers competitive alignment quality with a fraction of the engineering complexity.

The central insight is mathematical, and it is the keeper: the RLHF objective, maximizing a learned reward while staying close to a reference policy, has a closed-form relationship between the optimal policy and the reward, which DPO exploits to rewrite the problem so the reward model disappears entirely. The loss simply increases the model's relative likelihood of the preferred response over the rejected one, measured against a frozen reference copy of the starting model, with a temperature parameter controlling how strongly preferences are enforced. The reference model anchors training so the policy improves on preferences without collapsing or drifting far from its instruction-tuned behavior.

DPO is not free of trade-offs. Because it learns directly from a fixed set of comparisons rather than from a reward model that can score fresh on-policy samples, it can be more sensitive to the coverage and quality of its preference data, and it does not naturally support the online, iterative collection of new feedback that reinforcement learning enables. Practitioners often address this by curating strong preference datasets or by iterating DPO over multiple rounds.

DPO sits alongside RLHF as one of the two dominant approaches to the preference-alignment stage that follows pretraining and instruction-tuning. It is best understood as a direct simplification of RLHF, and the choice between them is a practical trade between RLHF's flexibility and DPO's simplicity and stability. Both can be combined with constitutional AI, which supplies preference labels from a model guided by written principles rather than from humans.
