---
title: Tokenization
slug: tokenization
kind: technique
category: Transformers and LLMs
aliases: tokenizer, tokenizing
related: byte-pair-encoding, token-embedding, context-window, large-language-model, next-token-prediction
summary: The step that breaks raw text into discrete units called tokens, the atomic symbols a language model actually reads and predicts. The choice of tokenizer is a genuine architectural decision, not mere preprocessing: it quietly fixes what the model can see and say, and it is why character-level tasks like counting letters are hard, since the model perceives clumps, not characters.
---

Tokenization is the first thing that happens to text on its way into a language model. A model cannot operate on raw characters or whole sentences directly; it works over a fixed vocabulary of discrete symbols called tokens, and tokenization is the process of cutting a string into a sequence of those symbols. Everything downstream, the embeddings, the attention, the predicted probabilities, is defined over tokens, so the choice of tokenizer quietly shapes what the model can see and say.

Modern language models almost always tokenize at the subword level, a middle ground between two extremes. Splitting on whole words gives short sequences but a huge vocabulary and no way to handle a word never seen in training; splitting into individual characters handles anything but produces very long sequences and forces the model to relearn spelling from scratch. Subword tokenization keeps common words as single tokens while breaking rare or novel words into reusable pieces, so "tokenization" might become "token" plus "ization", and an unfamiliar name still decomposes into known fragments. Byte-pair encoding is the most common algorithm for building such a vocabulary, learning frequent character pairs to merge from a corpus.

The mechanics are a lookup. The tokenizer holds a vocabulary that maps each token string to an integer id, applies its splitting rules to the input, and emits the corresponding sequence of ids, often inserting special tokens to mark the start of text, the boundary between turns, or the end of a sequence. That id sequence is what the token embedding layer turns into vectors, and at generation time the process runs in reverse: the model predicts token ids, which are looked up and stitched back into a string.

Tokenization has consequences that surprise newcomers, and they are the keeper. Because a token is usually a chunk of several characters, the context window is measured in tokens, not words or letters, and the same passage can cost very different token counts in different languages or scripts. Tasks that hinge on individual characters, counting letters, reversing a string, some arithmetic, are harder precisely because the model perceives clumps rather than characters. And since the model can only ever produce tokens in its vocabulary, the tokenizer sets the outer boundary of what it can express, which is why tokenization is a genuine architectural decision rather than mere preprocessing.
