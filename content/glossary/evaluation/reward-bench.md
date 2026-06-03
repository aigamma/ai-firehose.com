---
title: RewardBench
slug: reward-bench
kind: technique
category: Evaluation and Benchmarks
aliases: RewardBench, reward model benchmark
related: reward-model, rlhf, llm-as-judge, dpo
summary: A benchmark for evaluating reward models, the scorers that steer RLHF, by testing whether they prefer the better of a chosen-versus-rejected response pair across categories like chat, safety, and reasoning, since a flawed reward model silently corrupts everything trained against it.
---

RewardBench evaluates the part of the alignment pipeline that usually goes unmeasured: the reward model. In RLHF, a reward model is trained to score responses, and then a policy is optimized to maximize that score. The reward model is therefore the de facto definition of "good" that the final model chases, yet it is rarely tested directly. RewardBench fills that gap by presenting reward models with curated pairs of a preferred (chosen) and a worse (rejected) response and measuring how often the model scores the chosen one higher.

This matters because errors in the reward model propagate silently and amplify. If the scorer systematically prefers longer answers, sycophantic agreement, or confident-sounding but wrong reasoning, the policy trained against it will learn exactly those traits, a form of reward hacking that is hard to notice from the policy's behavior alone. Evaluating the reward model directly catches the problem at its source.

By breaking results out across categories such as everyday chat, harder reasoning, and safety or refusal behavior, the benchmark shows where a reward model is reliable and where it is weak, which guides both reward-model training and the decision of how much to trust the resulting RL signal.

It also provides a common yardstick as the field experiments with alternatives to classic reward models, including the implicit reward models inside methods like DPO and the use of strong models as judges, letting these scoring approaches be compared on the same footing.
