---
title: Repetition Penalty
slug: repetition-penalty
kind: technique
category: Inference and Sampling
aliases: frequency penalty, presence penalty
related: logits, temperature, top-p, top-k, greedy-decoding
summary: A decoding adjustment that lowers the probability of tokens the model has already produced, breaking the loops and verbatim repetition language models fall into, especially under low-randomness decoding. Its frequency and presence variants differ in whether the penalty grows with each repeat or applies once, and its danger is overcorrection: push too hard and the model is starved of words it legitimately needs.
---

Repetition penalty is a correction applied during decoding to stop a model from saying the same thing over and over. Language models, particularly when decoding with little randomness, are prone to falling into loops: a phrase or sentence that gets repeated, or a single token that recurs far more than natural text would warrant. The penalty intervenes by tracking which tokens have already appeared in the generated text and making them less likely to be chosen again at the next step.

It matters because repetition is one of the most visible failure modes of generated text, and it is worst exactly where determinism is otherwise desirable. Greedy decoding and low-temperature sampling tend to reinforce whatever the model is most confident about, which can lock it into a self-perpetuating rut; a repetition penalty counteracts that pull, keeping output varied without having to raise the temperature so high that coherence suffers.

The mechanism is an edit to the logits before they are normalized. The penalty finds the logits of tokens that have already occurred and pushes them down, either by dividing positive logits and multiplying negative ones by a factor greater than one, or by subtracting a fixed amount. Two common variants differ in what they count: a frequency penalty scales with how many times a token has appeared, growing stronger with each repeat, while a presence penalty applies a flat reduction the moment a token has appeared at all, regardless of count. Both reduce the chance of repeating, and the strength of the factor sets how aggressively.

The risk is overcorrection. Push the penalty too hard and the model is forced away from words it legitimately needs, common function words, a subject's name, required code tokens, which degrades fluency and can make the text feel strained. Tuning is therefore a balance, set in concert with temperature and the truncation controls top-p and top-k rather than in isolation, enough discouragement to break loops without starving the output of the vocabulary it actually requires.
