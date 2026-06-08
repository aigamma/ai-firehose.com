---
title: Beam Search
slug: beam-search
kind: technique
category: Inference and Sampling
aliases: beam decoding
related: greedy-decoding, logits, temperature, top-p, speculative-decoding
summary: A decoding strategy that keeps the several most probable partial sequences at every step, expanding all and pruning back to a fixed beam width, so it searches for a high-probability whole sequence rather than the best token at each step. It exists because the most probable individual tokens do not compose into the most probable sentence, and it shines on answer-shaped tasks but produces bland, generic text on open-ended ones.
---

Beam search is a middle ground between greedy decoding and an exhaustive search over all possible sequences. Instead of committing to one token at each step, it maintains a set of the most promising partial sequences, called the beam, whose size is the beam width; at every step it extends each sequence in the beam by every candidate token, scores all the resulting longer sequences by their cumulative probability, and keeps only the top few, returning the sequence with the best total score at the end.

The reason it exists is simple: the most probable individual tokens do not compose into the most probable sentence. Greedy decoding fails whenever an early high-probability choice leads into a dead end with no good continuation, but by carrying several hypotheses forward in parallel, beam search can let a locally suboptimal token survive long enough to prove that it leads somewhere better, recovering sequences greedy decoding would never find. A beam width of one is exactly greedy decoding; wider beams search more thoroughly at higher cost.

The mechanics rest on summing log-probabilities. Each candidate sequence's score is the sum of the log of each token's probability, drawn from the model's logits, which is why beam search needs a length penalty in practice: without one it systematically prefers shorter sequences, because every added token can only lower the running total. Tuning that penalty, along with the beam width, governs whether the output runs long or clips short.

Beam search shines on tasks with a well-defined target, machine translation, summarization, speech transcription, where there is a clearly correct or near-correct output to be found. It is a poorer fit for open-ended generation, where its relentless pursuit of the single highest-probability sequence produces bland, repetitive, and oddly generic text, the opposite of what sampling methods like top-p and temperature are reaching for. Modern large-model inference therefore leans on sampling for creative work and reserves beam search for constrained, answer-shaped problems.
