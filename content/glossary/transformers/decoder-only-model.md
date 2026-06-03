---
title: Decoder-Only Model
slug: decoder-only-model
kind: technique
category: Transformers and LLMs
aliases: decoder-only, decoder-only transformer, GPT-style
related: encoder-decoder, causal-attention, large-language-model, next-token-prediction, transformer
summary: A transformer that uses only the decoder stack with causal, left-to-right attention, processing the prompt and the generated text as one continuous sequence; the architecture of essentially every modern large language model.
---

A decoder-only model is a transformer stripped to a single stack that attends causally, meaning each token can see only the tokens before it. There is no separate encoder and no cross-attention. The prompt and the model's own output live in one continuous sequence, and the model does exactly one thing: predict the next token given everything so far. It is the architecture behind the GPT family and nearly every current large language model.

Its dominance was not obvious in advance. Encoder-decoder and encoder-only designs came first, but the decoder-only setup proved to scale the best and to be the simplest: a single objective, next-token prediction, applied uniformly to all text, with no architectural distinction between understanding the input and producing the output. In-context learning falls out naturally, because the prompt is just earlier tokens in the same sequence the model continues, and the uniform causal structure trains efficiently and scales cleanly with parameters and data.

The contrast clarifies it. An encoder-decoder separates a bidirectional reading of the input from autoregressive generation; a decoder-only model has only the autoregressive half, treating the input as prefix tokens. An encoder-only model like BERT has only the bidirectional half, good for understanding but not generation.

The causal attention that defines it is also what makes the kv-cache possible, since past tokens' keys and values never change, and it is why these models are inherently autoregressive, generating strictly left to right.
