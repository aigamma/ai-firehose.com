---
title: Image Tokenization
slug: image-tokenization
kind: technique
category: Computer Vision
related: vision-transformer, tokenization, token-embedding, autoregressive-model, clip, diffusion-model
summary: The step that turns a continuous image into a sequence of tokens, so transformer architectures built for sequences can process pixels the way they process words. The pivotal design choice is continuous patch embeddings versus discrete codebook tokens, which decides whether the model treats vision as regression or, like language, as classification over a vocabulary, and discrete tokens are what make images first-class citizens of generative sequence models.
---

Image tokenization turns a grid of pixels into a sequence of tokens, the unit a transformer consumes. Because attention operates on sequences of vectors rather than on raw two-dimensional pixel arrays, any transformer-based vision model must first decide how to slice an image into tokens. It is the visual counterpart of tokenization in language, where text is split into subword units before a model can read it, and it is the bridge that let the transformer cross from language into vision.

The choice of tokens shapes what the model can do. The vision transformer uses the simplest scheme: cut the image into a regular grid of fixed-size patches and linearly project each patch into a vector, yielding a sequence of continuous patch embeddings analogous to token embedding in language. A different family produces discrete tokens, where an encoder such as a VQ-VAE or VQ-GAN maps each image region to an index in a learned codebook of visual prototypes. The choice between continuous patches and discrete codebook tokens determines whether the model treats vision as a regression problem or, like language, as a classification-over-a-vocabulary problem.

That second, discrete form is what makes images first-class citizens of generative sequence models. Once an image is a string of integer tokens drawn from a fixed vocabulary, an autoregressive model can generate it one token at a time exactly as a language model generates text, and a single transformer can be trained on interleaved text and image tokens to read and write both. Discrete image tokens also serve as the compact target space inside which many diffusion model and multimodal systems operate, since denoising or predicting a few thousand tokens is far cheaper than working in raw pixel space.

Image tokenization is therefore the hinge on which modern multimodal AI turns. It is what allows CLIP, text-to-image generators, and multimodal large language models to put pixels and words into one shared sequence and one shared architecture. The design tension is the usual one in tokenization: smaller or finer tokens preserve more detail but lengthen the sequence and raise the quadratic cost of attention, while coarser tokens are cheaper but blur fine structure.
