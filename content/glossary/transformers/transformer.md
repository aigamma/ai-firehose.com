---
title: Transformer
slug: transformer
kind: technique
category: Transformers and LLMs
aliases: transformer architecture, transformers
related: self-attention, multi-head-attention, positional-encoding, large-language-model, token-embedding, next-token-prediction
summary: A neural architecture that processes a whole sequence at once through self-attention, having deleted the recurrence and convolution everyone assumed a sequence model needed. That removal is the point: with no step-by-step dependency, the entire sequence trains in parallel, which is what unlocked the scale behind every modern large language model.
---

The transformer's radical move was a deletion. For years a sequence model meant recurrence, processing tokens one after another while carrying a hidden state, or convolution over local windows. The 2017 paper that introduced the transformer threw both out, and its title said so: "Attention Is All You Need." The bet was that self-attention alone, letting every token look directly at every other and decide what matters, could replace the sequential machinery entirely. It could, and the architecture that resulted now underpins nearly all of modern AI.

The reason this mattered is not mainly that attention models language better, though it does; it is that removing recurrence removed the sequential bottleneck. A recurrent network must finish token five before it can start token six, so a sequence is processed strictly in order, one step at a time. Self-attention has no such dependency: every position is computed at once, in parallel, which maps directly onto the matrix-multiply hardware that GPUs and TPUs are built for. That parallelism is what let practitioners train on far more data than recurrence ever allowed, and it is the precondition the scaling laws exploit. The transformer did not just raise quality, it made scale affordable.

Mechanically, a transformer turns each token into a vector with a token embedding, adds a positional encoding so the otherwise order-blind attention knows where each token sits, and passes the result through a stack of identical layers. Each layer has two parts: a multi-head attention block that mixes information across positions, and a position-wise feedforward network that transforms each position on its own. A residual connection and layer normalization wrap both, which is what lets the stack run dozens or hundreds of layers deep without the signal degrading on the way through.

The architecture comes in three shapes that correspond to three jobs. The original encoder-decoder form reads a source with one stack and generates a target with another that attends back to it, the natural fit for translation. Encoder-only models like BERT keep just the reading half, for understanding tasks such as classification and retrieval. Decoder-only models keep just the generating half, attend only to tokens already produced, and train on next-token prediction; this is the shape of the GPT family and almost every large language model, because it scaled the best across the broadest range of text.

The bill for letting every token see every other is quadratic: attention cost grows with the square of the sequence length, which is the pressure behind the context window limit and the long line of efficiency work, the kv-cache, sparse and linear attention, that tries to relax it. Even so, the core recipe proved startlingly general, carrying from text to images, audio, code, and protein structure, which is why the transformer is now treated less as one model than as the default substrate for learning on sequences of anything.
