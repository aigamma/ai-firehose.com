---
title: Long Context
slug: long-context
kind: technique
category: Transformers and LLMs
aliases: long context, long-context window, extended context
related: context-window, kv-cache, sliding-window-attention, needle-in-a-haystack, flash-attention
summary: A model's ability to process and use very long inputs, from tens of thousands to millions of tokens, enabling whole-document and multi-document reasoning, while straining the quadratic cost of attention, the size of the KV cache, and the model's ability to actually attend across the full window.
---

Long context is the push to let a model take in far more at once: entire books, large codebases, long meeting transcripts, or many retrieved documents, rather than a few paragraphs. A large context window changes what is possible, allowing whole-document summarization, cross-referencing across a corpus in a single prompt, and agents that hold a long history, and it has become a headline capability that models compete on.

It is hard for three reasons. Attention is quadratic in sequence length, so doubling the context quadruples the compute of the naive mechanism. The KV cache grows linearly with length and quickly dominates memory during generation. And training data that genuinely requires reasoning over very long inputs is scarce, so models can have a long window without having learned to use it well. The techniques that make long context practical attack these: efficient and sliding-window attention and flash-attention for the compute, KV-cache compression for the memory, and position methods such as scaling rotary embeddings so the model generalizes to lengths beyond those it trained on.

A persistent honesty problem separates the advertised window from the effective one. A model rated for a million tokens may attend reliably only to part of it, with accuracy sagging for information buried in the middle, which is exactly what the needle-in-a-haystack test probes.

Long context also stands in an interesting relationship to retrieval-augmented generation. As windows grow, it is sometimes possible to simply put everything in the prompt instead of retrieving, but retrieval remains cheaper and often more precise, so in practice the two are complementary rather than one replacing the other.
