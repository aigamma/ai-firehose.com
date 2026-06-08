---
title: Continuous Batching
slug: continuous-batching
kind: technique
category: Systems and Infrastructure
aliases: continuous batching, in-flight batching, iteration-level scheduling
related: paged-attention, kv-cache, gpu, memory-bandwidth, speculative-decoding
summary: An LLM serving technique that adds and evicts requests from the running batch at every decoding step rather than waiting for a whole batch to finish, keeping the GPU saturated and sharply raising throughput under mixed-length workloads. By scheduling at the granularity of a single step it stops a short request from being held hostage to the slowest member of a static batch, and it pairs naturally with paged attention.
---

Continuous batching is the scheduling trick that makes large language model serving efficient. The naive approach, static batching, groups a fixed set of requests, runs them together until all are done, and only then starts the next batch; because generation lengths vary wildly, a batch where one request wants two thousand tokens and the rest want fifty will hold the whole batch hostage to the slowest member, leaving most of the GPU idle as finished sequences sit waiting.

Continuous batching, also called in-flight or iteration-level batching, schedules at the granularity of a single decoding step instead of a whole request. After each step it evicts any sequence that just finished and admits waiting requests into the freed slots, so the batch is constantly refilled, the GPU stays busy with useful work, and a short request is not stuck behind a long one. The result is a large gain in throughput and hardware utilization on realistic traffic, where prompt and output lengths are all over the map.

The technique leans on the kv-cache and pairs naturally with paged-attention, which manages that cache in fixed-size blocks like virtual memory. Paging lets the server pack many sequences of different lengths into GPU memory without reserving the worst case for each, which is what makes admitting and evicting requests every step practical, and together they are the core of modern inference servers.

There is a tension to manage between throughput and latency. Larger running batches raise tokens-per-second across all users but can lengthen any one user's time per token, and the prefill of a newly admitted long prompt can briefly stall ongoing decodes, so schedulers balance these with policies for how aggressively to admit new work, and the approach composes with further tricks such as speculative decoding.
