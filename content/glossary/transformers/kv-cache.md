---
title: KV Cache
slug: kv-cache
kind: technique
category: Transformers and LLMs
aliases: key-value cache, KV caching
related: self-attention, multi-head-attention, context-window, large-language-model, next-token-prediction
summary: An inference optimization that stores the key and value vectors of already-processed tokens so a generating transformer never recomputes them, turning each step from growing-with-length down to roughly constant. The price is memory: the cache grows linearly with the sequence and can exceed the model weights, which is the pressure behind multi-query and grouped-query attention.
---

The kv-cache is the optimization that makes transformer text generation practical. Language models generate one token at a time, and each new token attends back over every token before it, so without caching, producing the hundredth token would require recomputing the attention keys and values for the previous ninety-nine, and the thousandth would redo nearly a thousand, the total work growing with the square of the output length. The kv-cache removes this waste by remembering what was already computed.

The insight is that in a decoder-only transformer, the key and value vectors a token produces never change once that token is fixed, because each position only attends to itself and earlier positions. So during generation the model computes the key and value for each new token exactly once and stores them in a per-layer, per-head buffer, and to produce the next token it only needs that single new token's query, compared against the cached keys and values of the whole history. This turns the cost of each generation step from growing with sequence length down to roughly constant per step, the difference between usable and unusable latency for long outputs.

The cost of this speedup is memory. The cache holds key and value vectors for every layer, every attention head, and every token in the context, so its size grows linearly with the sequence and can come to dominate the memory footprint of serving a model, often exceeding the size of the model weights themselves for long contexts. This pressure is exactly why architectural variants like multi-query attention and grouped-query attention exist: by sharing keys and values across heads they shrink the cache dramatically while barely affecting quality, and techniques like paged attention manage the cache memory more efficiently across many simultaneous requests.

The kv-cache also frames how generation is discussed in practice. The initial pass that processes the prompt and fills the cache is the prefill phase, compute-bound because it handles many tokens at once; the token-by-token generation that follows is the decode phase, memory-bound because each step does little compute but must read the entire growing cache. Because the cache scales with the context window, it is one of the concrete reasons longer contexts cost more, and managing it well is central to efficient large language model serving.
