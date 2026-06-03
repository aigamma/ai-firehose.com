---
title: Diffusion Language Model
slug: diffusion-language-model
kind: technique
category: Frontier Architectures
aliases: diffusion LLM, text diffusion, masked diffusion model
related: diffusion-model, denoising-diffusion, autoregressive-model, next-token-prediction, large-language-model
summary: A language model that generates text by iteratively denoising an entire sequence in parallel, the diffusion paradigm borrowed from image generation, rather than predicting one token at a time left to right.
---

Diffusion language models question the assumption that text must be generated one token after another. The dominant approach, autoregressive generation, produces a sequence strictly left to right, each token conditioned on all the previous ones. That is the source of both its strength, a clean probabilistic factorization, and its central inference cost, since tokens cannot be produced in parallel during decoding. Diffusion language models instead adapt the denoising diffusion process that drives modern image generation: they start from a fully noised or masked sequence and iteratively refine the whole thing over a fixed number of steps, generating many positions at once.

The potential advantages follow from that parallelism and from working over the whole sequence at every step. Generation can be much faster when a long sequence is refined in a few parallel passes rather than hundreds of sequential ones. The model can also revise earlier positions in light of later ones and plan globally, rather than committing irrevocably to each token as an autoregressive model does, which may help with constraints and controllability.

The current reality is that autoregressive transformers still dominate on quality at the frontier, and diffusion language models are an active research bet rather than the default. Discrete text is harder to diffuse than continuous pixels, the training objectives are less settled, and matching autoregressive quality at scale remains an open problem. Their clearest near-term draw is speed, where parallel decoding can offer large latency wins for a given quality budget.

They sit alongside other post-transformer and efficiency-driven directions as part of a broader search for architectures that escape the strict left-to-right, one-token-at-a-time bottleneck, and they share their mathematical core with the diffusion and denoising models used for images and audio.
