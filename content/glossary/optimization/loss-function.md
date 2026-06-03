---
title: Loss Function
slug: loss-function
kind: technique
category: Optimization
aliases: cost function, objective function, criterion
related: gradient-descent, loss-landscape, local-minimum, stochastic-gradient-descent, weight-decay, saddle-point
summary: A function that measures how wrong a model's predictions are by mapping its parameters to a single number, the quantity that training tries to minimize. It defines what "good" means for the model.
---

A loss function is the scalar measure of a model's error. Given the model's current parameters and some training data, it returns a single number that is large when the predictions are bad and small when they are good. Training is, by definition, the search for the parameters that make this number as small as possible. The loss function therefore encodes the entire objective: it is the formal statement of what the model is being asked to do, and everything the optimizer does is in service of driving it down.

It matters because the choice of loss function determines what the model learns, often more than the architecture does. Different tasks call for different losses. Mean squared error penalizes the squared gap between prediction and target and suits regression. Cross-entropy measures the divergence between a predicted probability distribution and the true label and is the standard for classification and for language modeling. A loss that does not actually reward the behavior you want will produce a model that optimizes the wrong thing perfectly, which is why specifying the loss correctly is a central act of model design rather than a detail.

Mechanically the loss function must be differentiable (or nearly so) with respect to the parameters, because gradient descent needs its gradient to know which way is downhill. Evaluating the loss over the parameters traces out the loss landscape, the high-dimensional surface the optimizer walks. Its minima are the candidate solutions, its local minima and saddle points are the traps and stalls, and its overall shape is what makes optimization easy or hard. Strictly, the per-example penalty is the loss and the average over the dataset is the cost, though in practice the terms are used interchangeably.

The loss is also where regularization enters. Adding a penalty term such as weight decay to the loss function changes what the optimizer treats as optimal, trading a little fit to the training data for simpler parameters that generalize better. In this way the loss function is not only the target of optimization but the place where the modeler expresses preferences and priors. Define the loss and you have defined both the goal of training and the terrain that gradient descent, stochastic gradient descent, and adaptive methods like Adam must traverse.
