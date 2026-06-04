---
title: Geodesic
slug: geodesic
kind: technique
category: Geometry and Manifolds
aliases: geodesics, shortest path on a manifold
related: manifold, curvature, riemannian-manifold, latent-space, manifold-hypothesis, metric-tensor
summary: The straightest possible path between two points on a curved surface, the curved-space stand-in for a straight line. It matters in machine learning because data is believed to lie on a curved manifold, so the meaningful distance between two points is the geodesic along that surface, not the straight line through the space it sits in.
---

A geodesic is the curved-space analogue of a straight line. On a flat plane the shortest route between two points is a straight segment, but on a curved surface, like the face of the Earth, no straight line lies within the surface at all, so "straight" has to be redefined. The geodesic is the path that stays on the surface and is as straight as the geometry allows, bending only as much as the surface forces. For a sphere these are the great circles, which is why a long flight from one city to another bows toward the pole rather than following a constant compass bearing: the curved-looking route on a flat map is the genuinely straight one on the globe.

Formally, a geodesic is a curve that parallel-transports its own tangent vector, meaning it never turns left or right relative to the surface; it only bends as much as the surface forces it to. Its length is measured by the metric tensor, the object that says how to compute distances and angles at each point of a manifold. Where the metric varies from place to place, so do the geodesics, and the way they spread apart or converge as they go is exactly what curvature measures. A geodesic is the manifold's own notion of going straight ahead.

Geodesics matter in machine learning because high-dimensional data is widely believed to lie on or near a low-dimensional curved manifold, the manifold hypothesis. When that is true, the meaningful distance between two data points is not the straight-line Euclidean distance through the surrounding space but the geodesic distance along the data manifold itself. Two photographs of a rotating object can be far apart pixel by pixel yet adjacent along the manifold of poses, which is the difference between a distance that respects the data's structure and one that ignores it.

This reframing shows up across the field. Methods like Isomap estimate geodesic distances to unfold a manifold into a flatter representation. Interpolating along a geodesic in the latent space of a generative model produces smooth, plausible transitions, a face morphing through realistic intermediate faces, where a naive straight-line blend would cut across empty regions the data never occupies and produce blurry averages. And in information geometry, the space of probability distributions is itself a curved manifold whose geodesics, measured by the Fisher information, trace the most efficient paths of statistical change. Wherever data is curved, the geodesic is the honest distance.
