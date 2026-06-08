---
title: Data Attribution
slug: data-attribution
kind: technique
category: Mechanistic Interpretability
aliases: data attribution, training data attribution, influence functions
related: mechanistic-interpretability, membership-inference, fine-tuning, benchmark-contamination, knowledge-distillation
summary: Tracing a model's behavior back to the specific training examples most responsible for it: which data points, if removed, would most change this prediction. It answers "why did the model do that" in terms of its data rather than its weights, which is the lever for debugging datasets, assigning credit or blame, and auditing what a model actually learned from.
---

Interpretability usually asks what is happening inside a model's weights. Data attribution asks a different and often more actionable question: which training examples caused this behavior? If a model misclassifies an image or states a particular fact, attribution tries to point at the specific data points most responsible, the ones whose removal would most change the prediction. It explains the model in terms of its diet rather than its anatomy.

The classical tool is the influence function, which estimates how a prediction would shift if a given training example were upweighted or removed, without the impossibly expensive experiment of actually retraining the model once per data point. Exact influence is intractable at scale, so the field has built cheaper approximations and gradient-based estimators that trade some fidelity for the ability to run on real models and datasets. The shared goal is a ranked list: for this output, here are the training examples that mattered most.

What makes data attribution valuable is everything it lets you audit. It can find the mislabeled or poisoned examples dragging down a model, surface whether a benchmark answer leaked in through contaminated training data, assign credit (or legal liability) for what a model learned from whose content, and explain a surprising capability or failure by the data that produced it. It connects naturally to membership inference, which asks the related question of whether a specific example was in the training set at all.

Data attribution matters more as models train on vast, opaque, web-scraped corpora whose contents no one fully knows. When the training data is a black box, attribution is one of the few tools that can reach back into it from the model's behavior, which is why it is increasingly central to dataset debugging, copyright and provenance disputes, and the broader project of understanding not just how a model computes but what it actually learned from.
