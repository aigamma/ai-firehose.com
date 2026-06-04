---
title: Occam's Razor
slug: occams-razor
kind: technique
category: Learning Theory
aliases: Occams Razor, Ockham's razor, principle of parsimony, parsimony
related: inductive-bias, generalization, no-free-lunch-theorem, vc-dimension, double-descent
summary: The principle that among explanations fitting the data equally well, the simplest should win. In machine learning it is a concrete bias toward low-complexity models, behind regularization and model selection, but its sharp edge is that "simple" is representation-dependent: a giant network can still embody a simple function, so the razor is a useful bias, not a law.
---

Occam's razor is the principle that one should not multiply entities beyond necessity: when two explanations account for the same observations, prefer the simpler one. Attributed to the medieval logician William of Ockham, it began as a guide to scientific reasoning and became, in machine learning, a concrete bias toward simpler models. The intuition is that a simple rule that fits the data is more likely to capture the true underlying pattern, while a complicated rule that fits equally well is probably exploiting accidental quirks of the particular sample.

In learning theory the razor is one expression of inductive bias, a built-in preference among hypotheses that all agree with the training data, and it shows up everywhere in practice. Regularization terms like weight decay penalize large or numerous parameters and push the optimizer toward simpler functions; model selection criteria such as the Akaike and Bayesian information criteria, and the minimum description length principle, formalize the razor by scoring a model on its fit minus a penalty for its complexity; and pruning, sparsity, and shrinkage are all the razor applied to a model's structure, each trading a little fit for a lot of simplicity in the belief that the trade improves generalization.

There is genuine theoretical support for why simplicity should help. A class of simpler hypotheses has smaller capacity, measured for instance by the VC dimension, and smaller capacity yields a tighter bound on the generalization gap, so a simple model that fits is statistically more trustworthy than a complex one that fits. From a coding viewpoint, a model that compresses the data into a short description has by definition found regularity rather than memorized noise, which is the razor restated in the language of information: favoring parsimony is favoring patterns likely to recur.

The razor is a bias, not a law, and the modern caveats are the keeper. The no free lunch theorem reminds us that preferring simplicity helps only when the world being modeled really is simple in the relevant sense; on a genuinely complex truth, an overzealous razor underfits. Simplicity is also slippery to define, because the natural measure depends on the representation, and double descent shows that a model with an enormous parameter count can still embody a simple function once the optimizer's bias is accounted for. The durable lesson is to prefer the least complex explanation that fits, while remembering that the right notion of complexity is itself a modeling choice.
