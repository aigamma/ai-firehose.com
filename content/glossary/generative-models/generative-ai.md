---
title: Generative AI
slug: generative-ai
kind: technique
category: Generative Models
aliases: genAI, generative artificial intelligence
related: large-language-model, diffusion-model, transformer, variational-autoencoder, text-to-image, video-generation, frontier-model
summary: The class of models that produce new content, text, images, audio, video, or code, by learning the distribution of their training data and sampling from it, rather than only classifying or predicting a label. It is the umbrella term for the technology behind the current wave of AI products.
---

For most of machine learning's history, models discriminated: shown an input, they returned a label, spam or not, cat or dog, a number. Generative AI flips the task. Instead of mapping an input to a category, a generative model learns what its training data is like well enough to produce new examples of it, a paragraph, an image, a melody that never existed but could have. That shift from judging to creating is what put AI in front of hundreds of millions of people.

Underneath the umbrella sit a few recipes for the same trick, learn a distribution and sample from it. Autoregressive models, the transformers behind language, generate one token at a time, each conditioned on all the ones before. Diffusion models, behind most image and video generation, start from noise and denoise it step by step into a sample. Earlier families such as variational autoencoders and adversarial networks learned compact representations to sample from. What unites them is the goal, modeling the data itself rather than a label attached to it.

The defining property, and the defining hazard, is that generative models produce plausible content, not true content. A model trained to generate text like its corpus will generate text that reads like the corpus whether or not it is correct, which is why hallucination is not a bug to be patched but the flip side of the capability: the same machinery that lets it write a fluent sentence it never saw lets it state a fluent fact that is not so. Fluency and accuracy are different axes, and generative AI optimizes the first.

Generative AI is best understood less as a single technology than as a change in what computers are for. A discriminative system answers a question you pose; a generative one produces an artifact you then judge, which moves the human from asker to editor and reviewer. That thread runs through every generative product, and it is why the durable skill of the era is not prompting the model but evaluating, and taking responsibility for, what it produces.
