---
title: Autoregressive Model
slug: autoregressive-model
kind: technique
category: Generative Models
aliases: autoregressive models, AR model
summary: A generative model that factorizes a joint distribution into a product of conditionals and generates data one element at a time, each new element conditioned on those already produced.
related: generative-adversarial-network, variational-autoencoder, diffusion-model, normalizing-flow, flow-matching
---

An autoregressive model builds a sample one piece at a time, with each piece conditioned on everything generated before it. It rests on a simple, exact decomposition: the probability of a whole sequence equals the product of the probability of each element given its predecessors. A language model that predicts the next token from the preceding tokens is the most familiar example, but the same principle applies to generating an image pixel by pixel, an audio waveform sample by sample, or any structured object whose parts can be put in an order. The model is trained to predict the next element, and generation is the act of sampling that prediction and feeding it back in to predict the one after.

Autoregressive models matter because they are the foundation of large language models and, through them, of the current wave of generative AI. Their objective is a direct, well-behaved one, maximizing the likelihood of the next element, which trains stably and scales cleanly to enormous models and datasets. Unlike a generative adversarial network or a standard variational autoencoder, an autoregressive model computes the exact likelihood it assigns to data, which makes it straightforward to evaluate and to compare. This exactness and stability are large reasons the family came to dominate language and, increasingly, other modalities.

The mechanics hinge on respecting the ordering during training. So that the prediction for each position depends only on earlier positions and never peeks at the answer, the model uses masking, for example the causal attention mask in a transformer, which lets every position attend to its predecessors but not its successors. This permits all positions to be trained in parallel on a known sequence while preserving the strict left-to-right dependency that generation requires. At inference, however, generation is inherently sequential: element n cannot be produced until element n minus one exists, so a long sample takes many serial steps.

That sequential generation is the family's defining trade-off, and it frames its relationship to the other generative approaches. An autoregressive model offers exact likelihoods and superb sample quality but generates slowly, one step per element, whereas a generative adversarial network produces a whole sample in a single pass with no likelihood. A normalizing flow also gives exact likelihoods, through a different mechanism, an invertible map, and in fact some flows are built from autoregressive transformations. For images, autoregressive models compete with the diffusion model, and several modern systems blur the line by generating discrete image tokens autoregressively or by combining autoregressive and diffusion-style stages, reflecting how central the next-element prediction principle has become across generative modeling.
