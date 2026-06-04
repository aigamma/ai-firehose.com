---
title: Derivative
slug: derivative
kind: technique
category: Calculus and Analysis
aliases: derivatives, rate of change
related: partial-derivative, gradient, chain-rule, directional-derivative, integral, taylor-expansion
summary: The instantaneous rate at which a function's output changes as its input changes, the slope of its graph at a point. It is the single most load-bearing idea in machine learning, because training a model is nothing but following derivatives downhill, and a function you cannot differentiate is a function you cannot learn.
---

The derivative measures how fast a function's output moves when you nudge its input. Picture the graph of the function: the derivative at a point is the slope of the line that just grazes the curve there, the tangent. Formally it is a limit, the average rate of change over a shrinking interval, the rise over the run as the run goes to zero, and when that limit exists the function is differentiable and the derivative is itself a new function reporting the slope everywhere. But the limit is the bookkeeping; the slope is the idea.

The derivative matters because almost everything in machine learning is trained by following slopes downhill. A loss function reports how wrong a model is, and its derivative with respect to each parameter says which way, and how hard, to nudge that parameter to reduce the error. No derivatives, no gradient descent, no backpropagation, and no way to fit the billions of parameters in a modern network. A model is "trainable" precisely to the extent that its loss is differentiable in its parameters, which is why so much of architecture design is, quietly, the art of keeping everything differentiable.

Mechanically, derivatives obey a small set of rules that make them computable for any expression built from simpler pieces: the power rule, the product rule, the quotient rule, and above all the chain rule, which differentiates nested functions by multiplying the derivatives of their parts. Automatic differentiation, the engine inside every deep learning framework, is nothing more than the systematic, exact application of these rules to a computation graph, which is how a network's gradients are obtained without anyone deriving them by hand.

The derivative generalizes in several directions the rest of calculus builds on. With many inputs, the derivative with respect to one while holding the others fixed is the partial derivative, and the vector collecting all of them is the gradient. The derivative along an arbitrary direction rather than a coordinate axis is the directional derivative. Stacking the first derivatives of a vector-valued function gives the Jacobian, and differentiating a second time gives the curvature captured by the Hessian. The reverse operation, accumulating a rate of change back into a total, is the integral.
