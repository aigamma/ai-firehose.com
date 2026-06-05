---
title: Encoder-Decoder
slug: encoder-decoder
kind: technique
category: Transformers and LLMs
aliases: encoder-decoder, seq2seq transformer
related: transformer, cross-attention, decoder-only-model, sequence-to-sequence, bert
summary: The original transformer in two stacks: an encoder that reads the whole input bidirectionally into a representation, and a decoder that generates the output token by token while reaching into that representation through cross-attention. The clean split, fully understand the source before committing to any output, suits sequence-to-sequence tasks like translation, where most large language models instead went decoder-only.
---

The encoder-decoder is the transformer in its original form, and it has two halves. The encoder reads the whole input at once with bidirectional self-attention, so every input token can see every other, building a rich representation of the source; the decoder then generates the output one token at a time with causal self-attention over what it has produced so far, and crucially it reaches into the encoder's representation through cross-attention, letting each generated token attend to the most relevant parts of the input.

This design fits sequence-to-sequence tasks, where a complete input must be transformed into a complete output: machine translation (the task the transformer was invented for), summarization, and speech recognition. The clean separation lets the encoder fully understand the source before the decoder commits to any output, and cross-attention is the bridge between the two.

It contrasts with the two other transformer families. Decoder-only models drop the encoder and fold input and output into a single stream, which turned out to scale better for general language modeling and is why most large language models are decoder-only; encoder-only models like BERT keep only the bidirectional encoder, ideal for understanding tasks like classification and retrieval where no generation is needed.

Encoder-decoder architectures remain strong where the task is genuinely a mapping from one sequence to another and bidirectional understanding of the full input matters, with T5 a well-known example, even as decoder-only models dominate open-ended generation. The split that once defined the transformer is now the specialized choice, not the default.
