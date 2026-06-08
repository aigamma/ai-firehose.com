---
title: Knowledge Graph
slug: knowledge-graph
kind: tool
category: RAG, Embeddings, and Retrieval
aliases: knowledge graphs, KG
related: graph-rag, retrieval-augmented-generation, knowledge-bases, semantic-search, vector-database, embedding-model
summary: A structured representation of knowledge as entities and the labeled relationships between them, a network of facts rather than a pile of documents. In AI it grounds retrieval with explicit connections, letting a system traverse from one fact to a related one, which is what multi-hop questions need and a flat vector store cannot do.
---

A vector store treats a corpus as a bag of independent chunks: it finds the passage most similar to a query but knows nothing about how passages relate. Many real questions are not "find the chunk about X" but "find X, then find what connects it to Y", and that needs structure the chunks do not carry. A knowledge graph supplies it, recording the corpus as entities (people, products, concepts) joined by labeled edges (works-at, depends-on, causes), so the relationships are first-class data rather than something re-inferred from prose on every query.

Building one means extracting entities and relations from text, increasingly with a language model that reads each document and emits structured triples, then merging mentions of the same entity into a single node. Querying it means traversing edges, following a chain of relationships to assemble an answer or aggregating a neighborhood. The design tension is precision against coverage: a hand-curated graph is accurate but narrow and costly to maintain, while an LLM-extracted graph scales but inherits the model's extraction errors, so edges can be wrong, missing, or duplicated.

What a knowledge graph buys is the connections that similarity search throws away. Asked which of an author's collaborators also worked on safety, a vector store returns passages that merely sound relevant, while a graph walks the collaborator edges and filters, returning an answer with a traceable path. This is why GraphRAG pairs the two: embeddings find entry points by meaning, and the graph chains them by relation, which is the part flat retrieval cannot reconstruct.

The cost is real, since building and maintaining a graph is far more work than dropping documents into an index, so it earns its place only where the questions are genuinely relational or where an explicit, auditable reasoning path matters. The deeper point is that retrieval quality is bounded by the structure imposed before querying: a knowledge graph is a bet that some of the reasoning is better baked into the data once than left for the model to redo on every question.
