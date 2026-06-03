---
title: Transformer
slug: transformer
kind: technique
category: Transformers and LLMs
aliases: transformer architecture, transformers
related: self-attention, multi-head-attention, positional-encoding, large-language-model, token-embedding, next-token-prediction
summary: A neural network architecture built around self-attention rather than recurrence or convolution, which processes a whole sequence in parallel and has become the foundation of nearly every modern large language model.
---

The transformer is the architecture that reshaped natural language processing and now underpins most of modern AI. Introduced in 2017 in the paper "Attention Is All You Need," it replaced the recurrent and convolutional designs that came before it with a stack built almost entirely from self-attention and ordinary feedforward layers. Its central idea is that a model does not need to read a sequence left to right; it can look at every position at once and let the data decide which positions matter to which.

A transformer processes a sequence by first turning each token into a vector through a token embedding, then adding a positional encoding so the model knows where each token sits. The result flows through a stack of identical layers, each of which contains two main parts: a multi-head attention block that mixes information across positions, and a position-wise feedforward network that transforms each position on its own. Residual connections and layer normalization wrap both parts, which is what lets the stack grow to dozens or hundreds of layers without the signal degrading.

The architecture comes in three shapes. The original encoder-decoder form, used for translation, reads a source sequence with an encoder and generates a target with a decoder that attends back to it. Encoder-only models such as BERT keep only the reading half and are used for classification and retrieval. Decoder-only models, which include the GPT family and most large language models, keep only the generating half and are trained for next-token prediction, attending only to tokens already produced.

What made the transformer dominant is that it is parallel and it scales. Because self-attention has no sequential dependency across positions, every token in a sequence is processed at the same time, which maps efficiently onto modern accelerators and let practitioners train on far more data than recurrent models ever could. That trainability is precisely what the scaling laws exploit: pour in more parameters, more data, and more compute, and transformer performance improves smoothly and predictably.

The price of this design is that attention costs grow quadratically with sequence length, which is the pressure behind the context window limit and the many efficiency techniques (the kv-cache, sparse and linear attention) that try to relax it. Even so, the core recipe has proven remarkably general, carrying over from text to images, audio, code, and protein structure, which is why the transformer is now treated less as one model and more as a default substrate for sequence learning.
