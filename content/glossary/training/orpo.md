---
title: ORPO
slug: orpo
kind: technique
category: Training and Fine-Tuning
aliases: Odds Ratio Preference Optimization, monolithic preference optimization
related: dpo, supervised-fine-tuning, kto, rlhf, fine-tuning
summary: A preference-alignment method that folds supervised fine-tuning and preference optimization into a single training stage by adding an odds-ratio penalty to the standard language-modeling loss, dispensing with both a reference model and a separate alignment phase. It is the most aggressive compression of the post-training recipe, aligning the model in the very same pass that teaches it format and behavior.
---

ORPO, Odds Ratio Preference Optimization, collapses the usual two-step post-training recipe into one. The conventional path first runs supervised fine-tuning on demonstrations to teach format and behavior, then runs a separate preference stage, DPO or RLHF, to align the model to human comparisons. ORPO argues this separation is wasteful and even counterproductive: plain supervised fine-tuning raises the likelihood of good responses but does nothing to suppress the bad ones, since it never sees rejected examples, so ORPO instead aligns the model in the same pass that teaches it, training on preferred and rejected responses together from the start.

The mechanism is a small addition to the ordinary language-modeling loss. Alongside the standard cross-entropy term that maximizes the likelihood of the preferred response, ORPO adds a penalty built from the odds ratio between the preferred and the rejected response. The odds of a sequence are its probability divided by the probability of not producing it, and the ratio of these odds for the two responses measures how strongly the model favors the good one over the bad one; by pushing this ratio up, the loss increases the relative preference for the chosen response while the cross-entropy term keeps the model fluent and on-task, with a single weight balancing the two pressures. Crucially the odds-ratio penalty is gentle enough that it does not crush the rejected response so hard that fluency collapses, which is why it can run from the base model without a reference anchor.

ORPO matters because it removes two things at once, the keeper: the separate alignment stage and the frozen reference model that DPO and KTO both require. DPO must keep a second copy of the model in memory to anchor the policy; ORPO needs no reference copy, so it is lighter to run and simpler to reason about, and folding alignment into fine-tuning means there is only one set of hyperparameters and one training run, which lowers the engineering surface. Reported results show ORPO reaching alignment quality competitive with the SFT-then-DPO pipeline while using a single monolithic objective.

ORPO sits alongside DPO and KTO as a reference-free, reinforcement-learning-free alignment method, and it is the most aggressive of the three in compression: where DPO and KTO still assume a model that has already been supervised fine-tuned, ORPO does the supervised learning and the preference alignment simultaneously. The trade-off is that combining the objectives gives less independent control over the demonstration-fitting and preference-enforcing phases than running them in sequence, so practitioners who want to tune those phases separately may still prefer the staged recipe.
