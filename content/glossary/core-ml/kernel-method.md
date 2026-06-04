---
title: Kernel Method
slug: kernel-method
kind: technique
category: Core Machine Learning
aliases: kernel methods, kernel trick, kernel function
related: support-vector-machine, principal-component-analysis, k-means, regularization
summary: A way to give a linear algorithm nonlinear power without paying for it. Many models depend on the data only through similarities between pairs of points; a kernel computes the similarity those points would have in a vastly higher-dimensional space, sometimes infinite-dimensional, directly from the originals, so the method draws curved boundaries while its math stays linear.
---

The kernel trick is one of the most elegant sleights of hand in machine learning: it gives linear methods nonlinear power without ever doing the nonlinear work. Many algorithms, the support vector machine chief among them, touch the data only through inner products between pairs of points, a number measuring how similar two points are. A kernel function computes the inner product those two points would have after being mapped into some much richer, higher-dimensional feature space, but it computes it directly from the original points, never constructing the high-dimensional representation. You get the geometry of the rich space at the price of the cheap one.

That shortcut matters because real data is rarely separable by a straight line, yet linear models are simple, well understood, convex, and backed by strong theory. The kernel trick keeps all of those virtues while removing the linearity restriction. The feature space the kernel implies can be enormous, even infinite-dimensional, while the computation stays tied to the number of training examples rather than the dimension of that space, which is what keeps the whole thing tractable. This is what made support vector machines the dominant classifiers of their era and, more broadly, gave a principled route to nonlinear modeling.

Not any similarity function will do. A valid kernel must correspond to a genuine inner product in some feature space, a condition formalized by Mercer's theorem and equivalent to the kernel matrix being positive semidefinite. The common choices encode different ideas of similarity: the polynomial kernel adds feature interactions up to a chosen degree, while the radial basis function kernel measures similarity as a smooth function of distance and corresponds to an infinite-dimensional space. Choosing a kernel is choosing a prior about what makes two points alike for your problem, and its parameters are normally tuned by cross-validation.

The deepest point is that a kernel method is a technique, not a single model: the trick kernelizes anything written in terms of inner products. Principal component analysis becomes kernel PCA to capture nonlinear structure, k-means becomes kernel k-means to find non-spherical clusters, and ridge regression becomes kernel ridge regression. The kernel's control parameter, such as the bandwidth of the RBF kernel, acts as a form of regularization, governing how flexible the resulting fit is and therefore where it lands between underfitting and overfitting. The lasting lesson is that you can often reach a nonlinear answer by changing only your notion of similarity, leaving the algorithm itself untouched.
