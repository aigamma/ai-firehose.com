---
title: Grokking
slug: grokking
kind: technique
category: Mechanistic Interpretability
aliases: grokking, delayed generalization
related: circuit, mechanistic-interpretability, induction-head, superposition, linear-representation-hypothesis, feature-visualization
summary: A training phenomenon in which a network first memorizes its data and only much later, after long continued training at near-perfect training accuracy, abruptly generalizes, having replaced a memorized solution with a true algorithmic circuit.
---

Grokking is the surprising observation that a network can generalize long after it has finished fitting its training set. In the canonical experiments on small algorithmic tasks, such as modular arithmetic, a model reaches near-perfect training accuracy quickly while its test accuracy stays at chance, the picture of pure memorization. Then, if training continues well past that point, sometimes for orders of magnitude more steps, test accuracy suddenly climbs from chance to near-perfect. The model appears to have memorized first and understood only later, a delayed and abrupt transition from rote fit to genuine generalization that gave the phenomenon its name.

Grokking matters because it complicates the usual story of overfitting and offers an unusually clean window into what generalization actually is. Standard intuition says that a model at perfect training accuracy with poor test accuracy is overfit and will stay that way, yet grokking shows the same model can later generalize without any change in the data. This makes it a favorite testbed for studying the dynamics of learning, the role of regularization, and the long-debated question of why over-parameterized networks generalize at all, all on tasks small enough to analyze completely.

The mechanistic interpretability account is what makes grokking more than a curiosity, and it is among the field's cleanest results. On these tasks researchers have fully reverse-engineered the grokked network and found that generalization coincides with the network discarding its memorized lookup and constructing a real algorithmic circuit, in the modular-arithmetic case a structured solution that uses periodic, trigonometric features to compute the answer rather than store it. The delay is explained as competition between two solutions: a memorizing one that is fast to find and a generalizing circuit that is slower to form but, under weight decay, ultimately favored because it is simpler and lower-norm. Grokking is the visible moment when the second solution wins.

Grokking connects to the broader themes of interpretability through this lens of sudden, analyzable structure. It belongs to the same family as the abrupt formation of the induction head, where capability likewise appears as a phase change rather than a smooth ramp, and the periodic features it produces are a vivid case of meaning living along specific directions in activation space, in the spirit of the linear representation hypothesis. As one of the few settings where a network has been understood from memorization through to generalization, grokking serves as a proof of concept that the murky idea of "learning to generalize" can sometimes be pinned to a concrete circuit forming inside the weights.
