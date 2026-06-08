---
title: Edge Deployment
slug: edge-deployment
kind: tool
category: Systems and Infrastructure
aliases: edge deployment, edge AI
related: local-inference, quantization, model-compression, knowledge-distillation, gpu
summary: Running a model on the device where the data is, a phone, a car, a camera, a sensor, instead of sending the data to a server. It trades the cloud's abundant compute for privacy, low latency, offline operation, and zero per-query cost, at the price of squeezing the model into a tight hardware budget.
---

The default for AI is the cloud: send the input to a data center, run a big model, return the answer. That breaks down when the network is slow or absent, when the data is too private to send, or when a round trip is too slow, a car deciding whether to brake cannot wait on a server. Edge deployment runs the model where the data is born, on the device itself, accepting a hard compute budget in exchange for independence from the cloud.

The device is the constraint. A phone or an embedded chip has a fraction of a server's memory, compute, and power, so the model must be shrunk to fit: quantization to cut the bits per weight, model compression and pruning to drop parameters, and knowledge distillation to train a small model to mimic a large one. Each technique trades a little accuracy for a large reduction in footprint, and the craft is finding how far the specific device and task tolerate before quality breaks.

The deeper shift is where the cost goes. Cloud inference is cheap to ship and expensive forever, paid on every single request; edge inference is expensive to fit but then runs at zero marginal cost, on hardware the user already owns. That inversion is why edge is compelling both at scale and for privacy: the data never leaves the device, and the provider never pays for the compute, so the economics and the privacy story improve together.

Edge and cloud are less rivals than a spectrum, and the interesting designs split the work: a small fast model on the device handles the common case and decides when to escalate a hard query to a large model in the cloud, the same routing logic that governs model selection, applied across the network boundary. As open models shrink and devices gain dedicated accelerators, more of the everyday inference quietly moves to the edge.
