---
title: Chunking
slug: chunking
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: text splitting, passage segmentation
related: embedding-model, retrieval-augmented-generation, semantic-search, vector-database, reranking
summary: The step in a retrieval pipeline that splits long documents into smaller passages before embedding, so each stored vector represents a focused unit that can be retrieved and cited on its own. It quietly sets a ceiling on everything downstream: a fact split across two chunks may never surface as a strong match, and an over-broad chunk poisons the context with noise, so bad boundaries are unrecoverable later.
---

Chunking is the preprocessing step that cuts a document into passages before an embedding model turns each one into a vector. It exists because both ends of a retrieval pipeline have size limits. Embedding models accept only so many tokens per input and blur meaning when fed too much at once, and the language model that consumes retrieved passages has a finite context window. A whole article embedded as one vector averages many distinct ideas into a single muddy point; chunked into passages, each idea gets its own vector that can be matched and returned precisely.

The craft of chunking is choosing where to cut and how big each piece should be. Too large and a chunk dilutes its own meaning and wastes context budget on irrelevant text; too small and a passage loses the surrounding context needed to make sense, so a pronoun or a result floats free of its referent. Common strategies split on natural boundaries (paragraphs, headings, sentences) and add a small overlap between adjacent chunks so a fact straddling a boundary is not severed. More elaborate schemes are recursive (split by structure, then by size as a fallback) or semantic (cut where the topic shifts). The right chunk size depends on the documents and on the embedding model's input limits.

Chunking matters because it quietly sets a ceiling on retrieval quality. Every later stage (semantic search, reranking, the grounded answer in retrieval-augmented generation) can only work with the units chunking produced, and bad boundaries are unrecoverable downstream: a fact split across two chunks may never surface as a strong match, and an over-broad chunk pollutes the context with noise that can mislead the model. The chunk is also the natural unit of citation, so its boundaries decide how precisely a claim can be traced back to its source.

On this site, each ingested item (a transcript, a paper abstract, a post) is chunked before being embedded with voyage-3 and upserted into Pinecone. Each chunk is content-hashed, and its vector id is deterministic, derived from that hash, so a chunk whose text is unchanged is skipped on re-runs rather than re-embedded, and chunks that vanish from a source are pruned as orphans. Because the chunk is the retrievable, citable unit, the granularity chosen here is what lets the daily briefing and the Explore results trace every statement back to the specific passage it came from.
