---
title: Principal Component Analysis
slug: principal-component-analysis
kind: technique
category: Core Machine Learning
aliases: PCA, principal components
related: unsupervised-learning, k-means, eigenvector, dimensionality-reduction, kernel-method
summary: A method that compresses high-dimensional data by finding the few orthogonal directions along which it varies most and projecting onto them. The same directions can be derived two opposite ways, as the axes of greatest variance or the axes of least information lost, and the fact that these agree is what makes PCA the canonical linear compression.
---

Most high-dimensional data is not really high-dimensional. A dataset with a thousand features usually has far fewer than a thousand independent things going on, because the features are correlated, height with weight, one pixel with its neighbor, so the data actually lies near a low-dimensional surface inside the big space. principal component analysis finds that surface. It identifies a new set of axes, the principal components, ordered so the first captures the most variance in the data, the second the most of what remains while staying perpendicular to the first, and so on; keep the leading few and you have compressed the data while discarding almost nothing that mattered.

The elegant part is that two opposite-sounding goals land on exactly the same axes. You can ask for the directions along which the data varies the most, or you can ask for the directions that lose the least when you project the data down and try to rebuild it. Maximizing variance and minimizing reconstruction error sound like different objectives, but they are one optimization seen from two sides, and both are solved by the top eigenvectors of the data's covariance matrix. PCA is therefore at once the most faithful low-dimensional summary and the most informative one, and that is not a coincidence, it is a theorem.

Mechanically, you center the data and find the directions of greatest spread, which are the eigenvectors of the covariance matrix, equivalently read off from a singular value decomposition. Each eigenvector is a principal component and its eigenvalue measures how much variance lies along it, so the eigenvalues tell you how many components are worth keeping through the cumulative share of variance they explain. One caution does most of the damage in practice: variance depends on units, so the features must be standardized first, or a single large-scale feature will pose as the most important direction simply because it is measured in bigger numbers.

PCA is fundamentally linear, and that both grants its power and bounds it. When the structure that matters lies on a curved surface rather than a flat subspace, a straight projection flattens it and loses the very thing you cared about, which is why kernel PCA bends the method into a higher-dimensional space to catch nonlinear structure, and why manifold methods exist to unroll curved data that PCA would crush. Used within its limits it is unreasonably useful, as a denoiser, a visualizer, a decorrelator, and a fast preprocessing step that makes distances meaningful before a method like k-means goes to work. It remains the linear baseline against which every fancier dimensionality reduction is measured.
