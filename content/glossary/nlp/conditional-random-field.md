---
title: Conditional Random Field
slug: conditional-random-field
kind: technique
category: NLP Foundations
aliases: CRF, linear-chain CRF
related: part-of-speech-tagging, named-entity-recognition, hidden-markov-model, sequence-to-sequence, supervised-learning
summary: A probabilistic model for sequence labeling that predicts an entire label sequence jointly, modeling how adjacent labels constrain each other, which made it the dominant pre-neural method for named-entity recognition and part-of-speech tagging. Its enduring lesson: when outputs are structured and interdependent, model the structure of the output, do not classify each piece alone.
---

A conditional random field labels a sequence by considering the whole sequence at once. Tagging each token independently ignores a basic fact: labels constrain their neighbors. In the common BIO scheme for named entities, an "inside" tag cannot follow an "outside" tag, and a CRF captures exactly these label-to-label transition rules, scoring an entire candidate label sequence rather than each position alone and choosing the best consistent one.

It is best understood against the hidden Markov model it largely replaced. An HMM is generative and makes strong independence assumptions about how observations are produced; a CRF is discriminative, conditioning directly on the entire input sequence and free to use rich, overlapping features of the words without modeling their distribution, which made it both more accurate and more flexible. For roughly a decade it was the state of the art for sequence-labeling tasks across NLP.

Even after deep learning arrived, the CRF did not vanish. A very common architecture put a CRF layer on top of a neural encoder, the BiLSTM-CRF, letting the network learn features while the CRF enforced valid label transitions, combining learned representations with structured output.

Understanding it illuminates a general principle that still matters, the keeper: when outputs are structured and interdependent, modeling the structure of the output, not just classifying each piece in isolation, is what produces coherent results, an idea that echoes in constrained and structured decoding for modern language models.
