---
title: Perceiver
slug: perceiver
kind: technique
category: Frontier Architectures
aliases: Perceiver, Perceiver IO
related: transformer, self-attention, vision-transformer, large-language-model, sparse-attention
summary: A transformer-style architecture built to consume any kind of input, images, audio, point clouds, raw bytes, without modality-specific design, by funneling the huge input through a small fixed-size set of latent vectors. That funnel breaks attention's quadratic dependence on input size, letting one general architecture scale to very large or mixed inputs.
---

A standard transformer's self-attention compares every input element with every other, so its cost grows with the square of the input length, which is fine for a sentence and ruinous for a high-resolution image or a long audio clip treated as raw signal. The Perceiver was designed to escape that wall and, with it, the need to hand-craft a different front end for every modality. Its goal was one architecture that could ingest anything, from pixels to audio samples to point clouds, without modality-specific tricks.

The mechanism is a latent bottleneck. Instead of letting the input attend to itself, the Perceiver introduces a small, fixed-size set of latent vectors and uses cross-attention so those latents attend to the large input, distilling it into the latent space. All the heavy self-attention then happens among the few latents, whose number you choose, not among the many input elements. This decouples the bulk of the computation from the input size, turning the quadratic dependence on input length into a linear one and a quadratic dependence only on the small latent count.

That single design choice is what gives the architecture its generality. Because the input is only ever read through cross-attention, swapping images for audio for raw bytes changes nothing structural; the latents do not care what they are attending to. The follow-up, Perceiver IO, extended the idea to arbitrary outputs as well, querying the processed latents to produce structured predictions of any shape, so the same backbone could handle classification, dense prediction, or sequence output.

The Perceiver matters as one of the clearest attempts at a truly general-purpose architecture, a single model family for all modalities rather than a zoo of specialized networks, which is the direction multimodal models have moved. Its specific latent-bottleneck trick did not become the universal default, since modality-specific tokenization plus standard transformers proved very strong, but the question it posed, how to attend to enormous and heterogeneous inputs without paying the all-pairs cost, remains central, and the latent-array idea recurs throughout efficient and multimodal architecture design.
