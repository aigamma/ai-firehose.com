---
title: Watermarking
slug: watermarking
kind: technique
category: Alignment and Safety
aliases: watermarking, AI watermarking, statistical watermark
related: ai-safety, hallucination, synthetic-data, large-language-model
summary: Techniques that embed a detectable, often statistical, signal into AI-generated text or images so an output can later be identified as machine-made, aimed at provenance, misuse detection, and telling synthetic content apart from human work. Its hard limit is robustness: text watermarks wash out under paraphrasing or heavy editing, so watermarking is a useful provenance signal and a deterrent, not a guarantee.
---

Watermarking tries to answer a question that is becoming urgent as generation improves: was this made by a machine. The goal is to plant a signal in generated content that a detector can later read, ideally without a noticeable drop in quality and without access to the original model.

For text, the leading approach works at the sampling step. The model secretly partitions the vocabulary into a favored set and a disfavored set, pseudo-randomly based on recent tokens, and biases sampling toward the favored set. Any single choice looks natural, but across a passage the proportion of favored tokens is statistically higher than chance, a fingerprint a detector with the secret can spot while a reader cannot. For images, watermarks are typically imperceptible patterns embedded in the pixels or the generation process. The motivations are real: deepfakes and misinformation, academic and hiring integrity, and keeping synthetic text out of the next model's training data, where it would cause model collapse.

A good watermark should be low-distortion, detectable without the generating model, and robust to light editing, and these goals trade against one another.

The hard limitation is robustness, the keeper. Text watermarks weaken or wash out under paraphrasing, translation, or heavy editing, and a motivated adversary can often remove them, while images face cropping and re-encoding. Watermarking is therefore a useful provenance signal and a deterrent, not a guarantee, and it works best as one layer alongside provenance metadata and detection rather than as a standalone solution.
