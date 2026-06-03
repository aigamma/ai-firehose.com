---
title: Semi-Supervised Learning
slug: semi-supervised-learning
kind: technique
category: Core Machine Learning
aliases: semi-supervised learning
related: supervised-learning, unsupervised-learning, self-supervised-learning, active-learning
summary: A paradigm that trains on a small amount of labeled data together with a large amount of unlabeled data, using structure in the unlabeled data to improve a model that the labels alone could not, bridging supervised and unsupervised learning.
---

Semi-supervised learning lives in the common situation where a few examples are labeled and many more are not. Labeling is expensive, so you might have a thousand labeled images and a million unlabeled ones. Purely supervised learning would throw the million away; semi-supervised learning uses them, on the bet that the shape of the unlabeled data, where it clusters, what manifold it lies on, carries information about where the decision boundary should go.

Two families of method dominate. Pseudo-labeling trains a model on the labeled data, uses it to label the unlabeled points it is most confident about, and retrains on the enlarged set, bootstrapping its way to better accuracy. Consistency regularization pushes the model to give the same prediction for an unlabeled example and a slightly perturbed version of it, on the principle that a good decision boundary should not run through dense regions of data. Modern approaches often combine both.

Its assumptions are what make it work or fail. It relies on the idea that points close together, or in the same cluster, tend to share a label, so when that structure genuinely reflects the classes, the unlabeled data helps; when it does not, it can mislead.

It is closely related to self-supervised learning, which manufactures a pretext task from unlabeled data, and the modern recipe of pretraining on unlabeled data then fine-tuning on a few labels is in spirit a semi-supervised pipeline. It also pairs naturally with active learning, which chooses which few points are worth labeling in the first place.
