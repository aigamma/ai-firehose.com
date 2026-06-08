---
title: Visual Tokenization
slug: visual-tokenization
kind: technique
category: Computer Vision
aliases: visual tokenization, image tokenization, visual tokenizer
related: vision-transformer, tokenization, clip, diffusion-transformer, transformer
summary: Turning an image into a sequence of discrete or vector tokens so it can be fed to a transformer the way text is, the move that let the architecture built for language take over vision and multimodal generation. How the pixels are chopped and encoded sets a hard ceiling on what the downstream model can see and produce.
---

Transformers consume sequences of tokens, and text comes pre-chopped into them; an image does not. Visual tokenization is the conversion that bridges the gap, turning a grid of pixels into a sequence the transformer can process exactly as it processes words. It is the unglamorous step that made the language architecture applicable to vision at all, and the way it is done shapes everything the model can subsequently perceive or generate.

There are two broad styles, suited to two goals. For understanding, the vision transformer simply cuts the image into fixed patches and linearly embeds each into a continuous vector, a soft token; the patches in order become the sequence. For generation, the tokenizer is usually discrete: a model like a VQ-VAE learns a codebook and maps each image region to the nearest code, so an image becomes a sequence of integer tokens from a finite vocabulary, exactly like text, which is what lets an autoregressive or masked transformer generate images token by token the way a language model generates words.

The decisive trade is granularity against cost. Smaller patches or a finer codebook preserve more detail but produce a longer sequence, and attention's cost grows with sequence length, so visual tokenization sets the resolution-versus-compute frontier for the whole model. Discrete tokenization adds its own tension: the codebook must be expressive enough to reconstruct images faithfully yet compact enough to model, and a weak tokenizer caps generation quality no matter how good the transformer on top is, because the model can only ever produce what its vocabulary can represent.

Visual tokenization matters because it is the seam where vision joins the transformer-and-token paradigm that now dominates AI, and therefore the seam where multimodal models are stitched together: once images, and by extension audio and video, are tokens, a single model can attend across all of them in one sequence. Much of the progress in image and video generation has come not from new transformers but from better tokenizers, a reminder that in a token-based world, how you turn the world into tokens is half the battle.
