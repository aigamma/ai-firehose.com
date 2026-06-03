---
title: Federated Learning
slug: federated-learning
kind: technique
category: Alignment and Safety
aliases: federated learning, collaborative learning
related: differential-privacy, ai-safety, data-parallelism, online-learning
summary: A training approach where many devices or institutions collaboratively train a shared model without their raw data ever leaving home; each computes updates locally and only the updates are aggregated, so the data stays private and decentralized.
---

Federated learning trains a shared model on data that never moves. Instead of collecting everyone's data into one place and training centrally, a coordinating server sends the current model to many participants, phones, hospitals, or companies, each of which trains on its own local data and sends back only the resulting model update. The server averages those updates into an improved global model and repeats. The raw data stays on the device or behind the institution's walls the entire time.

The motivation is privacy and the practical impossibility of centralization. Sensitive data like keystrokes, medical records, or proprietary corpora often cannot legally or ethically be pooled, yet the patterns across all of it are valuable. Federated learning extracts the shared signal without the data leaving its owner, which is why it powers things like next-word prediction on mobile keyboards learned across millions of phones.

It is harder than centralized training in specific ways. Each participant's data is non-identically distributed, so naive averaging can struggle; communication between server and many clients is a bottleneck; and participants drop in and out. These shape the algorithms that make it work.

Privacy, importantly, is not automatic just because the data stayed home: the model updates themselves can leak information about the local data. So federated learning is usually hardened with secure aggregation, which lets the server combine updates without seeing any individual one, and with differential privacy, which bounds what any single example can reveal. Together they make the collaboration both decentralized and provably private.
