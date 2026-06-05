---
title: Rectified Flow
slug: rectified-flow
kind: technique
category: Generative Models
aliases: rectified flow, reflow
related: flow-matching, diffusion-model, denoising-diffusion, score-based-model, normalizing-flow
summary: A flow-matching variant that trains a model to follow straight-line paths from noise to data, then iteratively straightens them further with a "reflow" step, so the trajectory becomes nearly straight and can be integrated in very few steps, sometimes one. It is the basis of several recent fast, high-quality image generators, achieving few-step sampling without a separate distillation stage.
---

Rectified flow reframes generation as learning a transport from noise to data along the straightest possible paths. Like diffusion and flow matching, it trains a model to predict a velocity field that, integrated from noise, carries a sample to the data. Its distinguishing goal is geometric: it wants those paths as straight as possible, because a straight path can be traversed accurately in very few integration steps, while the curved trajectories of a standard diffusion model demand many small steps to follow without error.

Training starts by pairing noise with data and learning the velocity along the straight line between each pair, and a further "reflow" procedure can iterate on this, using the model's own paths to make them straighter still, progressively reducing how many steps inference needs. The result is a model that generates high-quality samples with a small number of function evaluations, sometimes even one, without the separate distillation step other fast samplers require, which is the practical appeal.

This straight-path formulation became prominent because it is both simple and effective, and it underlies the training of recent state-of-the-art image generators that prize fast sampling alongside quality. By baking the speed objective into the path geometry rather than bolting on a later compression step, it folds the usual fast-sampling pipeline into a single training story.

Conceptually it is closely related to flow matching, which also learns a velocity field along prescribed probability paths; rectified flow is the variant that specifically chooses straight paths and refines them. All of these are continuous-time cousins of the score-based and denoising-diffusion families, differing in the path they learn and how cheaply it can be integrated, and they share the broad goal of moving probability mass from noise to data with as little work at sampling time as possible.
