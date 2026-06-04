---
title: Active Learning
slug: active-learning
kind: technique
category: Core Machine Learning
aliases: active learning, query learning
related: supervised-learning, semi-supervised-learning, cross-validation, calibration
summary: A setup where the model chooses which examples it most wants labeled, querying a human for the most informative points instead of a random sample, so a strong model can be trained with far fewer labels. Its hidden danger is that the model picks its own training data using its current, imperfect beliefs, and so can systematically avoid what it does not know it is missing.
---

Active learning flips who decides what gets labeled. In the usual setup a human labels a random sample of data and the model takes what it is given; in active learning the model points at the specific examples whose labels would teach it the most and asks for those. The loop is: train on what is labeled so far, score every unlabeled example by how informative its label would be, request labels for the most valuable few from an oracle (usually a person), add them, and repeat. The premise is that not all labels are worth the same, so a fixed labeling budget goes much further when spent deliberately than when spent at random.

The heart of the method is the query strategy, the rule for "most informative." Uncertainty sampling asks for labels where the model is least confident, on the logic that those points sit near the decision boundary where the model is most confused and has the most to gain. Query-by-committee trains several models and asks about the points they most disagree on. Diversity-aware strategies avoid spending the budget on a cluster of near-identical examples. Each is a different answer to the same question, what would I learn the most from, and the answer decides how efficiently the labels are spent.

The payoff is label efficiency, and in the right setting it is dramatic. Wherever labeling is the expensive bottleneck, expert medical annotation, specialized scientific domains, preference data for aligning a model, active learning can reach a target accuracy with a fraction of the labels random selection would need. When each label costs a specialist's time, choosing them well rather than randomly is the difference between a feasible project and an unaffordable one.

Its blind spot is built into its premise, and it is worth respecting. The model selects its own training data using its current, imperfect beliefs, so it can systematically avoid regions it wrongly thinks are easy or unimportant, never asking about the very things it most needs to learn, the unknown unknowns. A model confidently wrong about part of the space will not query there, so its error there goes uncorrected. This is why well-calibrated uncertainty matters so much to active learning, and why a little plain random sampling is usually mixed in, to keep the model honest about the limits of its own confidence.
