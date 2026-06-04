---
title: Hidden Markov Model
slug: hidden-markov-model
kind: technique
category: Probabilistic Machine Learning
aliases: HMM, hidden Markov models
related: graphical-model, kalman-filter, latent-variable-model, expectation-maximization, conditional-probability, probability-distribution
summary: A model of sequences in which a hidden state evolves as a Markov chain and each state emits a visible observation, so you infer the hidden process from its observable shadow. Three classic dynamic-programming algorithms, forward, Viterbi, forward-backward, make it usable, and it is the discrete-state cousin of the Kalman filter.
---

A hidden Markov model is a model for sequences in which the thing you care about is hidden and only its consequences are observed. It posits an unobserved state that changes step by step as a Markov chain, so the next state depends only on the current one and not the full history, and at each step that hidden state emits a visible observation through an emission distribution. You see the stream of observations and must infer the sequence of states that produced it. The model is defined by three ingredients: the probabilities of starting in each state, the transition probabilities between states, and the emission probabilities from each state to the observations.

It matters because so much real data arrives as a sequence with hidden structure underneath. In speech recognition the hidden states are phonemes and the observations are slices of audio; in bioinformatics the states are gene regions and the observations DNA bases; in finance the states might be market regimes and the observations the returns. For decades the hidden Markov model was the dominant tool in speech and natural language processing, and it remains a clean, interpretable baseline whenever a process moves through a small number of unobserved modes and leaves a noisy trace.

Three classic computations make the model useful, each with an efficient dynamic-programming algorithm, and knowing them is most of knowing the model. The forward algorithm computes the likelihood of an observed sequence by summing over all possible hidden paths. The Viterbi algorithm finds the single most probable hidden path given the observations, the standard way to decode a sequence into states. And the forward-backward algorithm computes the posterior conditional probability of each state at each time. Learning the parameters from unlabeled sequences is done with the Baum-Welch algorithm, which is simply expectation maximization specialized to this structure: the E step uses forward-backward to infer state responsibilities, the M step re-estimates the transition and emission probabilities.

A hidden Markov model is best understood as a particular graphical model, a chain-structured latent variable model whose latent variables are discrete states linked in time, and that framing connects it to its relatives. The Kalman filter is the continuous-state analogue, where the hidden state is a real-valued vector evolving with Gaussian noise rather than jumping between discrete categories, and both are instances of the same underlying state-space idea. Seen in this lineage, the hidden Markov model is the canonical discrete example of reasoning about a hidden process from its observable shadow, a pattern that recurs throughout probabilistic machine learning.
