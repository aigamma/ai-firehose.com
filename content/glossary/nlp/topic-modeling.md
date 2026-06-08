---
title: Topic Modeling
slug: topic-modeling
kind: technique
category: NLP Foundations
aliases: topic modeling, LDA, latent Dirichlet allocation
related: tf-idf, word-embedding, unsupervised-learning, semantic-search
summary: An unsupervised technique that discovers the latent themes running through a collection of documents, representing each document as a mixture of topics and each topic as a distribution over words, with Latent Dirichlet Allocation the classic method. Its modern descendant clusters embeddings instead of counts, and it is a direct cousin of this project's AI-grown taxonomy.
---

Topic modeling finds the hidden themes in a pile of documents without anyone labeling them. It rests on two linked ideas: each topic is a probability distribution over words (a "sports" topic puts weight on game, team, score), and each document is a mixture of topics in some proportion. Fitting the model to a corpus recovers both, so you learn what the themes are and how much of each theme each document contains, all unsupervised.

The classic method is Latent Dirichlet Allocation, a generative Bayesian model that imagines each document being written by repeatedly picking a topic from its mixture and then a word from that topic, and then infers the topic structure that best explains the observed text. For years it was the standard way to explore and organize large unlabeled corpora, surface trends, and build features for downstream tasks. In practice it demands two awkward choices: you fix the number of topics in advance, and you interpret each topic by reading its top words, where a coherent-looking list is not guaranteed to name a real theme.

The modern descendant uses embeddings instead of word counts: cluster documents or sentences in a semantic embedding space and label the clusters, the approach behind tools like BERTopic, which captures meaning that bag-of-words LDA misses because it understands that synonyms belong together.

This project's AI-grown taxonomy is a cousin of topic modeling, and that kinship is the point: it clusters concepts by embedding similarity to discover the themes of the corpus rather than imposing a fixed vocabulary, the same instinct that everything interesting in a collection of text is a latent structure waiting to be found.
