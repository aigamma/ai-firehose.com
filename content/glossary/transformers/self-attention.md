---
title: Self-Attention
slug: self-attention
kind: technique
category: Transformers and LLMs
aliases: scaled dot-product attention, self attention
related: attention-mechanism, multi-head-attention, transformer, positional-encoding, kv-cache, large-language-model
summary: The mechanism that lets every token in a sequence look at every other and gather information weighted by learned relevance, computing each token's representation as a content-determined weighted sum over the whole sequence. It is permutation-invariant, so order must be added back separately, and fully parallel, the property that let transformers scale.
---

Self-attention lets each token in a sequence look at every other and decide how much each one matters for the meaning at hand. The word "bank" attends differently when "river" is nearby than when "money" is, and self-attention is what lets the model resolve that from context. It is the core operation of the transformer, the architecture behind nearly every modern large language model, and the reason these models handle context so well.

The mechanism projects each token into three vectors: a query, a key, and a value. To compute the new representation of a token, the model takes that token's query and compares it against the keys of all tokens by a dot product, producing a score for each pair; the scores are scaled and passed through a softmax to become weights that sum to one, and the output is the weighted sum of the value vectors. A token whose key aligns with the query contributes strongly; one that does not is largely ignored. The scaling by the square root of the key dimension, which gives "scaled dot-product attention" its name, keeps the scores from growing so large that the softmax saturates.

Two properties define what self-attention is and is not. It is permutation invariant: shuffle the tokens and the raw mechanism gives the same answer, because it has no built-in sense of order, so sequence order has to be restored separately through positional encoding. And it is fully parallel across positions, unlike a recurrent neural network that must process tokens one after another, which is exactly the property that let transformers scale to enormous data and parameter counts.

In practice the model runs several attention computations in parallel, multi-head attention, so different heads can specialize in different relationships such as syntax, coreference, or long-range topic. The cost is that comparing every token with every other is quadratic in sequence length, the central bottleneck the context window confronts and which the kv-cache and a long line of efficient-attention variants try to relieve.
