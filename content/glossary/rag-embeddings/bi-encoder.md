---
title: Bi-Encoder
slug: bi-encoder
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: bi encoder, dual encoder, two-tower model
related: cross-encoder, dense-retrieval, embedding-model, semantic-search, approximate-nearest-neighbor, contrastive-learning
summary: A retrieval architecture that encodes a query and a document independently into separate vectors and scores relevance by a simple similarity between them, which is what makes document embeddings precomputable and indexable, enabling fast search over a large corpus. That independence is the whole point and the whole trade: it gives up the direct query-document interaction a cross-encoder keeps, in exchange for corpus-scale speed.
---

A bi-encoder is the architecture that makes dense retrieval scale. It uses an encoder, typically a transformer, to map a query into one vector and each document into its own vector entirely separately, with no interaction between the two texts during encoding. Relevance is then a cheap operation between the finished vectors, usually a dot product or cosine similarity. Because the two inputs travel down two parallel towers that never meet until the final comparison, the design is also called a dual encoder or two-tower model.

That independence is the whole point, the keeper. Since a document's vector does not depend on any query, every document in a corpus can be embedded once, ahead of time, and stored in a vector database; at query time only the query is encoded, and finding the best matches becomes a nearest-neighbor search over the precomputed vectors, made fast by approximate nearest neighbor indexes. This is what lets a bi-encoder shortlist relevant passages from millions of documents in milliseconds, the property ordinary embedding-model retrieval depends on.

The contrast is with the cross-encoder, which feeds the query and a document into the model together so attention can run across both. A cross-encoder is more accurate because the query and document interact directly, but it must run the full model for every query-document pair and can precompute nothing, so it cannot scan a large corpus. The bi-encoder makes the opposite trade: by encoding in isolation it gives up some accuracy, because the query never gets to shape how the document is read, in exchange for the indexability that makes corpus-scale search feasible.

The two are complementary, which is why production retrieval usually stacks them: a fast bi-encoder retrieves a shortlist by vector similarity, then a cross-encoder reranks just that shortlist for precision. Bi-encoders are trained to make this work with contrastive learning, pulling a query and its relevant documents close in the vector space while pushing irrelevant ones away, often using hard negatives so the learned similarity actually separates near-misses from true matches.
