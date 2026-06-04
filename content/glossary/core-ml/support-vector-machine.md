---
title: Support Vector Machine
slug: support-vector-machine
kind: technique
category: Core Machine Learning
aliases: SVM, support vector machines, support vector classifier
related: kernel-method, supervised-learning, regularization, decision-tree, overfitting
summary: A classifier built on one geometric conviction: of all the boundaries that could separate two classes, the best is the one that leaves the widest empty margin between them. Only the few hardest examples touching that margin decide the boundary, and a trick for measuring similarity lets the same linear method draw wildly nonlinear lines.
---

Of the infinitely many lines that could separate two classes, which is best? The support vector machine answers with a single geometric conviction: pick the line that leaves the widest gap. The boundary is a hyperplane, the margin is the distance from it to the nearest training point on either side, and the SVM finds the hyperplane that makes that margin as wide as possible. The striking consequence is that almost all of the data is irrelevant. Only the few points sitting exactly on the margin's edge determine the boundary, the support vectors, and you could delete every other example without moving the line at all.

That wide margin is not just elegant, it is a built-in defense against overfitting. By pushing the boundary as far as it can from both classes, the SVM commits as little as possible to the noise near the decision surface, which is a form of regularization baked into the geometry rather than bolted on as a penalty. This is why SVMs generalize unusually well when the features outnumber the examples, a regime where many models collapse, and why, before deep learning took over, they were the default high-accuracy classifier for text, images, and bioinformatics, and remain a strong baseline on small to medium data.

The deeper source of their power is the kernel method. Real data is rarely separable by a straight line, but an SVM touches the data only through inner products between pairs of points, a measure of similarity, and the kernel trick computes the inner product the points would have in some much richer, higher-dimensional space without ever building that space. With a radial basis function kernel the SVM can carve a highly nonlinear boundary while its mathematics stays exactly that of a linear model. A soft-margin variant adds a penalty that lets a few points violate the margin, trading a little misclassification for a wider, more robust boundary.

Two further properties explain the SVM's long reign. Training one is a convex optimization problem, so it has a single global solution with no bad local minima to trap it, a guarantee the non-convex training of a neural network gives up. And it contrasts cleanly with a decision tree, which chops feature space into axis-aligned boxes through many local decisions rather than separating the classes with one globally optimal cut. Its real limits are cost on very large datasets and sensitivity to the choice of kernel and its parameters, normally tuned by cross-validation. The SVM is the canonical lesson that a good prior about the shape of a solution, here, leave the widest margin, can matter more than raw flexibility.
