---
title: Latent Semantic Analysis
slug: latent-semantic-analysis
kind: technique
category: NLP Foundations
aliases: LSA, latent semantic indexing, LSI
related: tf-idf, singular-value-decomposition, topic-modeling, word-embedding, dimensionality-reduction, bag-of-words
summary: An early method that uncovers latent topics by applying singular value decomposition to a term-document matrix, mapping words and documents into one shared low-dimensional semantic space. Its payoff is attacking synonymy, two documents that share no words can still land close if they use linked synonyms, and it is the linear, count-based ancestor of the word embedding.
---

Latent semantic analysis, or LSA, extracts the hidden topical structure of a document collection and measures semantic similarity between words and texts. Introduced in the late 1980s, it was one of the first methods to give words continuous, distributed representations derived from how they co-occur, anticipating by decades the embedding ideas that now dominate the field (applied to indexing and search it is also called latent semantic indexing). Its premise is that the words in a corpus reflect a smaller set of underlying concepts, and that those concepts can be recovered by linear algebra.

The mechanism starts from a large term-document matrix, where each row is a vocabulary word, each column a document, and each entry records how often the word appears in that document, usually reweighted by tf-idf so distinctive words count for more. This matrix is enormous and sparse, and treats every word as unrelated to every other; LSA applies singular value decomposition to it and keeps only the largest singular values, a form of dimensionality reduction that compresses the matrix into a small number of latent dimensions. Each retained dimension behaves like a topic, a direction along which sets of related words and documents vary together, and every word and document is now a short dense vector in this shared latent space.

The payoff of that compression is the keeper: it exposes meaning the raw counts hide. Two documents that share no words can still land close together if they use synonyms the latent dimensions have linked, which directly attacks the synonymy problem that defeats literal keyword matching. Likewise words occurring in similar contexts acquire similar vectors, so LSA yields a usable, if coarse, notion of semantic similarity, and because words and documents live in the same space, a query can be projected into it and compared against documents by cosine similarity, which is what made LSA an effective information-retrieval method in its day.

Latent semantic analysis matters as a conceptual ancestor of much that followed. It is a linear, count-based forerunner of topic modeling, with later probabilistic methods like latent Dirichlet allocation offering a generative alternative to its algebraic factorization, and its core insight, that words can be placed as points in a low-dimensional semantic space learned from co-occurrence, is exactly the insight word embedding methods like word2vec and glove later realized with neural training and at far larger scale. LSA is rarely the best tool today, but it is historically pivotal and remains a clean illustration of how factorizing a co-occurrence matrix can turn raw text statistics into something that behaves like meaning.
