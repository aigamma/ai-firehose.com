---
title: Diffusion Transformer
slug: diffusion-transformer
kind: technique
category: Generative Models
aliases: DiT, diffusion transformer
related: diffusion-model, latent-diffusion, vision-transformer, denoising-diffusion, text-to-image
summary: A diffusion model whose denoising network is a transformer over image or video patches instead of a U-Net. The motivation is scaling: a transformer inherits the clean, predictable compute-quality scaling laws that drove the language-model era, where a convolutional U-Net does not, which is why it backs a wave of recent high-end image and video generators.
---

The diffusion transformer, or DiT, swaps the backbone of a diffusion model. For years the network performing the denoising step was a U-Net, a convolutional architecture with skip connections borrowed from image segmentation. DiT replaces it with a transformer: the image is cut into patches, each patch becomes a token, and the same self-attention machinery that powers language models and vision transformers does the denoising, conditioned on the timestep and on whatever guidance is provided, a text embedding or a class label.

The motivation is scaling, and it is the keeper. Transformers have a well-characterized, predictable relationship between compute, data, and quality, the scaling laws that drove the language-model era, and DiT inherits it: making the transformer bigger and training it longer improves sample quality smoothly, where a convolutional U-Net does not scale as cleanly or as predictably. Using one uniform, well-understood architecture across modalities also simplifies engineering and lets advances in transformers carry straight over to generation.

In practice DiT almost always runs in a compressed latent space rather than on raw pixels, the latent diffusion recipe, so the transformer operates on a manageable grid of latent patches and a separate decoder turns the result back into an image. This is what keeps high-resolution generation tractable while still enjoying the transformer's scaling behavior.

DiT is the backbone behind a wave of recent systems, including high-end image generators and the patch-and-token approach that extends naturally to video, where frames become additional tokens. It is the clearest example of the broader convergence on the transformer as the default architecture across language, vision, and generation, the same component now doing the work in every modality.
