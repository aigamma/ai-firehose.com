---
title: Rectified Flow
slug: rectified-flow
kind: technique
category: Generative Models
aliases: rectified flow, reflow
related: flow-matching, diffusion-model, denoising-diffusion, score-based-model, normalizing-flow
summary: A generative approach that trains a model to follow straight-line paths between noise and data, so the learned trajectory is nearly straight and can be integrated in very few steps, the basis of several recent fast, high-quality image generators.
---

Rectified flow reframes generation as learning a transport from a simple noise distribution to the data distribution along the straightest possible paths. Like diffusion and flow matching, it trains a model to predict a velocity field that, when integrated from noise, carries a sample to the data. Its distinguishing goal is geometric: it wants those paths to be as straight as possible, because a straight path can be traversed accurately in very few integration steps, while the curved trajectories of a standard diffusion model demand many small steps to follow without error.

Training starts by pairing noise with data and learning the velocity along the straight line between each pair. A further "reflow" procedure can iterate on this, using the model's own paths to make them straighter still, progressively reducing how many steps inference needs. The result is a model that generates high-quality samples with a small number of function evaluations, sometimes even one, without the separate distillation step other fast samplers require.

This straight-path formulation has become prominent because it is both simple and effective, and it underlies the training of recent state-of-the-art image generators that prize fast sampling alongside quality.

Conceptually it is closely related to flow matching, which also learns a velocity field along prescribed probability paths; rectified flow is the variant that specifically chooses straight paths and refines them. All of these are continuous-time cousins of the score-based and denoising-diffusion families, differing in the path they learn and how cheaply it can be integrated.
