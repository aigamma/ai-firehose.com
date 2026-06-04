---
title: Gradient Boosting
slug: gradient-boosting
kind: technique
category: Core Machine Learning
aliases: gradient boosting, GBDT, XGBoost, LightGBM
related: decision-tree, random-forest, ensemble-learning, bias-variance-tradeoff, overfitting
summary: A method that builds a strong predictor by adding many small models in sequence, each trained to fix the mistakes the others left behind. Where a random forest builds independent trees in parallel to cancel variance, boosting builds dependent trees in series to cut bias, and the result, libraries like XGBoost, is what usually wins on tabular data.
---

Gradient boosting builds a powerful model out of deliberately weak ones by having each new model clean up after the last. It starts with a crude prediction, looks at where that prediction is wrong, fits a small model, usually a shallow decision tree, to those errors, and adds it to the running total, scaled down by a small learning rate. Then it looks at the errors that remain and fits another tree to those, and another, hundreds of times. Each tree is individually feeble, correcting only a sliver of the remaining mistake, but their sum is a highly accurate model assembled one correction at a time. More precisely, each tree is fit to the negative gradient of the loss, which is what makes the residual-chasing work for any differentiable objective.

The cleanest way to understand it is against the random forest, because the two great tree ensembles are near-opposites. A random forest trains many trees independently and in parallel on resampled data, then averages them, which mainly cancels variance. Gradient boosting trains its trees in strict sequence, each one existing only to fix the ones before it, which mainly cuts bias. Parallel and variance-reducing versus sequential and bias-reducing: that contrast is the whole conceptual map of tree ensembles, and it is why boosting can reach an accuracy a forest cannot, by relentlessly grinding down the error that the forest's averaging leaves in place.

On tabular and structured data, gradient boosting is usually the method to beat. The optimized implementations, XGBoost, LightGBM, and CatBoost, are the default winners of countless data-science competitions and a mainstay of production models on spreadsheet-like data, the broad domain where deep learning still frequently does not pay off. When a practitioner says a problem is "just tabular prediction," they often mean a gradient-boosted tree is the right and probably the best answer.

Its power is also its hazard. Because it keeps fitting the residuals, an unchecked boosting model will eventually start fitting the noise and overfit, the price of its relentlessness. The remedies are a small learning rate so each tree contributes little, shallow trees so none is too expressive, subsampling of rows and features to inject some of the forest's decorrelation, and early stopping on a validation set to halt before the model begins memorizing. These knobs are what turn boosting's appetite for error into generalization rather than overfitting.
