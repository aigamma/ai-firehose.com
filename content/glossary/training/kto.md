---
title: KTO
slug: kto
kind: technique
category: Training and Fine-Tuning
aliases: Kahneman-Tversky Optimization, KTO alignment
related: dpo, rlhf, reward-modeling, fine-tuning, constitutional-ai
summary: A preference-alignment method that tunes a model from individual responses each labeled simply as desirable or undesirable, using a loss inspired by prospect theory, so it needs no paired comparisons and tolerates imbalanced thumbs-up and thumbs-down feedback.
---

KTO, Kahneman-Tversky Optimization, is an alignment method that relaxes the data requirement at the heart of preference tuning. DPO and reward modeling both need paired data: for a given prompt, a response that was preferred and one that was rejected. That pairing is often unnatural to collect. Real product feedback usually arrives as isolated signals, a single thumbs-up or thumbs-down on one response, with no matched counterpart. KTO learns directly from these unpaired binary labels, asking only whether each individual response was desirable or undesirable, which makes the abundant, messy feedback of a deployed system usable for alignment without first manufacturing pairs.

The method takes its name from the prospect theory of Daniel Kahneman and Amos Tversky, which describes how people actually weigh gains and losses around a reference point: losses loom larger than equivalent gains, and value is measured relative to a baseline rather than in absolute terms. KTO imports this shape into its loss. Each response is scored by how much the model's likelihood for it has shifted away from a frozen reference copy of the starting model, and that shift is passed through a value function that rewards desirable responses for moving up and penalizes undesirable ones for moving up, with the asymmetry between the two controllable. The reference point is an estimate of the average implicit reward, so the model is pushed to make good responses better than typical and bad responses worse than typical.

KTO matters because it changes the economics of gathering alignment data. Comparisons require a labeler to consider at least two completions at once; binary judgments require only a reaction to one, which is cheaper and maps onto the feedback widgets users already click. KTO is also robust to class imbalance, working even when desirable and undesirable examples arrive in very different quantities, a situation that breaks methods assuming balanced pairs. In reported comparisons it matches or exceeds DPO across a range of model scales while consuming a fundamentally easier-to-source kind of supervision.

KTO belongs to the family of direct alignment methods that, like DPO, skip the separate reward model and the reinforcement learning loop of RLHF and instead optimize the policy with a single offline loss against a reference model. It trades DPO's clean pairwise signal for the practicality of unpaired labels, and the prospect-theory framing is the device that makes a sensible objective out of feedback that has no matched negative. It sits in the post-training stack after supervised fine-tuning, as one option among DPO, ORPO, and classic RLHF for the preference-alignment stage.
