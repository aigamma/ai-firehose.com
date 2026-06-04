---
title: Unsupervised Learning
slug: unsupervised-learning
kind: technique
category: Core Machine Learning
aliases: unsupervised machine learning
related: supervised-learning, reinforcement-learning, self-supervised-learning, k-means, principal-component-analysis, clustering
summary: Learning from data that carries no labels, where the goal is to uncover the structure already latent in the inputs: the groups, the directions of variation, the distribution that generated them. Its defining difficulty is the flip side of its freedom: with no answer key, there is often no way to say a result is right.
---

Strip the labels off a dataset and something strange happens to the problem: there is no longer a right answer to aim at. supervised learning always knows what it is trying to predict; unsupervised learning is handed a pile of inputs and asked to find the structure already sitting in them, with nothing to check itself against. The two classic shapes that structure takes are clustering, grouping points that belong together, and dimensionality reduction, compressing many correlated features into the few that carry the real variation. A third, density estimation, models the distribution the data was drawn from directly.

This matters because the world is overwhelmingly unlabeled. Text, images, sensor streams, and clickstreams pour in without annotation, and paying humans to label them is slow, costly, or impossible at scale. Unsupervised methods mine that raw material as it is: segmenting users into behavioral groups, compressing high-dimensional data down to something you can plot, flagging anomalies as the points that fit no group, and learning representations that make a later supervised task cheaper. The value is extracted without anyone ever writing down a target.

How it works depends on what structure you are after. k-means clusters by repeatedly assigning each point to its nearest center and moving each center to the mean of its members. principal component analysis reduces dimensions by finding the orthogonal directions of greatest variance and projecting onto them. Other methods model the data as a mixture of distributions, or learn an embedding in which geometric distance stands in for semantic similarity. The common thread is an objective defined entirely on the inputs, since there are no labels to compare against.

The absence of a ground truth is the catch that defines the field. Because nothing declares what the correct clustering or the right embedding is, you cannot simply grade the output, and two reasonable methods can carve the same data into different, equally defensible structures. This is why the boundary with the other paradigms has quietly blurred. self-supervised learning manufactures a target out of the unlabeled data itself, by hiding part of each example and predicting it, which recovers the precision of a supervised loss with no human labels: unsupervised in spirit, supervised in mechanics. That hybrid is what actually scaled, leaving pure unsupervised learning to exploration and to the cases where you genuinely do not yet know what you are looking for.
