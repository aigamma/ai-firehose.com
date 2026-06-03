---
title: Flow Matching
slug: flow-matching
kind: technique
category: Generative Models
aliases: conditional flow matching, rectified flow
summary: A generative modeling framework that trains a network to predict a velocity field carrying samples from a simple noise distribution to the data distribution along continuous paths, often straighter and faster to simulate than a diffusion model's.
related: diffusion-model, denoising-diffusion, score-based-model, normalizing-flow, latent-diffusion
---

Flow matching is a way to learn a continuous transformation that moves samples from a simple starting distribution, usually Gaussian noise, onto the complex distribution of real data. Instead of learning to denoise in discrete steps, it learns a velocity field: a function that, given a point and a time, says which direction and how fast that point should move. Generation then becomes the act of dropping a noise sample into this field at time zero and integrating its motion forward to time one with an ordinary differential equation solver, at which point it has become a data sample. It is the continuous, deterministic transport view of generative modeling.

Flow matching matters because it offers the sample quality of a diffusion model while targeting that model's main weakness, the cost of sampling. By choosing simple, often straight interpolation paths between noise and data during training, the learned trajectories at generation time are close to straight lines, and a near-straight path can be integrated accurately in only a handful of solver steps rather than the dozens or hundreds a typical diffusion sampler needs. This is why flow matching, and the closely related rectified flow formulation, has been adopted in several recent large-scale image and video generators, frequently operating inside a compressed latent space in the same spirit as a latent diffusion model.

The training objective is what makes it tractable. Constructing the exact velocity field for the full data distribution is intractable, but flow matching shows that you can regress against a much simpler per-sample target instead. For each training example you pick a noise point and a data point, define a simple path between them (commonly the straight line), and the network is trained to predict the velocity along that conditional path. Averaging this conditional flow matching objective over all the pairings recovers the correct field for the whole distribution, turning a hard problem into a plain regression, much as the noise-prediction target does for denoising diffusion.

Flow matching connects the major strands of modern generative modeling. It shares its noise-to-data goal and its continuous-time backbone with diffusion models and with a score-based model, and indeed diffusion can be cast as one particular choice of paths and noise within the broader flow framework. It also relates to a normalizing flow, which likewise learns an invertible map between noise and data, but flow matching learns the velocity field that defines the flow by simulation-free regression rather than constraining the network architecture to be exactly invertible, which lets it scale to the large models used for high-resolution generation.
