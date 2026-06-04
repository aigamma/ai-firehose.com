---
title: Partial Derivative
slug: partial-derivative
kind: technique
category: Calculus and Analysis
aliases: partial derivatives, partials
related: derivative, gradient, jacobian, hessian, directional-derivative, chain-rule
summary: The derivative of a multivariable function with respect to one input while holding all the others fixed, measuring how the output responds to a change along a single coordinate axis. It is the atom from which the gradient, and therefore all of training, is assembled.
---

A partial derivative asks a deliberately narrow question. When a function depends on many variables, the partial derivative with respect to one of them measures how the output changes as that single variable moves, with every other variable frozen in place. It is the ordinary derivative restricted to one coordinate direction, written with a rounded symbol to distinguish it from the total derivative of a one-variable function. Narrowing attention to one variable at a time is what makes calculus on many variables tractable at all.

Partial derivatives matter because the functions optimized in machine learning depend on enormous numbers of variables at once, every weight and bias in a model. To improve the model you need to know the separate influence of each parameter on the loss, and that separate influence is exactly a partial derivative. Collect the partial derivatives with respect to all the inputs into one vector and you have the gradient, the object gradient descent follows downhill. So the partial derivative is the atomic unit from which the gradient, and therefore all of training, is built.

Computing a partial derivative uses the ordinary rules of differentiation with one simplification: anything not involving the chosen variable is a constant and differentiates to zero. The subtlety arrives when variables are coupled through intermediate quantities, which is the rule rather than the exception in a deep network, where one input feeds many paths to the output. There the multivariable chain rule applies: the total effect of one input propagates through every path connecting it to the output, and the contributions along those paths are summed. Backpropagation is precisely the efficient bookkeeping that organizes this sum.

Partial derivatives are the building blocks of the higher-order structures used throughout the field. The full set of first-order partials of a scalar function is the gradient; the matrix of first-order partials of a vector-valued function is the Jacobian; the matrix of second-order partials is the Hessian, which encodes local curvature. A directional derivative is a weighted combination of partial derivatives measuring change along an arbitrary direction rather than a single axis. Master the partial derivative and the whole vocabulary of multivariable calculus that optimization runs on falls into place.
