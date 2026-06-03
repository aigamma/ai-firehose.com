---
title: word2vec
slug: word2vec
kind: technique
category: NLP Foundations
aliases: skip-gram, continuous bag of words, CBOW
related: word-embedding, glove, n-gram-model, tf-idf, masked-language-modeling, self-attention
summary: A family of shallow neural models, introduced at Google in 2013, that learns dense word embeddings by training a network to predict a word from its neighbors or its neighbors from a word.
---

word2vec is a method for learning word embeddings, dense vector representations of words, from a large unlabeled text corpus. Introduced by Tomas Mikolov and colleagues at Google in 2013, it popularized the idea that high-quality word vectors could be trained quickly at scale with a deliberately simple model. Rather than a deep network, word2vec uses a single hidden layer, and its efficiency is much of why word embeddings became ubiquitous so fast.

The method comes in two architectures. Skip-gram takes a target word and trains the network to predict the words in a surrounding context window, while continuous bag of words (CBOW) does the reverse, predicting the target word from the averaged context. In both cases the real product is not the prediction itself but the weight matrix the network learns: each row is the embedding for one word. The training objective is a proxy task whose only purpose is to force the model to encode useful structure into those vectors.

word2vec matters because it demonstrated, vividly, that the geometry of learned word space carries meaning. Its vectors made vector arithmetic for analogies famous, with relationships like capital-to-country or singular-to-plural showing up as roughly constant offset directions in the space. This was strong evidence for the distributional hypothesis, that a word's meaning can be inferred from the contexts it appears in, and it set the template that words should be represented as trainable points in a continuous space rather than as discrete symbols.

A practical innovation that made word2vec tractable was negative sampling. Computing a full softmax over a vocabulary of hundreds of thousands of words for every training step is expensive, so instead the model learns to distinguish a true context word from a handful of randomly drawn "negative" words. This turns an enormous multi-class problem into many cheap binary decisions, which is a recurring trick in representation learning. The companion method glove arrived around the same time and reached similar-quality vectors from global co-occurrence statistics rather than local prediction.

In the longer arc, word2vec sits one step before the transformer era. Its embeddings are static, one fixed vector per word regardless of sentence, so they cannot separate the two senses of a polysemous word. The drive to make embeddings context-sensitive led through sequence models to bert and the masked-language-modeling objective, where a word's representation finally depends on the full sentence. A modern large language model still embeds tokens into vectors as its first act, a direct descendant of the lookup table word2vec made standard.
