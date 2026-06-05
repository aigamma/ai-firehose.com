---
title: Token Embedding
slug: token-embedding
kind: technique
category: Transformers and LLMs
aliases: token embeddings, embedding layer, input embedding
related: tokenization, byte-pair-encoding, positional-encoding, transformer, self-attention, large-language-model
summary: The lookup layer that maps each discrete token id to a dense, learned vector, the bridge from symbols to the continuous math a transformer computes over. The vectors are learned so similar tokens sit near one another, and a common trick, weight tying, reuses this table at the output so it bookends the whole model.
---

A token embedding is the bridge between discrete text and the continuous math of a neural network. After tokenization turns a string into a sequence of integer token ids, those ids are just arbitrary labels with no inherent meaning, and a transformer cannot add or multiply them sensibly. The token embedding layer replaces each id with a dense vector of real numbers, drawn from a learned table with one row per vocabulary entry, and this is the first computational step inside the model: from here on every operation, attention included, works on vectors rather than symbols.

Mechanically the layer is a simple lookup, but the vectors it returns are learned during training along with the rest of the model. As training proceeds, the embedding of each token is nudged so that tokens used in similar ways come to sit near one another in the vector space, which is what lets the model treat related words as related. These vectors are the raw material attention operates on: the query, key, and value projections inside self-attention are all linear transformations of the embeddings, so the geometry the embedding layer learns directly shapes what relationships the model can express.

The token embedding handles meaning but not order, since the same token gets the same vector no matter where it appears, which is why a positional encoding is added to the token embedding before the first attention layer, combining what a token is with where it sits. The dimensionality of the embedding, the model dimension, is one of the architecture's basic hyperparameters and sets the width of nearly every vector that flows through the network thereafter.

A common and economical design choice is weight tying, in which the input embedding table is shared with the output layer that turns the model's final hidden state back into a probability distribution over the vocabulary for next-token prediction. The same matrix that maps ids to vectors at the input is reused, transposed, to map vectors back to vocabulary scores at the output, which saves a large number of parameters and often improves quality. The token embedding therefore frequently bookends the whole model, defining both how text enters and how predictions leave, which is why its size scales with the vocabulary the byte-pair encoding produced.
