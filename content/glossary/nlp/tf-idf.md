---
title: TF-IDF
slug: tf-idf
kind: technique
category: NLP Foundations
aliases: term frequency-inverse document frequency, tfidf
related: n-gram-model, word-embedding, word2vec, glove, named-entity-recognition
summary: A weighting scheme that scores how characteristic a term is of a document by multiplying how often it appears there by how rare it is across the whole collection, so words frequent here but rare elsewhere score high and ubiquitous words like "the" score near zero. Cheap, interpretable, and still a strong retrieval baseline, its blind spot is meaning: it treats synonyms as unrelated.
---

TF-IDF, term frequency-inverse document frequency, measures how characteristic a word is of a particular document within a larger collection. It predates neural methods and remains a staple of information retrieval and text mining, and its intuition is simple: a word matters to a document if it appears often in that document but seldom elsewhere, since words common everywhere, like "the" or "and", say little about what any one document is about.

The score is a product of two factors. Term frequency counts how often a term occurs in a document, often dampened by a logarithm so the tenth occurrence adds less than the second; inverse document frequency measures rarity across the collection, computed as the logarithm of the total number of documents divided by the number containing the term, so a term appearing in nearly every document gets a weight near zero while a term confined to a few gets a high weight. Multiplying the two gives a high score only to terms both frequent in the document and rare in the corpus.

TF-IDF matters because it gives a cheap, interpretable, and effective way to turn documents into vectors. Each document becomes a vector over the vocabulary with TF-IDF weights as entries, and the similarity between documents or between a query and a document is the cosine between their vectors. This bag-of-words representation, often combined with an n-gram model to capture short phrases, powered search engines and document classifiers for decades and is still a strong baseline.

Its defining weakness is simple: it knows nothing about meaning. Because it represents each word as an independent dimension, it cannot tell that "car" and "automobile" are related; synonyms are treated as unrelated, word order is discarded, and the vectors are sparse and high-dimensional. This is exactly the gap dense word embeddings such as word2vec and glove closed by placing related words near each other in a learned continuous space: where TF-IDF asks only whether the same surface string appears, embeddings ask whether words are used similarly.

TF-IDF sits at the start of the lineage that leads to the transformer era, representing the count-based, symbolic view of text. Its descendants moved from sparse term counts to dense learned vectors, and then from static vectors to the context-sensitive representations produced by self-attention in modern language models. Even so, TF-IDF endures as a baseline and as a component in retrieval pipelines, including hybrid systems that pair keyword scoring with neural embedding search.
