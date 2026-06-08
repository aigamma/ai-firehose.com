---
title: Masked Language Modeling
slug: masked-language-modeling
kind: technique
category: NLP Foundations
aliases: MLM, masked LM, cloze pretraining
related: bert, self-attention, word-embedding, word2vec, n-gram-model, large-language-model
summary: A self-supervised pretraining objective that hides a fraction of a text's tokens and trains a model to predict them from both sides of the surrounding context, producing deeply bidirectional representations. A modern cloze task whose labels come free from the text, it unlocked context that left-to-right models cannot see, at the cost of not being a natural generator.
---

Masked language modeling (MLM) hides part of a text and asks a model to fill in the blanks. Some of the input tokens are replaced with a special mask symbol and the model is trained to recover the originals, and it is self-supervised: the labels come for free from the text itself, since the answer is simply the word that was hidden, so MLM can learn from any quantity of raw unlabeled text. It is the objective that powered bert and the broad family of encoder models that followed.

The mechanism is a modern take on the classic cloze task. A common recipe masks roughly fifteen percent of the tokens in each sequence, and the model must predict each masked token using the full surrounding context, the words to its left and to its right simultaneously. To reduce a mismatch between pretraining, where masks appear, and fine-tuning, where they do not, the masked positions are sometimes replaced with a random word or left unchanged rather than always shown as the mask symbol, and the training signal is the prediction error on the masked positions only.

MLM matters because it unlocked deep bidirectional context. A traditional left-to-right language model, and its statistical ancestor the n-gram model, predicts the next word from preceding words alone, so a word's representation never sees what comes after it; by hiding interior tokens and revealing both sides, MLM forces the model to fuse left and right context into each representation, which is why models trained this way produce contextual embeddings that resolve word senses static methods like word2vec leave ambiguous. The objective relies on self-attention to let every position gather information from every other.

A trade-off comes with the bidirectionality, and it is a real one. Because MLM lets the model see both sides, a model trained purely this way is naturally an encoder for understanding rather than a generator, since fluent left-to-right generation requires never seeing the future. This is the core difference between MLM models and the causal, next-token objective that drives the generative large language model lineage: MLM for rich representation and extraction, causal modeling for open-ended text production.

In the development of the transformer era, masked language modeling was a pivotal step. It showed that a single, simple, self-supervised objective on enough text could yield general-purpose representations that transfer to many downstream tasks with light fine-tuning, the pretrain-then-adapt paradigm that now dominates NLP. The objective remains widely used wherever the goal is to understand and label text, including upstream of tasks such as named-entity recognition and sentence classification.
