---
title: Semantic Search
slug: semantic-search
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: vector search, neural search, similarity search
related: embedding-model, vector-database, dense-retrieval, sparse-retrieval, hybrid-search, reranking, retrieval-augmented-generation
summary: Search that ranks results by meaning rather than literal word overlap, by embedding the query and the documents into the same vector space and returning the documents whose vectors sit nearest the query.
---

Semantic search retrieves documents by what they mean, not by which exact words they contain. Classic keyword search matches tokens: a query for "car" misses a document that only says "automobile", and a query for "how to stop a model overfitting" is scattered across whichever literal words happen to appear. Semantic search sidesteps this by mapping both the query and every document into a shared vector space with an embedding model, then ranking documents by geometric closeness to the query. Synonyms, paraphrases, and conceptually related phrasings land near each other, so meaning is matched even when vocabulary differs.

Mechanically it is the read path of an embedding pipeline. Documents are embedded once and stored in a vector database. At query time the question is embedded with the same model, the database finds the nearest vectors using approximate nearest neighbor search, and the closest documents come back ranked by a distance metric, typically cosine similarity. Because the heavy lifting (embedding the corpus) happens ahead of time, each query costs one embedding call plus a fast index lookup. This embed-based approach is called dense retrieval, in contrast to the sparse retrieval of keyword engines.

Semantic search matters because it is the retrieval half of retrieval-augmented generation and a capable search surface in its own right. It excels at recall over vocabulary mismatch and at fuzzy, intent-shaped questions where the user cannot name the exact term. Its weakness is the mirror image: it can drift on queries that hinge on a precise identifier, a rare proper noun, or an exact code symbol, where literal matching is what you actually want. That gap is why production systems often combine it with keyword scoring in hybrid search, and why a reranking pass is frequently added to sharpen the final order.

The Explore page on this site is a semantic search surface. A query is embedded with voyage-3, matched against the Pinecone index of corpus chunks, and the shortlist is reordered by a rerank-2 reranking model before display, all through one lightweight Netlify read function with no chatbot attached. The same nearest-neighbor machinery, run document-to-document instead of query-to-document, also produces the neighbor links between concepts and the related-items lists, showing that semantic search is less a single feature than the basic operation the whole site is built on.
