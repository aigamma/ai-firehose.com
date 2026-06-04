---
title: Random Forest
slug: random-forest
kind: technique
category: Core Machine Learning
aliases: random forests, random decision forest
related: decision-tree, overfitting, bias-variance-tradeoff, supervised-learning
summary: An ensemble that trains hundreds of deliberately different decision trees and lets them vote, so the errors of many unstable trees cancel into one accurate, stable prediction. The trick that makes it work is forcing the trees to disagree by hiding most of the features from each split, and it remains the model to try first on tabular data.
---

One decision tree is accurate but jittery: retrain it on slightly different data and it can change completely. A random forest turns that weakness into a strength by building hundreds of trees and combining them, classification by vote, regression by average. The key insight is statistical: if the trees make different, uncorrelated mistakes, those mistakes mostly cancel when you average them, while the genuine signal they all detect reinforces. So the forest is far more accurate and far more stable than any single tree, not because each tree got better but because their errors were made to disagree.

Forcing that disagreement is the whole art, and a forest injects randomness in two places to get it. First, bagging: each tree trains on a bootstrap sample, a random draw of the data taken with replacement, so no two trees see quite the same examples. Second, and more importantly, feature subsampling: at each split a tree may only consider a random subset of the features rather than all of them. This second trick is the one that really matters, because without it every tree would lean on the same one or two dominant features and make the same mistakes, defeating the averaging. Starving each split of most of the features is what decorrelates the trees and makes the whole scheme pay off.

Two practical bonuses come for free. The examples left out of each tree's bootstrap sample, the out-of-bag points, provide an estimate of generalization error with no separate validation set required. And because each feature's contribution can be measured across the forest, you get a built-in ranking of feature importance. This combination, strong accuracy with almost no tuning, graceful handling of mixed and missing data, and free diagnostics, is why a random forest is the sensible first model to reach for on a new tabular problem and a hard baseline to beat.

In the language of the bias-variance tradeoff, the forest is the textbook variance-reduction machine: each deep tree is low-bias and high-variance, and averaging many decorrelated ones slashes the variance while leaving the bias alone, which is the entire source of the gain. It contrasts with boosting, the other great tree ensemble, which builds trees in sequence to cut bias rather than in parallel to cut variance. The one real cost is legibility: a single decision tree can be read at a glance, but a committee of hundreds is effectively a black box, the price the forest pays for its accuracy.
