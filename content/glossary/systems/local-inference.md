---
title: Local Inference
slug: local-inference
kind: technique
category: Systems and Infrastructure
aliases: on-device inference, local LLM, self-hosted inference
related: quantization, mixture-of-experts, kv-cache, large-language-model, frontier-model, knowledge-distillation, lora
summary: Running a model on your own hardware, a laptop, phone, or private server, rather than calling a provider's API. It trades the raw capability of the largest cloud models for privacy, control, offline use, and freedom from per-token fees, and is what quantization and small-model research exist to enable.
---

Calling a frontier model over an API is easy, but it means every prompt leaves your machine, every response costs money, and the capability vanishes when the connection or the provider does. Local inference runs the model on hardware you control instead. The appeal is concrete: data that never leaves the device, no per-token bill, no rate limit, no dependency on a company's uptime or terms, and the ability to work offline. The cost is that the models you can run locally are smaller and weaker than the ones in the cloud.

Fitting a useful model onto modest hardware is an exercise in compression. Quantization stores the weights at lower precision, four bits instead of sixteen, shrinking memory and speeding compute at a small accuracy cost. Distillation trains a small model to imitate a large one. Sparse architectures activate only part of the network per token. And the key-value cache is managed carefully, because memory, not raw compute, is usually the binding constraint on a personal device. Each technique trades a little quality for the ability to run at all.

The honest tension is the capability gap. A model small enough to run on a laptop is, today, meaningfully less capable than the frontier system behind an API, and no amount of clever quantization closes that gap entirely, because some abilities simply require scale. So the real question for local inference is not whether the small model matches the big one, it does not, but whether it is good enough for the specific task, since a private, free, offline model that handles your job is often worth more than a stronger one you must send your data to.

Local inference is where the commoditization of AI becomes tangible. Every few months, capability that needed a data center last year fits on smaller hardware, pulled down by quantization, better small models, and cheaper memory, which steadily widens the set of tasks that do not need the cloud at all. The frontier will always live in data centers, but the floor keeps rising, and a growing share of everyday AI is quietly moving onto the device in your hand.
