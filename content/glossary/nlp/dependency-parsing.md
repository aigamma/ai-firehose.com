---
title: Dependency Parsing
slug: dependency-parsing
kind: technique
category: NLP Foundations
aliases: dependency parser, syntactic parsing, dependency tree
related: named-entity-recognition, word-embedding, bert, n-gram-model, self-attention
summary: A syntactic analysis that links each word to the word it depends on, producing a tree of labeled head-and-dependent relations, "cat" attaches to "chased" as its subject. The relations it exposes sit close to meaning, and there is a striking echo in transformers: some attention heads recover dependency-like structure on their own, never having been told to.
---

Dependency parsing uncovers the grammatical structure of a sentence by identifying, for each word, which other word it modifies or attaches to, and how. The output is a dependency tree: every word points to a single head, the main verb typically serving as the root, and each link carries a label naming the relation, like subject, direct object, or modifier. In "the cat chased the mouse", "chased" is the root, "cat" attaches to it as the subject, and "mouse" attaches as the object. This contrasts with constituency parsing, which instead groups words into nested phrases.

It matters because the relations it exposes are close to meaning. Knowing which noun is the subject and which the object, or which adjective modifies which noun, gives a structured skeleton downstream tasks build on. It supports relation extraction, where the path between two entities in the tree signals how they are related, and it strengthens named-entity recognition by clarifying a span's grammatical role. Because dependency links connect words that may be far apart in linear order, the structure captures long-range grammatical relationships that a flat reading of the sentence obscures.

Mechanically, parsers come in two broad families. Transition-based parsers read the sentence left to right and make a sequence of incremental decisions, shift a word or attach one word to another, building the tree in linear time, much like assembling structure on a stack; graph-based parsers instead score all possible head-and-dependent links and search for the highest-scoring tree that remains well formed. Both historically relied on features like part-of-speech tags and word identities, and both must respect the constraint that the result is a valid tree with each word having exactly one head.

The quality of parsers climbed substantially once they were fed learned representations, but the most telling result is an echo, not a metric: dense word embeddings like word2vec replaced brittle sparse features, the contextual embeddings from models like bert pushed accuracy higher still, and analyses of trained transformers have found attention heads whose patterns resemble grammatical dependencies, suggesting the models recover syntax-like structure on their own without ever being told to.

In the broader arc toward modern NLP, dependency parsing represents the explicit, linguistically grounded view of sentence structure. Classic pipelines computed a parse and handed the tree to later components, whereas large neural models trained on raw text often capture much of the same structure implicitly, without a separate parsing step. Parsing nonetheless remains valuable where interpretable, explicit grammatical relations are needed, and it is a long-standing benchmark for how well a system understands the form of language rather than just its surface words.
