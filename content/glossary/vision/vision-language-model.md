---
title: Vision-Language Model
slug: vision-language-model
kind: technique
category: Computer Vision
aliases: VLM, multimodal LLM, vision language model
related: clip, vision-transformer, cross-attention, large-language-model, multimodal-learning
summary: A model that gives a language model eyes, projecting visual features into the LM's token space so it can describe, answer questions about, and reason over images alongside text. Because the language model carries most of the reasoning, a strong base model tends to make a strong VLM, and the architecture extends the same way to video and audio.
---

A vision-language model gives a language model eyes. The dominant recipe pairs three parts: a vision encoder, usually a vision transformer often trained with a contrastive objective like CLIP, that turns an image into a set of feature vectors; a projector, a small learned module that maps those visual features into the language model's embedding space so they look like tokens it understands; and a large language model that then processes the image tokens and the text tokens together. Some designs feed the visual tokens into the sequence directly, others inject them through cross-attention, but the principle is the same: bring vision into the space where the language model already reasons.

Training generally proceeds in stages. The components may be pretrained separately, then aligned on large sets of image-text pairs so the projector learns to speak the language model's dialect, and finally instruction-tuned on multimodal tasks so the model learns to follow visual instructions and answer in a useful form. Because the language model carries most of the reasoning ability, a strong base model tends to make a strong VLM, which is why progress in language models flows almost directly into vision-language ones.

The capabilities this unlocks are broad: describing images, answering questions about them, reading and reasoning over documents, charts, and diagrams, locating objects, and increasingly driving software by interpreting screenshots, the foundation of computer-use agents. The same architecture extends to video and audio by encoding those modalities into tokens as well, so a single model can in principle perceive across every channel by reducing each to tokens the language model can read.

The hard parts are visual grounding, pointing precisely at what a question refers to, avoiding confident misreadings of fine detail, and handling high-resolution or text-dense images, since the number of visual tokens balloons with resolution and strains the context window. These limits are the active frontier: a VLM that cannot reliably ground its words in the right region of the image, or that hallucinates text it cannot quite read, is the failure mode the field is most focused on closing.
