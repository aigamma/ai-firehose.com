---
title: Part-of-Speech Tagging
slug: part-of-speech-tagging
kind: technique
category: NLP Foundations
aliases: POS tagging, part of speech tagging
related: dependency-parsing, named-entity-recognition, conditional-random-field, sequence-to-sequence, n-gram-model
summary: The classic task of labeling each word with its grammatical category (noun, verb, adjective), a foundational preprocessing step that resolves syntactic ambiguity and feeds parsing and extraction. Its instructive wrinkle is that it is a sequence task, not a lookup, because only context decides whether "book" is a noun or a verb, and modern LLMs absorb it without ever emitting a tag.
---

Part-of-speech tagging assigns each word its grammatical role. It sounds trivial until you notice the ambiguity: "book" is a noun in "read a book" and a verb in "book a flight", and only context decides. A POS tagger resolves that ambiguity across a whole sentence, which is why it is a sequence task rather than a per-word lookup.

For decades it was a cornerstone of the NLP pipeline. Early taggers used hidden Markov models, then conditional random fields raised the state of the art by modeling how tags depend on their neighbors, and neural sequence models pushed accuracy higher still. The tags then fed everything downstream: dependency parsing needs to know what is a verb to find its subject, named-entity recognition leans on noun phrases, and information extraction uses the grammatical scaffold.

In the era of large language models, explicit POS tagging is less visible, because a model that writes fluent prose has clearly internalized grammatical structure without ever emitting a tag. The capability is absorbed rather than performed as a separate step, which is the telling part: the classic pipeline stage did not disappear so much as dissolve into the weights.

It remains foundational vocabulary, though, both as a building block in lighter-weight or interpretable pipelines where you want explicit linguistic structure, and as part of understanding how NLP worked before end-to-end neural models folded these classic stages into one learned system. Standard English tagging uses the Penn Treebank tagset of several dozen tags, and accuracy on clean newswire passed 97 percent long ago, close to the ceiling set by genuine human disagreement on the hard cases, which is part of why the task came to feel solved.
