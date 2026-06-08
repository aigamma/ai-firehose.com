---
title: N-Gram Model
slug: n-gram-model
kind: technique
category: NLP Foundations
aliases: n-gram, language model n-gram, bigram model, trigram model
related: tf-idf, word-embedding, word2vec, masked-language-modeling, large-language-model, self-attention
summary: A statistical language model that estimates the next word from only the previous few, counting short word sequences in a corpus under a Markov approximation. Its defining flaw is a short, fixed memory, raising n to see further makes the counts explode and go sparse, and it is the direct conceptual ancestor of the modern LLM, a vastly more capable answer to the same question: what word comes next.
---

An n-gram model estimates the probability of a word given the words immediately before it. An n-gram is a contiguous run of n items, usually words, a bigram a pair, a trigram a triple, and the model assumes a Markov approximation: that the next word depends only on a short fixed window of preceding words rather than the entire history, which makes the probabilities tractable to count and store.

Training is mostly counting. To estimate the chance that "mat" follows "the cat sat on the", a trigram model looks only at the last two words, "on the", and divides the number of times "on the mat" appeared by the number of times "on the" appeared in the corpus. Because many valid sequences never occur in any finite corpus, raw counts assign zero probability to unseen n-grams, so practical systems apply smoothing, which shifts a little probability mass to unseen events, and backoff, which falls back to shorter n-grams when a longer one is unobserved.

N-gram models were the backbone of language technology for decades, driving speech recognition, machine translation, spelling correction, and predictive text keyboards. They are fast, transparent, and need no specialized hardware, and a well-smoothed n-gram model remains a respectable baseline, pairing naturally with count-based document methods like tf-idf where n-grams capture short phrases that single words miss.

The defining weakness is plain: its short, fixed memory. Raising n to capture longer dependencies makes the number of possible sequences explode and the counts grow hopelessly sparse, a manifestation of the curse of dimensionality, so in practice n rarely exceeds four or five. The model therefore cannot connect a pronoun to an antecedent ten words back, nor track the subject of a long sentence, and it treats words as discrete symbols with no notion that "dog" and "puppy" are related, the same gap word embeddings like word2vec later addressed.

The n-gram model is the direct conceptual ancestor of modern neural language models. Both assign probabilities to word sequences; the difference is how they represent context. Neural models replaced sparse symbol counts with learned dense vectors and, with the transformer, replaced the fixed Markov window with self-attention that can reach across an entire passage. A large language model is, at bottom, a vastly more capable answer to the same question the n-gram model first posed: what word comes next.
