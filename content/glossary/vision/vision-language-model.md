---
title: Vision-Language Model
slug: vision-language-model
kind: technique
category: Computer Vision
aliases: VLM, multimodal LLM, vision language model
related: clip, vision-transformer, cross-attention, large-language-model, multimodal-learning
summary: A model that jointly processes images and text, typically by projecting visual features into a language model's token space so it can describe, answer questions about, and reason over images alongside text.
---

A vision-language model gives a language model eyes. The dominant recipe pairs three parts: a vision encoder, usually a vision transformer often trained with a contrastive objective like CLIP, that turns an image into a set of feature vectors; a projector, a small learned module that maps those visual features into the language model's embedding space so they look like tokens it understands; and a large language model that then processes the image tokens and the text tokens together. Some designs feed the visual tokens into the sequence directly, others inject them through cross-attention, but the principle is the same: bring vision into the space where the language model already reasons.

Training generally proceeds in stages. The components may be pretrained separately, then aligned on large sets of image-text pairs so the projector learns to speak the language model's dialect, and finally instruction-tuned on multimodal tasks so the model learns to follow visual instructions and answer in a useful form. Because the language model carries most of the reasoning ability, a strong base model tends to make a strong VLM.

The capabilities this unlocks are broad: describing images, answering questions about them, reading and reasoning over documents, charts, and diagrams, locating objects, and increasingly driving software by interpreting screenshots, the foundation of computer-use agents. The same architecture extends to video and audio by encoding those modalities into tokens as well.

The hard parts are visual grounding (pointing precisely at what a question refers to), avoiding confident misreadings of fine detail, and handling high-resolution or text-dense images, since the number of visual tokens balloons with resolution and strains the context window.
