---
title: RewardBench
slug: reward-bench
kind: technique
category: Evaluation and Benchmarks
aliases: RewardBench, reward model benchmark
related: reward-model, rlhf, llm-as-judge, dpo
summary: A benchmark for evaluating reward models, the scorers that steer RLHF, by testing whether they prefer the better of a chosen-versus-rejected response pair across categories like chat, safety, and reasoning. It measures the part of the pipeline that usually goes untested, because a flawed reward model silently corrupts everything trained against it, so catching the error at its source is the whole point.
---

RewardBench evaluates the part of the alignment pipeline that usually goes unmeasured: the reward model. In reinforcement learning from human feedback, a reward model is trained to score responses, and then a policy is optimized to maximize that score, so the reward model becomes the de facto definition of "good" that the final model chases. Yet it is rarely tested on its own. RewardBench fills that gap by presenting reward models with curated pairs, one preferred (chosen) and one worse (rejected) response, and measuring how often the model scores the chosen one higher.

This matters because an error in the reward model does not stay contained; it propagates and amplifies. If the scorer systematically prefers longer answers, agreeable tone, or confident-sounding but wrong reasoning, the policy trained against it learns exactly those traits, a form of reward hacking that is nearly invisible from the policy's behavior alone. Checking the scorer directly catches the fault at its source, before a whole training run has baked it in.

The benchmark breaks results out across categories such as everyday chat, harder reasoning, and safety or refusal behavior, so it shows not just whether a reward model is good but where it is reliable and where it is weak, which guides both how to improve it and how far to trust the RL signal built on top of it. It also offers a common yardstick as the field experiments with alternatives to classic reward models, including the implicit rewards inside methods like dpo and the use of strong models as judges, letting otherwise-incomparable scoring approaches be ranked on the same pairs.
