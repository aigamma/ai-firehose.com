---
title: Causal Inference
slug: causal-inference
kind: technique
category: Probabilistic Machine Learning
aliases: causal inference, causality, causal reasoning
related: bayes-theorem, bayesian-inference, graphical-model, expectation, counterfactual-learning
summary: Reasoning about what causes what, and what would happen under an intervention, rather than merely what correlates with what. It is the discipline that separates "people who use sunscreen get more skin cancer" (a confound) from "sunscreen causes skin cancer" (false), a distinction standard machine learning, built to find correlations, does not draw on its own.
---

Machine learning is extraordinarily good at finding correlations and notoriously blind to whether they mean anything causal. A model can learn that hospital patients on ventilators die more often without learning that ventilators save lives, because the sickest patients get both. Causal inference is the discipline built to tell these apart: to reason about what would happen if you intervened, changed the treatment, flipped the policy, pressed the button, rather than about what merely co-occurs in passively observed data.

The conceptual core is a ladder of three rungs. The lowest is association, what standard statistics and machine learning do: seeing that two things move together. The middle is intervention, predicting the effect of deliberately doing something, which requires knowing the causal structure, not just the correlations. The highest is counterfactual, reasoning about what would have happened in a case that did not occur, the patient who was not treated. Each rung needs strictly more than the one below, and observational data alone cannot climb it without causal assumptions supplied from outside.

The tools make those assumptions explicit. A causal graph, a directed acyclic graph of what influences what, encodes the structure, and from it one can read which variables must be controlled to remove a confound and which must not be touched lest they introduce a spurious path. Randomized experiments cut every confounding link by design, which is why they are the gold standard; when an experiment is impossible, techniques like instrumental variables and difference-in-differences try to recover a causal effect from observational data under stated assumptions, always at the cost of those assumptions being unverifiable.

Causal inference matters for AI because correlation-driven models break exactly where causation matters: they fail under distribution shift, learn shortcuts and spurious features, and cannot answer the "what if" questions that decisions require. A model that only knows associations will confidently recommend acting on a confound. Building systems that reason about interventions, not just patterns, is widely argued to be a missing piece on the path to robust, trustworthy, and genuinely general intelligence, which is why causality keeps returning to the center of the field's hardest debates.
