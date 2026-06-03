---
title: Sequence-to-Sequence
slug: sequence-to-sequence
kind: technique
category: NLP Foundations
aliases: seq2seq, encoder-decoder
related: self-attention, attention-mechanism, n-gram-model, word-embedding, bert, large-language-model
summary: A neural architecture that maps an input sequence to an output sequence of possibly different length using an encoder that reads the input into a representation and a decoder that generates the output one step at a time.
---

Sequence-to-sequence, often shortened to seq2seq, is a framework for problems where both the input and the output are sequences, and the two need not be the same length. Machine translation is the canonical case, where a sentence in one language maps to a sentence in another, but the same shape fits summarization, question answering, speech transcription, and code generation. Introduced around 2014, the approach made a single neural model able to read a whole sequence and emit a whole sequence, rather than labeling tokens one at a time.

The architecture has two parts. An encoder consumes the input sequence and compresses it into an internal representation, and a decoder produces the output sequence step by step, emitting one token at a time and feeding each generated token back in to inform the next. In the original formulation both parts were recurrent neural networks, and the encoder squeezed the entire input into a single fixed-length context vector that the decoder then unrolled. Training maximizes the probability the model assigns to the correct output sequence, a richer objective than the next-word counts of an n-gram-model.

The early seq2seq design had a notorious bottleneck: forcing all information about the input through one fixed-length vector lost detail, and quality degraded on long sequences. The fix was the attention-mechanism, introduced in 2015, which lets the decoder look back at all of the encoder's per-token representations and focus on the relevant parts as it generates each output token. Attention removed the single-vector bottleneck and sharply improved translation, and it proved to be the more consequential idea than the recurrent backbone it was bolted onto.

Sequence-to-sequence matters as the bridge between the older statistical and recurrent approaches and the transformer era. The encoder-decoder structure it established is exactly the structure the original transformer adopted, except that the transformer discarded recurrence entirely and built both halves out of self-attention. Many modern systems are encoder-decoder transformers that descend directly from seq2seq, and the decoder-only large language model is a streamlined relative that keeps the autoregressive generation half.

The lasting lesson of seq2seq is the generative, conditional view of language: model the output sequence as a probability distribution conditioned on the input, and generate it autoregressively. That framing, plus the attention that rescued it, set the stage for the architectures that followed. Where static embeddings like word2vec gave models a vocabulary, seq2seq gave them a way to read one sequence and write another, the template behind translation, summarization, and conversational generation today.
