---
title: Prefill and Decode
slug: prefill-and-decode
kind: technique
category: Inference and Sampling
aliases: prefill phase, decode phase, prompt processing, prefill-decode
related: kv-cache, continuous-batching, paged-attention, flash-attention, memory-bandwidth, speculative-decoding
summary: The two distinct phases of autoregressive inference: a compute-bound prefill that processes the whole prompt in parallel to fill the key-value cache, then a memory-bound decode that generates output one token at a time. They have opposite performance characteristics, and almost every inference optimization, the KV cache, paged attention, continuous batching, speculative decoding, exists to exploit that split.
---

Serving a language model is not one uniform workload but two phases with opposite performance characteristics, and almost every inference optimization exists to exploit that split. The first phase, prefill, reads the entire input prompt at once: because every prompt token is already known, the model can process them in a single parallel forward pass, computing each layer's attention and feed-forward output for all positions together and writing the resulting key and value tensors into the kv-cache. The second phase, decode, generates the response autoregressively: each new token depends on the one before it, so tokens come out strictly one at a time, each requiring its own forward pass that attends back over the growing cache.

The two phases stress the hardware differently, and that is the point. Prefill is compute-bound: it does a large matrix multiply over many tokens, so it keeps the accelerator's arithmetic units busy and its cost scales with prompt length. Decode is memory-bound: each step generates a single token but must still stream the full model weights and the entire kv-cache out of memory to do it, so throughput is limited by memory-bandwidth rather than raw compute, and the expensive arithmetic units sit mostly idle. This asymmetry is why a long prompt that produces a short answer behaves nothing like a short prompt that produces a long one.

The split drives the headline latency metrics. Time to first token is dominated by prefill and grows with prompt size, while time per output token is set by the decode loop and is roughly constant per step. It also shapes the serving stack: the kv-cache and paged-attention exist to make the decode phase's growing state manageable, continuous batching keeps the memory-bound decode loop saturated by packing many requests together, and speculative decoding attacks decode's serial bottleneck directly by verifying several drafted tokens in one pass.

Because the phases are so different, modern systems increasingly treat them separately. Some schedulers chunk a long prefill so it does not stall ongoing decodes, and disaggregated designs run prefill and decode on different machines tuned for compute and for bandwidth respectively. Understanding which phase a workload lives in is the first step to reasoning about its cost and latency.
