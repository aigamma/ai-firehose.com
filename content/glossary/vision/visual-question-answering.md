---
title: Visual Question Answering
slug: visual-question-answering
kind: technique
category: Computer Vision
aliases: VQA, visual question answering
related: clip, vision-transformer, large-language-model, semantic-segmentation, transformer
summary: The task of answering a natural-language question about an image, "how many people are wearing hats", "is the light red", which demands that a system both see and reason in language at once. It became the canonical benchmark for multimodal models because it cannot be solved by either vision or language alone.
---

Visual question answering asks a system to look at an image and answer a question about it in words. The task is deceptively demanding: "what color is the car on the left" requires locating the right object, recognizing a property, and phrasing an answer, while "is this safe to eat" requires recognition plus world knowledge. It cannot be faked by either half alone, which is exactly why it became the standard probe of whether a model genuinely fuses vision and language rather than handling them separately.

The architecture has followed the field. Early systems encoded the image with a convolutional network and the question with a recurrent network, then fused the two vectors and classified an answer from a fixed list. The modern approach is a single multimodal transformer: image patches and text tokens enter the same sequence, attention lets every word attend to every region, and the answer is generated as free text rather than picked from a closed set. Contrastive pretraining of the kind behind CLIP gives these models an aligned vision-language space to build on.

The failure mode that made VQA instructive is shortcut learning. Early models scored well by exploiting statistical biases in the datasets, answering "tennis" to "what sport" and "two" to "how many" because those were the common answers, without really looking at the image. That embarrassment forced harder, bias-controlled benchmarks and is a clean lesson in how a benchmark can be gamed: a high score measured dataset regularities, not the visual reasoning the task was meant to test.

Visual question answering matters now as the direct ancestor of the multimodal chat assistant. When a current model answers questions about a photo, a chart, or a screenshot, it is doing VQA generalized past a fixed answer set into open-ended dialogue. The task that once needed a bespoke architecture is now a built-in capability of large multimodal models, which is why VQA shifted from a standalone field to one of the core things a general vision-language model is expected to do.
