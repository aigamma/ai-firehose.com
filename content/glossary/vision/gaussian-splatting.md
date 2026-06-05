---
title: Gaussian Splatting
slug: gaussian-splatting
kind: technique
category: Computer Vision
aliases: 3D Gaussian Splatting, 3DGS
related: neural-radiance-field, multilayer-perceptron, vision-transformer, diffusion-model
summary: A 3D representation that models a scene as millions of tiny colored 3D Gaussians, soft blobs that are rasterized to render novel views in real time. Its whole advantage is explicitness: rasterizing splats uses the same machinery GPUs were built for, so it trains and renders far faster than a NeRF's per-ray network queries, which is why it largely succeeded NeRF for interactive uses.
---

Gaussian splatting represents a 3D scene not as a neural function but as a cloud of millions of tiny 3D Gaussians, soft ellipsoidal blobs each with a position, a size and orientation (a covariance), a color, and an opacity. To render a view, these Gaussians are projected onto the image plane and rasterized, splatted, and blended in depth order. Like a neural radiance field, the representation is optimized so rendered views match a set of input photos, but the scene is stored explicitly as primitives rather than implicitly in a network's weights.

That explicitness is the whole advantage, and it is the keeper. Querying a neural network along every ray, as a NeRF does, is slow; rasterizing Gaussians uses the same machinery GPUs were built for, so gaussian splatting renders in real time and trains far faster, while matching or exceeding NeRF's visual quality. Since its 2023 introduction it was adopted remarkably quickly for fast, high-fidelity, and editable 3D reconstruction.

The explicit primitives also make scenes easier to manipulate and integrate with traditional graphics pipelines, since a splat is a concrete object you can move, recolor, or delete, unlike a value baked into a network's weights. This suits interactive applications, VR and AR, and content creation, where being able to edit the representation directly matters as much as rendering it.

The trade is memory and representation: storing millions of Gaussians is heavy, and an explicit point-like representation handles some effects, reflections and thin structures, differently than an implicit field. The two approaches, the implicit NeRF and the explicit splat, now define the main axis of learned 3D scene representation, function versus primitives, and both feed into the broader push toward 3D generation.
