---
title: Paged Attention
slug: paged-attention
kind: technique
category: Systems and Infrastructure
aliases: paged attention, PagedAttention
related: kv-cache, memory-bandwidth, context-window, flash-attention, large-language-model, gpu
summary: Paged attention is a memory management technique for serving language models that stores the key-value cache in small non-contiguous blocks, borrowing the idea of virtual memory paging so many requests can share GPU memory efficiently and waste far less of it.
---

Paged attention is a method for managing the memory of the kv-cache during language model inference, so that a server can handle many simultaneous requests without wasting accelerator memory. Generating text requires keeping a cache of key and value vectors for every token seen so far, and that cache grows as each response gets longer. The naive approach reserves one large contiguous block of memory per request, sized for the longest output the request might produce. Paged attention replaces that scheme with one inspired directly by how operating systems manage virtual memory.

The problem it fixes is fragmentation and over-reservation. Because a request's final length is not known in advance, a contiguous allocation must be sized for the worst case, so most of the reserved memory sits empty while the response is still short, and odd-sized leftover gaps between allocations cannot be reused. On a gpu serving many users at once, this wasted and stranded memory can be most of the cache budget, which directly caps how many requests can run together and therefore the throughput of the whole system.

Paged attention works by cutting the kv-cache into many small fixed-size blocks, called pages, that do not have to sit next to each other in memory. Each request is given a table mapping the logical positions in its sequence to whichever physical pages currently hold them, and new pages are handed out only as the response actually grows. The attention computation is adapted to gather the key and value vectors by walking this table rather than reading one contiguous span. Because allocation is now in small uniform units assigned on demand, almost no memory is reserved before it is needed and almost none is stranded, so far more concurrent requests fit in the same memory.

This indirection also unlocks sharing. Requests that begin with the same prompt, such as a common system prefix or several samples from one input, can point their tables at the same physical pages instead of each storing a private copy, saving memory and the bandwidth to write it. Paged attention is a cornerstone of high-throughput serving systems and composes with kernel-level optimizations like flash-attention, one managing how cache memory is laid out and the other how attention is computed. By packing many more sequences into a fixed pool of memory, it raises the effective serving capacity of expensive accelerators and makes long context windows more affordable to offer at scale.
