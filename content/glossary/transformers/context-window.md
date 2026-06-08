---
title: Context Window
slug: context-window
kind: technique
category: Transformers and LLMs
aliases: context length, context size, sequence length
related: self-attention, kv-cache, positional-encoding, tokenization, large-language-model, multi-head-attention
summary: The maximum number of tokens a language model can attend to at once, its working memory: everything it reasons over must fit inside or it is invisible. Quadratic attention is why the window is bounded and why longer is expensive, and even huge windows carry a soft caveat, models attend unevenly and recall the middle of a long context worse than the ends.
---

The context window is the span of tokens a language model can consider at one time, its working memory: everything it is currently reasoning over, the prompt, any retrieved documents, the conversation so far, and the text it is generating, must fit inside this window or it simply is not visible to the model. A model with an eight-thousand-token window cannot see the nine-thousandth token, no matter how relevant. Because the window is measured in tokens, its real capacity depends on tokenization, and the same passage consumes different amounts of it in different languages.

The window exists because self-attention compares every token with every other, which makes the compute and memory of an attention layer grow quadratically with sequence length: double the length and you roughly quadruple the attention cost. That scaling is what makes a longer context expensive rather than free, and the central reason a limit is imposed at all. The kv-cache softens the cost during generation by storing the keys and values of past tokens so each new token does not reprocess the whole history, but the cache itself grows linearly with the window and can dominate memory for long sequences.

A second, subtler limit is positional. A model only practices with positions up to its training length, so its positional encoding has never represented anything beyond that, and behavior can degrade when inputs run longer. Much of the engineering behind extending context, interpolating or rescaling the position signal and methods built on rotary position embedding, is really about stretching the positional scheme so the model stays coherent at lengths it never trained on.

The context window shapes how systems are built around a model. Retrieval-augmented generation exists largely to work within a finite window, fetching only the most relevant passages instead of dumping an entire corpus into the prompt. Even as windows grow to hundreds of thousands or millions of tokens, two caveats remain, and together they are the binding constraint: cost and latency rise with how much of the window is filled, and models often attend unevenly across a very long context, recalling the beginning and end more reliably than the middle. The context window is therefore both a hard capacity limit and a soft quality gradient.
