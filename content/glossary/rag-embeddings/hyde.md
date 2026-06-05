---
title: Hypothetical Document Embeddings
slug: hyde
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: HyDE, hypothetical document embeddings
related: retrieval-augmented-generation, dense-retrieval, semantic-search, embedding-model, reranking
summary: A retrieval technique that asks a language model to draft a hypothetical answer to the query, then embeds that draft instead of the query, so the search vector sits in the same register as real documents and matches them more closely. The fabricated specifics do not matter, because the draft is only a search probe never shown to the user; its job is to point the retriever at the right neighborhood.
---

HyDE addresses a quiet mismatch in dense retrieval: a question and the passage that answers it are different kinds of text. A short query like "why do transformers need positional encoding" looks, as an embedding, rather unlike the explanatory paragraph that answers it, so a direct query-to-document vector comparison can miss good matches. HyDE sidesteps this by not searching with the query at all.

Instead, it first asks a language model to write a hypothetical document: a plausible answer to the query, the kind of passage that would satisfy it. That draft is then embedded, and the search runs with the draft's vector. Because the draft is written in the register and vocabulary of an actual answer, it lands near the real answers in embedding space, even though it was generated without any retrieval and may contain errors. The keeper is why that is fine: the fabricated specifics do not matter, because the draft is used only as a search probe and is never shown to the user; its job is to point the retriever at the right neighborhood.

The appeal is that this improves zero-shot retrieval with no fine-tuning of the embedding model, turning a capable generator into a better query encoder for free. It is especially useful when queries are terse or phrased very differently from the corpus.

The costs are a latency hit from the extra generation step and a dependence on the generator producing a draft that is at least topically right. When the model knows nothing about the subject, its hypothetical document can mislead the search, so HyDE is often paired with a reranking stage that re-scores the retrieved candidates against the true query.
