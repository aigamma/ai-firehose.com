---
title: Secure Aggregation
slug: secure-aggregation
kind: technique
category: Alignment and Safety
aliases: secure aggregation, secure sum
related: federated-learning, differential-privacy, membership-inference, data-poisoning, rlhf
summary: A cryptographic protocol that lets a server compute the sum of many parties' values, the averaged model update in federated learning, without seeing any individual contribution. It closes the privacy hole that decentralization alone leaves open, since a raw model update can itself leak the private data it was computed from.
---

Federated learning keeps raw data on each device and sends only model updates to a server to be averaged, which sounds private. But it is not private enough on its own: an individual update is a function of one party's private data, and a curious or compromised server can often invert it to reconstruct what that data was, the same leakage that membership inference exploits. Secure aggregation closes the gap by letting the server learn the sum of everyone's updates while learning nothing about any single one.

The mechanism is cryptographic masking. Each participant adds a random mask to its update before sending it, with the masks arranged in pairs so that across all participants they cancel exactly: the masks sum to zero. The server adds up the masked updates, the masks vanish in the total, and out comes the true aggregate, the averaged update it needs, while every individual contribution remained hidden inside its mask the whole time. The protocol also has to handle dropouts gracefully, recovering the canceling structure when some participants disappear mid-round.

The distinction worth holding is what secure aggregation does and does not protect. It hides the individual updates during the computation, but the final aggregate is still revealed, and an aggregate can itself leak information if the group is small or one contributor dominates. That is why secure aggregation is layered with differential privacy, which bounds what even the released aggregate can reveal about any single example: cryptography hides the parts, differential privacy limits what the whole gives away. Together they make the collaboration both decentralized and provably private.

Secure aggregation matters because privacy that depends on trusting the server is not privacy at all, and decentralization without it is a false comfort. It is the piece that turns "your data stayed on your device" into a guarantee rather than a slogan, which is increasingly important as models are trained on sensitive data, from phones to hospitals, where the whole point is to learn from data that no central party is ever allowed to see.
