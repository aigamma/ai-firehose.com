---
title: RLVR
slug: rlvr
kind: technique
category: Training and Fine-Tuning
aliases: RLVR, reinforcement learning with verifiable rewards
related: verifier, reasoning-model, rlhf, group-relative-policy-optimization, reward-modeling
summary: Reinforcement learning where the reward comes from an automatic, objective check rather than a learned model of human preference: did the code pass the tests, did the math reach the right answer, did the proof verify. By replacing the gameable reward model with a ground-truth verifier, it sidesteps reward hacking and became the engine behind the recent leap in reasoning models.
---

Standard reinforcement learning from human feedback steers a model with a learned reward model, an approximation of human preference that the policy then optimizes against, and that approximation is gameable: optimize it hard enough and the policy finds outputs the reward model scores highly but a human would not endorse. RLVR removes the soft target entirely. Where the answer can be checked objectively, the reward is the check itself: one if the code passes its tests, the math hits the verified answer, or the proof type-checks, zero otherwise.

The shift from a learned reward to a verifiable one changes the dynamics. There is no reward model to hack, because the reward is ground truth, so the policy cannot win by exploiting a scorer's blind spots; it can only win by actually being right. That makes the signal trustworthy enough to optimize hard, with simple policy-optimization methods, often group relative policy optimization, which scores a batch of attempts at the same problem against their own average and needs no separate value network. The model generates many solutions, the verifier grades them, and the policy is pushed toward what passed.

The reason RLVR matters is that it is largely responsible for the recent jump in reasoning. Training models against verifiable rewards on math and code, where correctness is cheap to check, taught them to produce long, self-correcting chains of thought that actually reach right answers, because that is the only thing the reward credited. The verifier supplies exactly the honest feedback that open-ended text generation lacks, which is why coding and mathematics, the most checkable domains, are where reasoning models advanced first and fastest.

The honest limit is the same as its strength: RLVR works only where a cheap, reliable verifier exists. For the vast space of tasks with no objective check, writing well, giving advice, exercising judgment, there is nothing to compute the reward, so learned reward models and human feedback remain necessary. The frontier question is how far the verifiable island can be extended, through better automatic checkers and through using strong models as approximate verifiers, before the ground-truth signal runs out and the gameable proxy returns.
