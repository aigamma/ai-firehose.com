---
title: GraphRAG
slug: graph-rag
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: graph rag, graph-based retrieval
related: retrieval-augmented-generation, graph-neural-network, chunking, dense-retrieval, reranking
summary: A retrieval-augmented generation approach that builds a knowledge graph of entities and relationships from a corpus, then retrieves and summarizes connected subgraphs, so a model can answer global, multi-hop questions that flat chunk retrieval misses.
---

GraphRAG is a response to where ordinary retrieval-augmented generation is weakest. Standard RAG splits a corpus into chunks, embeds them, and retrieves the few most similar to a query. That works for questions whose answer sits in one place, but it struggles with two kinds of question: multi-hop questions whose answer must be assembled from facts scattered across many documents, and global questions like "what are the main themes in this corpus" that no single chunk contains.

GraphRAG restructures the corpus before querying. A model extracts entities and the relationships between them from the text, assembling a knowledge graph, and then community-detection algorithms cluster that graph into groups of densely related nodes. Each community is summarized in advance. At query time, retrieval happens over this structure: the system can traverse relationships to chain facts together for multi-hop questions, or aggregate the community summaries to answer global ones. The graph supplies the connective structure that a bag of independent chunks lacks.

The cost is paid up front and is substantial. Building the graph means many model calls to extract entities and relations and to write the summaries across the whole corpus, which is far more expensive than simply embedding chunks. So GraphRAG suits corpora that are queried repeatedly and where structure and sensemaking matter, not one-off lookups.

It is best seen as a complement to vector retrieval rather than a replacement: many systems keep dense chunk retrieval for local, specific questions and reach for the graph when a query needs breadth or multiple hops, sometimes combining both and reranking the merged results.
