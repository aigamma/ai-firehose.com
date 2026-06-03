---
title: Word Embedding
slug: word-embedding
kind: technique
category: NLP Foundations
aliases: word vector, distributed word representation, embedding vector
related: word2vec, glove, tf-idf, n-gram-model, self-attention, large-language-model
summary: A representation of a word as a dense vector of real numbers, learned so that words used in similar contexts land near each other in the vector space, replacing sparse symbolic word identities with continuous geometry.
---

A word embedding maps each word to a fixed-length vector of real numbers, typically a few hundred dimensions, positioned so that words with similar meanings or usage sit close together. The premise is the distributional hypothesis: a word is characterized by the company it keeps, so words that appear in similar contexts should have similar representations. Replacing a discrete symbol such as "dog" with a point in a continuous space lets a model reason about meaning by geometry, measuring similarity as distance or cosine angle rather than as exact string equality.

Word embeddings matter because they solved a basic obstacle in early natural language processing. Treating words as atomic symbols, a one-hot vector with a single 1 in a vocabulary-sized slot, gives every pair of distinct words the same zero similarity; "cat" is no closer to "dog" than to "thermodynamics". That sparse, high-dimensional encoding wastes parameters and forces a model to relearn every word from scratch. Dense embeddings instead share statistical strength across related words, so a pattern learned for one word transfers to its neighbors, which is why they became the standard input layer for nearly every neural NLP system.

The vectors are learned from large text corpora by predicting context. The two dominant recipes are word2vec, which trains a shallow network to predict surrounding words from a target word or the reverse, and glove, which factorizes a matrix of global co-occurrence counts. Both yield a lookup table from word to vector, and both surface the now-famous property that simple vector arithmetic captures analogies, with the vector for "king" minus "man" plus "woman" landing near "queen". The geometry encodes semantic and syntactic relationships that no one programmed by hand.

A key limitation of these classic embeddings is that they are static: each word gets exactly one vector regardless of context, so the single "bank" vector blends the riverbank and the financial senses into one compromise point. This is why they are sometimes called context-free embeddings. The next generation, contextual embeddings produced by models like bert, computes a different vector for each occurrence of a word based on the sentence around it, resolving the polysemy that static embeddings cannot.

Word embeddings are the conceptual seed of the transformer era. The idea that meaning lives in a learned continuous space, that nearness encodes relatedness, and that representations should be trained from raw text rather than engineered, carries directly into modern systems. A large language model still begins by embedding tokens into vectors; what changed is that self-attention now reshapes those vectors layer by layer so they become context-aware, turning the static dictionary of early embeddings into a dynamic, sentence-sensitive representation.
