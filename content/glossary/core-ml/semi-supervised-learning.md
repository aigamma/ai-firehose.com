---
title: Semi-Supervised Learning
slug: semi-supervised-learning
kind: technique
category: Core Machine Learning
aliases: semi-supervised learning
related: supervised-learning, unsupervised-learning, self-supervised-learning, active-learning
summary: Training on a small amount of labeled data together with a large amount of unlabeled data, using the shape of the unlabeled data to place a decision boundary the labels alone could not. It works when points that cluster together share a label, and it bridges supervised and unsupervised learning.
---

Semi-supervised learning lives in the situation almost everyone actually faces: a few labeled examples and a flood of unlabeled ones. Labeling is expensive, so you might have a thousand labeled images and a million unlabeled. Purely supervised learning would throw the million away and train on the thousand. Semi-supervised learning refuses to waste them, on a specific bet: the shape of the unlabeled data, where it clusters, what surface it lies on, carries real information about where the decision boundary should go, even though none of those points come with an answer.

That bet has a precise form, and it is the key to the whole approach: a good decision boundary should pass through low-density regions, not through the middle of a dense clump of data. If a cluster of points all sit close together, they probably share a label, so a boundary that slices through them is almost certainly wrong. The unlabeled data, by revealing where the clumps and the gaps are, tells you where the boundary should not go, which is information the handful of labels could never provide on their own.

Two families of method put this to work. Pseudo-labeling trains a model on the labeled data, uses it to label the unlabeled points it is most confident about, and retrains on the enlarged set, bootstrapping its way up. Consistency regularization pushes the model to give the same prediction for an unlabeled example and a slightly perturbed version of it, on the principle that a good boundary should not be sensitive to small jitters within a cluster. Modern approaches often combine both, and the strongest results come from doing so at scale.

Its assumptions are exactly what make it work or fail. It relies on the idea that points close together, or in the same cluster, tend to share a label, so when that structure genuinely reflects the classes the unlabeled data helps, and when it does not, the unlabeled data can actively mislead. It is closely related to self-supervised learning, which manufactures a pretext task from unlabeled data, and the dominant modern recipe, pretrain on unlabeled data then fine-tune on a few labels, is a semi-supervised pipeline in spirit. It also pairs naturally with active learning, which chooses which few points are worth labeling in the first place.
