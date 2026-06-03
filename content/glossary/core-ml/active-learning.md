---
title: Active Learning
slug: active-learning
kind: technique
category: Core Machine Learning
aliases: active learning, query learning
related: supervised-learning, semi-supervised-learning, cross-validation, calibration
summary: A paradigm in which the model chooses which examples it most wants labeled, querying an oracle (often a human) for the most informative points, so a strong model can be trained with far fewer labels than random labeling would require.
---

Active learning flips who decides what gets labeled. Instead of a human labeling a random sample of data, the model points at the examples whose labels would teach it the most and asks for those. The loop is: train on what is labeled so far, score every unlabeled example by how informative its label would be, request labels for the top few from an oracle, add them, and repeat. The premise is that not all labels are equally valuable, so a labeling budget goes further when spent deliberately.

The heart of the method is the query strategy. Uncertainty sampling asks for labels where the model is least confident, since those points sit near the decision boundary where it is most confused. Query-by-committee trains several models and asks about the points they most disagree on. Diversity-aware strategies avoid asking about a cluster of near-identical examples. Each is a different answer to "what would I learn the most from."

The payoff is label efficiency: in settings where labeling is the expensive bottleneck, expert medical annotation, specialized domains, preference data for alignment, active learning can reach a target accuracy with a fraction of the labels random selection needs.

Its blind spot is that the model selects its own training data using its current, imperfect beliefs, so it can systematically avoid regions it wrongly thinks are easy, missing what it does not know it does not know. Well-calibrated uncertainty matters, which is why calibration and a little random exploration are usually mixed in to keep the model honest about its own confidence.
