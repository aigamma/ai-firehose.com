---
title: Riemannian Manifold
slug: riemannian-manifold
kind: technique
category: Geometry and Manifolds
aliases: Riemannian geometry, Riemannian metric
related: manifold, metric-tensor, geodesic, curvature, tangent-space, information-geometry
summary: A smooth manifold equipped with a metric tensor that defines an inner product in every tangent space, giving the manifold a consistent notion of length, angle, distance, and curvature.
---

A Riemannian manifold is a smooth manifold that has been given a way to measure lengths and angles. A bare manifold knows its shape only up to smooth stretching: it can tell that it is a sphere rather than a plane, but it cannot say how far apart two points are or whether two directions are perpendicular. The added structure that supplies those answers is a Riemannian metric, a smoothly varying inner product defined on the tangent space at each point. With that inner product in hand you can compute the length of any tangent vector and the angle between any two, and from there everything else in geometry follows.

The metric is encoded by the metric tensor, often written as a symmetric positive-definite matrix that can change from point to point across the manifold. To measure the length of a curve, you integrate the metric-induced speed of its tangent vector along the way; the shortest such curve between two points is a geodesic, and its length defines the geodesic distance. Because the metric varies across the manifold, distances and straightest paths are not the naive Euclidean ones, and the way the metric forces geodesics to spread or converge is precisely what curvature records. The name honors Bernhard Riemann, who in the nineteenth century generalized Gauss's study of surfaces to spaces of arbitrary dimension and laid the groundwork that Einstein later used for general relativity.

Riemannian manifolds matter in machine learning wherever a representation space is not flat. The default assumption that embeddings live in flat Euclidean space is itself a trivial Riemannian metric, the identity matrix everywhere, but richer choices unlock capabilities flat space cannot reach. Hyperbolic embeddings place data on a negatively curved Riemannian manifold so that hierarchies fit with low distortion. Optimizing over constrained objects, like rotation matrices or covariance matrices or the directions on a unit sphere, is naturally posed as Riemannian optimization, where each gradient step is taken along a geodesic on the appropriate manifold so the iterate never leaves the valid set.

The most consequential example for statistics and machine learning is information geometry, where the space of probability distributions of a given family is treated as a Riemannian manifold. Its metric is the Fisher information, which measures how sharply a small change in parameters changes the distribution, so distance on this manifold corresponds to statistical distinguishability rather than raw parameter difference. Natural gradient descent exploits exactly this geometry, replacing the ordinary gradient with one corrected by the Fisher metric so that updates respect how much the model's output actually moves. In all these settings the lesson is the same: choosing the right metric tensor, and so the right Riemannian manifold, is choosing what distance and direction mean for the problem at hand.
