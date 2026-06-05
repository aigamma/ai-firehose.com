---
title: Diffusion Model
slug: diffusion-model
kind: technique
category: Generative Models
aliases: diffusion models, diffusion probabilistic model
related: denoising-diffusion, score-based-model, latent-diffusion, classifier-free-guidance, flow-matching, variational-autoencoder, generative-adversarial-network
summary: A generative model that learns to reverse a gradual noising process, starting from pure noise and denoising step by step until a clean sample emerges. By turning generation into a single stable denoising regression, it became the dominant approach to high-fidelity image, audio, and video, with its one real drawback being that each sample needs many sequential steps.
---

A diffusion model generates data by learning to undo corruption. The idea has two halves: a fixed forward process takes a real sample and adds Gaussian noise in many small steps until nothing is left but pure noise, and a learned reverse process runs the other way, starting from pure noise and repeatedly removing a little at a time until a clean, coherent sample emerges. Because the forward process is simple and fixed and only the reverse process is learned, training reduces to teaching a network to denoise.

Diffusion models matter because they have become the dominant approach to high-fidelity image, audio, and video generation. They produce samples that rival or exceed a generative adversarial network in quality while training far more stably, since they optimize a single well-behaved regression objective rather than balancing an adversarial game, and they cover the diversity of the data better than GANs, avoiding mode collapse. They also expose a natural place to inject conditioning, which is what makes text-to-image systems controllable, and the systems behind modern image generators are diffusion models, almost always run in a compressed latent space as a latent diffusion model.

Under the hood, the network is trained to predict the noise that was added to a sample at a randomly chosen noise level, the concrete recipe known as denoising diffusion. This denoising objective has a precise mathematical connection to estimating the gradient of the data's log density, the view taken by a score-based model, so the two formulations describe the same family from different angles. Generation is iterative, the model called many times, once per reverse step, which is why naive diffusion sampling is slower than the single forward pass of a GAN, and conditioning toward a text prompt is typically applied with classifier-free guidance, which amplifies the difference between the conditional and unconditional predictions to make the output adhere more closely.

The principal drawback is sampling cost, because producing one sample requires many sequential network evaluations rather than one. A large research effort targets this, from improved samplers that take larger, fewer steps, to distillation methods that compress a many-step model into a handful of steps, to flow matching, a related framework that learns a continuous transport from noise to data along straighter trajectories simulated in fewer steps. Conceptually, all of these, diffusion, score matching, and flow matching, are different ways of learning to move probability mass from a simple noise distribution onto the complex distribution of real data.
