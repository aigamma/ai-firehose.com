---
title: Cross-Attention
slug: cross-attention
kind: technique
category: Transformers and LLMs
aliases: cross attention, encoder-decoder attention
related: self-attention, attention-mechanism, multi-head-attention, transformer, sequence-to-sequence, positional-encoding
summary: Attention in which the queries come from one sequence while the keys and values come from another, letting a model condition its output on a separate input such as a source sentence, an image, or retrieved text.
---

Cross-attention is the counterpart to self-attention. In self-attention, the queries, keys, and values all come from the same sequence, so each token gathers information from its neighbors. In cross-attention, the queries come from one sequence and the keys and values come from a different one. This is the mechanism by which a model lets its output attend to a separate input.

The original transformer, built for machine translation, used cross-attention to connect its two halves. The encoder read the source sentence into a set of key and value vectors, and each step of the decoder issued queries against them, so the word being generated could look back at the most relevant parts of the source. This is why cross-attention is sometimes called encoder-decoder attention. The same pattern drives any sequence-to-sequence task where output must be grounded in a distinct input.

Mechanically it is identical to scaled dot-product attention: queries and keys are compared, scaled, softmaxed into weights, and used to take a weighted sum of values. The only difference is where the three come from. That small change is powerful because it makes attention a general bridge between modalities and sources. A vision-language model uses cross-attention so generated text can attend to image features, and retrieval-augmented systems can fold fetched documents into generation the same way.

Decoder-only large language models mostly drop the separate encoder and rely on self-attention over one long concatenated sequence, so explicit cross-attention is less visible than it once was. It remains central to encoder-decoder architectures, diffusion models that condition image generation on a text prompt, and any design that must keep two information streams distinct while letting one inform the other.
