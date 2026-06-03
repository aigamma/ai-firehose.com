---
title: Expert Parallelism
slug: expert-parallelism
kind: technique
category: Systems and Infrastructure
aliases: expert parallelism, MoE parallelism
related: mixture-of-experts, tensor-parallelism, data-parallelism, model-parallelism, fully-sharded-data-parallel
summary: A parallelism strategy for mixture-of-experts models that places different experts on different devices, so each token is routed across the network to the device holding its chosen expert, letting a model hold far more parameters than any single device could.
---

Expert parallelism is the parallelism strategy built specifically for mixture-of-experts models. A mixture-of-experts layer contains many expert subnetworks but activates only a few per token, so the total parameter count is enormous while the compute per token stays modest. That combination is awkward for ordinary parallelism: the parameters do not fit on one device, but most of them are idle for any given token. Expert parallelism resolves it by distributing the experts themselves across devices, with each device holding a subset of the experts.

The consequence is a distinctive communication pattern. After a router decides which expert each token should go to, tokens must be sent to whichever device holds that expert, processed, and sent back. This is an all-to-all communication, and it is the defining cost of expert parallelism: throughput depends on the interconnect's ability to shuffle tokens between devices quickly. Load imbalance is the other hazard, because if the router sends a disproportionate share of tokens to a few popular experts, the devices holding them become bottlenecks while others sit idle, which is why MoE training uses load-balancing losses to spread tokens out.

Expert parallelism is rarely used alone. It composes with the other axes of parallelism: tensor parallelism splits individual large operations across devices, pipeline parallelism splits the model by layer, and data or fully-sharded data parallelism scales across replicas. A large MoE model in production typically combines several of these at once.

It is the key enabler behind the very large sparse models that dominate the high end, where most of the parameter count lives in experts and only a fraction is touched per token.
