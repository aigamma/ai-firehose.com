---
title: Mixture of Experts
slug: mixture-of-experts
kind: technique
category: Training and Fine-Tuning
aliases: MoE, sparse mixture of experts, sparsely-gated mixture of experts
related: pretraining, knowledge-distillation, fine-tuning, transfer-learning
summary: An architecture that replaces a dense layer with many parallel expert subnetworks and a router that activates only a few per input, so total parameters grow without a proportional rise in compute per token. It breaks the usual coupling between a model's capacity and its per-token cost, which is why frontier systems use it, at the price of a tricky-to-balance router and a memory-hungry footprint to serve.
---

Mixture of experts (MoE) lets a model have a very large number of parameters while keeping the cost of processing each input low. The idea is to replace a single dense layer with a collection of parallel subnetworks called experts, plus a small router (or gating network) that decides, for each input token, which one or two experts should handle it. Only the selected experts run; the rest sit idle. Because just a fraction of the experts are active at any moment, the model is described as sparsely activated, in contrast to a dense model where every parameter participates in every computation.

MoE matters because it decouples a model's total capacity from its per-token compute, attacking the central tension in scaling, and that is the keeper. Scaling laws say bigger models are better, but compute and latency scale with the parameters used per token; MoE breaks that coupling, so a model can hold ten times the parameters of a dense counterpart yet activate only as many per token as a much smaller model, far more knowledgeable for a similar inference cost. This is why several frontier-scale systems use MoE layers, and why the technique recurs constantly in discussion of efficient pretraining.

The mechanism centers on the router. For each token, the gating network produces scores over the experts and selects the top one or two, the chosen experts process the token, and their outputs are combined, weighted by the gate. Training this is subtle, because the router must learn good assignments while the experts specialize, and there is a risk that the router sends most tokens to a few popular experts and starves the others; an auxiliary load-balancing loss and capacity limits per expert counteract this. Routing is discrete, which complicates gradients and makes MoE models known for being trickier to train and fine-tune stably than dense ones.

MoE also brings deployment trade-offs. The full parameter set must be held in memory even though only a slice runs per token, so MoE models are memory-hungry to serve, and distributing experts across devices adds communication overhead. These costs are the price paid for the capacity gain, and they shape when MoE is worth it, with knowledge distillation sometimes used to compress a large sparse MoE teacher into a smaller dense student that is simpler to deploy.

Mixture of experts is primarily an architectural choice made at pretraining time, but it interacts with the rest of this category: it changes how fine-tuning behaves, since adapting a routed network can disturb the delicate balance the router learned, and it is one of the main levers, alongside distillation, for managing the relationship between a model's knowledge and its serving cost.
