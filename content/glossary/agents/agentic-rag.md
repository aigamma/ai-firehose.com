---
title: Agentic RAG
slug: agentic-rag
kind: technique
category: Agents and Tool Use
aliases: agentic RAG, agentic retrieval
related: retrieval-augmented-generation, ai-agent, tool-use, reranking, hyde
summary: Retrieval-augmented generation driven by an agent that decides when and what to retrieve, issues multiple queries, evaluates the results, and iterates, rather than a single fixed retrieve-then-generate step. By treating retrieval as a tool to be used deliberately, not a mandatory first step, it handles multi-hop reasoning ("find X, then use X to find Y") and exploratory questions a single shot cannot.
---

Agentic RAG puts an agent in charge of retrieval. Ordinary retrieval-augmented generation is a fixed pipeline: take the query, retrieve some passages, generate an answer. That works when the answer sits in one place and the first retrieval finds it, but it breaks on questions that need several pieces of evidence chained together, or where the right search query is not the user's literal wording. Agentic RAG replaces the fixed pipeline with a loop the model controls.

In that loop the agent can decide whether retrieval is even needed, reformulate or decompose the question into sub-queries, issue multiple searches, judge whether the results are sufficient, retrieve again with refined queries, and only then synthesize an answer. The keeper is the reframing: it treats retrieval as a tool to be used deliberately rather than a mandatory first step, which is what lets it handle multi-hop reasoning ("find X, then use X to find Y") and exploratory questions that a single shot cannot.

The cost is more model calls and higher latency, since each retrieval-reason-retrieve cycle is another round trip, so agentic RAG is reserved for questions whose difficulty justifies the extra work rather than simple lookups.

It composes with the rest of the retrieval toolkit: the agent's individual searches still benefit from good embeddings, reranking, and query-rewriting tricks like hypothetical document embeddings, and it blends naturally with other tools, letting the same agent search, browse, and compute as one workflow.
