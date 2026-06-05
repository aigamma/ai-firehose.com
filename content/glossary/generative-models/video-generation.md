---
title: Video Generation
slug: video-generation
kind: technique
category: Generative Models
aliases: AI video generation, generative video
related: diffusion-model, text-to-video, text-to-image, world-model, vision-language-model, large-language-model
summary: Synthesizing coherent video from a text prompt, an image, or another clip, extending image generation with the hard constraint that successive frames must agree across time. Temporal consistency, not single-frame quality, is what makes it difficult.
---

Generating one convincing image is now routine; generating thirty of them a second that agree with each other is not. A person in frame two must be the same person, in nearly the same place, lit the same way, as in frame one, or the result dissolves into a flickering hallucination. Video generation is image generation plus that temporal constraint, and the constraint is most of the difficulty.

The dominant approach extends the diffusion recipe from images to space and time. Instead of denoising a flat grid of pixels, the model denoises a block of frames at once, with attention reaching across time so a change in one frame is felt by its neighbors, which enforces consistency rather than hoping for it. Prompts can come from text, a starting image, or a previous clip, and many systems generate at low resolution and short length first, then upsample and interpolate, because attention over a full high-resolution video is brutally expensive. Each choice is a concession to the central cost: time multiplies the compute that images already strain.

The most interesting claim around video generation is that learning to predict the next frame forces the model to learn physics it was never taught. To make a poured liquid look right, a ball bounce plausibly, or a shadow track its object, the model has to internalize an implicit account of how the world behaves, which is why these systems are increasingly framed not as video toys but as early world models, simulators that could let an agent imagine the consequence of an action before taking it.

Whether that framing holds is the open question. A model can produce footage that looks physically correct while having no stable, queryable representation of objects or causality underneath, so a convincing clip is weak evidence of real understanding. The honest read is that video generation has become a demanding test of whether next-token prediction, applied to pixels over time, yields genuine world structure or only its convincing surface, and the answer is not yet in.
