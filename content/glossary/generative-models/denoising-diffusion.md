---
title: Denoising Diffusion
slug: denoising-diffusion
kind: technique
category: Generative Models
aliases: DDPM, denoising diffusion probabilistic model
related: diffusion-model, score-based-model, latent-diffusion, classifier-free-guidance, flow-matching
summary: The concrete recipe (DDPM) behind most diffusion models: a network is trained on a plain regression, given a noisy sample and its noise level, predict the noise that was added, and generation walks that prediction backward from pure noise. Its power is that it reframed a hard generative problem as ordinary supervised learning, and a closed-form forward process makes training cheap.
---

Denoising diffusion is the specific formulation that turned the general idea of a diffusion model into a practical, widely used method. Introduced as the denoising diffusion probabilistic model, often abbreviated DDPM, it pins down exactly what the forward noising process is, what the network predicts, and how the reverse process generates a sample. The forward process is a fixed sequence of steps that each add a calibrated amount of Gaussian noise, governed by a noise schedule, until the data is indistinguishable from pure noise, and a key convenience is that this process has a closed form: you can jump directly to the noised version of a sample at any step without simulating the intermediate ones, which makes training cheap.

It matters because it reframed a hard generative problem as a simple supervised one, which is the keeper. Rather than learning a likelihood or playing an adversarial game, the network is trained to solve a plain regression: given a noisy sample and the noise level it was produced at, predict the noise that was added. This objective is stable, scales well, and underlies most modern image and audio generators, and the clarity of the recipe is a large part of why diffusion supplanted earlier methods so quickly.

In practice, training draws a clean sample, picks a random step on the noise schedule, adds the corresponding noise, and asks the network to recover that noise, with the loss simply the squared error between predicted and actual noise. To generate, the model starts from pure noise and walks backward through the schedule, at each step using its noise prediction to estimate a slightly cleaner sample and then partially renoising, repeating until it reaches step zero. This noise-prediction target is mathematically equivalent, up to a known scaling, to estimating the score, the gradient of the log density, which is exactly the quantity a score-based model learns, so the two named approaches are two descriptions of one underlying object.

Denoising diffusion is the engine the surrounding machinery builds on. Running it inside the compressed latent space of an autoencoder rather than on raw pixels gives a latent diffusion model, the design used by most large text-to-image systems; steering it toward a prompt is done with classifier-free guidance; and the central practical complaint, that sampling needs many sequential steps, is what motivates faster samplers and related continuous-time frameworks like flow matching, which seek the same noise-to-data transport along straighter, cheaper-to-simulate paths.
