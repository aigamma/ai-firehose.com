---
title: Next-Token Prediction
slug: next-token-prediction
kind: technique
category: Transformers and LLMs
aliases: next token prediction, autoregressive generation, causal language modeling
related: large-language-model, transformer, tokenization, kv-cache, scaling-laws, context-window
summary: The objective almost every modern language model is built on: given a sequence of tokens, predict the next one. Its power is its generality, framing translation, summarization, and question answering all as "predict the next token given this context", which is what lets one trained model do so many tasks, and its honesty about probability rather than truth is the root of hallucination.
---

Next-token prediction is the objective that almost every modern language model is built on. The task is deceptively simple: given a sequence of tokens, predict the one that comes next. During training the model is shown enormous amounts of real text and asked, at every position, to assign a probability distribution over the whole vocabulary for the following token, and it is rewarded for putting high probability on the token that actually appeared. Repeated across trillions of tokens, this single objective is enough to teach a model grammar, facts, reasoning patterns, and style, which is why it sits at the heart of every large language model.

The mechanism rests on a chain-rule factorization of probability. The likelihood of an entire passage equals the product, over each position, of the probability of that token given everything before it, so a model that estimates each of those conditional probabilities well has implicitly modeled the joint distribution of language. This is why next-token prediction is also called causal or autoregressive language modeling: every token is conditioned only on its past, never its future, which a transformer enforces with a causal mask that prevents a position from attending to tokens that come after it.

Generation runs the same machinery forward. The model takes the prompt, predicts a distribution for the next token, selects one (by greedy choice, or by sampling with controls like temperature and top-p), appends it to the sequence, and repeats, so the output is built one token at a time, each produced token becoming part of the input for the next step. Because the early tokens never change once chosen, the keys and values of past tokens can be stored in the kv-cache, which keeps step-by-step generation efficient instead of quadratic in length.

This objective explains much of how these models behave. They are optimized to produce plausible continuations, not to verify truth, which is the root reason they can hallucinate, stating false claims as fluently as true ones; their abilities scale smoothly with size and data because the next-token loss is exactly what the scaling laws track; and the framing is remarkably general, since posing translation, summarization, question answering, and even tool use as "predict the next token given this context" is what lets one trained model perform so many tasks without task-specific heads, working entirely within its context window.
