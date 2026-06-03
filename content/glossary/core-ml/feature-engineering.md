---
title: Feature Engineering
slug: feature-engineering
kind: technique
category: Core Machine Learning
aliases: feature engineering, feature extraction
related: supervised-learning, principal-component-analysis, overfitting, cross-validation, embedding-model
summary: The craft of transforming raw data into informative input features (scaling, encoding, combining, extracting) so a model can learn effectively; historically the highest-leverage step in classical machine learning, now partly automated by representation learning.
---

Feature engineering is the work of turning raw data into the inputs a model can actually use well. Raw records are rarely in a form a learner handles best: numbers need scaling so no single feature dominates, categories need encoding into numbers (such as one-hot vectors), dates need decomposing into useful parts, missing values need handling, and domain knowledge often suggests combining or deriving signals that expose the structure of the problem. Good features make the relationship a model must learn simpler and more learnable.

In classical machine learning this was usually the highest-leverage activity in the whole pipeline. With models like linear regression, logistic regression, or gradient boosting, careful features frequently mattered more than the choice of algorithm, and the adage "garbage in, garbage out" captured the reality that a model can only be as good as the representation it is fed.

Deep learning shifted this balance. A neural network learns its own internal features, its representations, directly from raw data, which is precisely why it transformed fields like vision and language: it automated the feature-engineering that humans used to do by hand, and the learned embedding is the modern, automatic counterpart of an engineered feature.

The craft has not disappeared. On tabular and structured data, hand-built features still win, and even with deep models the upstream work of cleaning, normalizing, and structuring data remains essential. What changed is that for perceptual data, representation learning now does much of the job that feature engineering once required.
