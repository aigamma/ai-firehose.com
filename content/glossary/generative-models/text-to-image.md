---
title: Text-to-Image Generation
slug: text-to-image
kind: technique
category: Generative Models
aliases: text-to-image, text to image, T2I
related: diffusion-model, latent-diffusion, classifier-free-guidance, clip, diffusion-transformer
summary: The task and model class that generate an image from a natural-language description, today dominated by diffusion models conditioned on a text embedding, with prompt adherence controlled by classifier-free guidance.
---

Text-to-image generation turns a written prompt into a matching picture. It is the most visible form of generative AI for images, and the modern approach is a fairly settled stack. A text encoder, often derived from a contrastive model like CLIP or a language model, turns the prompt into an embedding. A generative model, almost always a latent diffusion model with a U-Net or diffusion-transformer backbone, then produces an image conditioned on that embedding, usually injecting the text through cross-attention so each region of the image can attend to the relevant words.

A key control is classifier-free guidance, which lets the system dial how strongly the output should adhere to the prompt versus how freely it can vary. Higher guidance sharpens prompt-following at some cost to diversity and naturalness, and tuning it is part of the craft of getting good results. Because generation runs in a compressed latent space, high-resolution images stay tractable, and a separate decoder converts the final latent back to pixels.

The field moved through distinct architectures: generative adversarial networks gave the first convincing results, diffusion models then took over for their stability and quality, and diffusion transformers and rectified-flow training now push the frontier for fidelity and speed.

The hard problems are less about raw image quality than about control and reliability: composing multiple objects with correct attributes and relationships, rendering legible text within the image, and following long or precise prompts faithfully. Progress on text-to-image is increasingly measured by these compositional and controllability challenges rather than by photorealism alone.
