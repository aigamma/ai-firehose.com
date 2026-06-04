---
title: Loss Function
slug: loss-function
kind: technique
category: Optimization
aliases: cost function, objective function, criterion
related: gradient-descent, loss-landscape, local-minimum, stochastic-gradient-descent, weight-decay, saddle-point
summary: The single number that says how wrong a model is, the quantity training drives down. It is where you specify what the model should do, and its quiet danger is that a model optimizes exactly what you measure: a loss that fails to reward the behavior you actually want produces a model that does the wrong thing perfectly.
---

A loss function is the scalar verdict on a model's error. Given the current parameters and some data, it returns one number, large when the predictions are bad and small when they are good, and training is by definition the search for the parameters that make that number as small as possible. The loss therefore is the objective: it is the formal statement of what the model is being asked to do, and everything the optimizer does is in service of pushing it down.

Because the model optimizes exactly what the loss measures, choosing it determines what the model learns, often more than the architecture does. Different tasks demand different losses: mean squared error penalizes the squared gap between prediction and target and suits regression, while cross-entropy measures the divergence between a predicted distribution and the true label and is standard for classification and language modeling. The hazard is sharp and common: a loss that does not actually reward the behavior you want yields a model that optimizes the wrong thing flawlessly, which is why specifying the loss correctly is a central act of design, not a detail, and a close cousin of the alignment problem.

Mechanically the loss must be differentiable, or nearly so, in the parameters, because gradient descent needs its gradient to know which way is downhill. Sweeping the loss across all parameter settings traces the loss landscape, the high-dimensional surface the optimizer walks, whose minima are the candidate solutions and whose saddle points and plateaus are the stalls. Strictly, the per-example penalty is the loss and its average over the dataset is the cost, though the terms are used interchangeably in practice.

The loss is also where the modeler's preferences and priors enter, beyond raw accuracy. Adding a penalty term such as weight decay changes what the optimizer treats as optimal, trading a little fit to the training data for simpler parameters that generalize better, and auxiliary terms can encode sparsity, smoothness, or fairness. Define the loss and you have defined two things at once: the goal of training, and the terrain that gradient descent and its descendants must cross to reach it. Get it wrong and a perfectly trained model will still do the wrong thing.
