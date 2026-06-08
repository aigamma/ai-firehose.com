---
title: Data Poisoning
slug: data-poisoning
kind: technique
category: Alignment and Safety
aliases: data poisoning, training-data poisoning, backdoor attack
related: ai-safety, red-teaming, pretraining, synthetic-data
summary: An attack that corrupts a model by injecting malicious examples into its training data, so the model learns attacker-chosen behavior (such as a hidden backdoor trigger or degraded performance) that is hard to detect after training. The most insidious variant is the backdoor: the model behaves normally until a secret trigger appears, so it passes every test that does not contain the trigger, and research shows poisoning even a tiny fraction of a corpus suffices.
---

Data poisoning attacks a model at its most trusting moment: training. By inserting carefully crafted examples into the data a model learns from, an attacker can shape what the model becomes. Because modern models are trained on enormous corpora scraped from the open web and on fine-tuning sets assembled from many sources, the training data is partly attacker-reachable, and no one fully vets every example.

The most insidious variant is the backdoor, or trojan. The attacker poisons the data so the model behaves normally almost always, but flips to attacker-chosen behavior when a secret trigger appears in the input, a specific phrase, token, or pattern. Such a backdoor is nearly invisible to ordinary evaluation, since the model passes every test that does not happen to contain the trigger. Other variants aim to degrade general performance, or to bias the model on a targeted topic, and poisoning can enter through pretraining data, through fine-tuning datasets, or through the preference labels used in alignment.

The unsettling part is the leverage: research has shown that poisoning even a tiny fraction of a large dataset can be enough to implant a reliable backdoor, because the model has the capacity to memorize the rare trigger-to-behavior association.

Defenses are partial and center on the supply chain: tracking data provenance, filtering and deduplicating training data, detecting statistical anomalies, and being cautious with third-party datasets and model weights. Like other training-time threats, it is far easier to prevent at ingestion than to detect in a finished model.
