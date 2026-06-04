---
title: Directional Derivative
slug: directional-derivative
kind: technique
category: Calculus and Analysis
aliases: directional derivatives
related: gradient, partial-derivative, derivative, jacobian, chain-rule, taylor-expansion
summary: The rate at which a multivariable function changes as you move in an arbitrary direction, equal to the dot product of the gradient with a unit vector pointing that way. It generalizes the partial derivative from coordinate axes to any direction, makes the gradient's "steepest ascent" meaning precise, and is exactly the quantity forward-mode automatic differentiation computes in one pass.
---

The directional derivative measures how fast a function of several variables changes as you set off from a point in a direction you choose. A partial derivative is restricted to motion along a single coordinate axis; the directional derivative allows any direction at all, which is the more natural question to ask. It is defined as the ordinary derivative of the function along the straight line through the point in that direction, and for a smooth function it has a clean closed form: the dot product of the gradient with the unit vector that specifies the direction.

That formula is what makes the geometric meaning of the gradient explicit. Because a dot product is largest when the two vectors point the same way, the directional derivative is maximized in the direction of the gradient and equals the gradient's magnitude there, which is precisely why the gradient is the direction of steepest ascent and its negative the direction gradient descent follows. In any direction perpendicular to the gradient the directional derivative is zero, recovering the fact that the gradient is normal to the level sets. The gradient, in short, is the one vector that encodes the rate of change in every direction at once.

Computationally, the directional derivative is exactly the quantity that forward-mode automatic differentiation produces in a single pass, the Jacobian-vector product, without ever forming the full gradient or Jacobian. This makes it cheap and useful: it underlies Hessian-vector products that supply curvature along one direction for second-order methods, and it appears in the first-order term of a Taylor expansion, where the local change in a function is approximated by the directional derivative along the displacement. Probing a model's sensitivity along one specific direction, rather than to every input separately, is often all an algorithm actually needs.

Conceptually the directional derivative is the bridge between the per-axis view of the partial derivative and the whole-function view of the gradient. Knowing the directional derivative in every direction is equivalent to knowing the gradient, because all of them are reconstructed from that one vector by a dot product. It is the natural language for any question of the form "how does the output respond if I move this way," from interpreting which input perturbations most affect a prediction to analyzing how a loss changes along a particular update step.
