---
title: Conditional Probability
slug: conditional-probability
kind: technique
category: Probability and Information Theory
aliases: conditioning, conditional probabilities
related: bayes-theorem, bayesian-inference, mutual-information, probability-distribution, expectation
summary: The probability of one event given that another is known to have happened, the formal act of incorporating information. It is the foundation of all probabilistic learning, since a language model is literally a chain of conditional probabilities, and its asymmetry, that the chance of A given B is not the chance of B given A, is the source of constant confusion and of Bayes' theorem.
---

Conditional probability measures how the likelihood of an event changes once you learn that some other event has happened. Written P(A given B), it is the joint probability of A and B together divided by the probability of B: you restrict attention to the world where B is true and renormalize the probabilities within that smaller world so they sum to one again. That is the whole definition, and its importance is that conditioning is the formal act of incorporating information, of updating what you expect in light of what you now know.

This idea is the foundation of essentially all probabilistic learning, because data arrives as information and the entire point is to condition on it. A spam filter wants the probability a message is spam given the words it contains. A language model is defined entirely by conditional probabilities: the chance of each next token given all the tokens before it, nothing more. The chain rule of probability decomposes any joint distribution into a product of conditionals, which is exactly how an autoregressive model factors the probability of a whole sequence into one conditional step at a time. Generation is just sampling from a long chain of conditional probabilities.

Conditional probability is tightly tied to independence and its absence. Two events are independent when conditioning on one tells you nothing about the other, so P(A given B) equals P(A); when that fails, the events carry information about each other, and mutual information quantifies how much. Conditional independence, where two variables become independent once a third is known, is the structural assumption behind graphical models and naive Bayes classifiers: it is what lets a huge joint distribution factor into manageable pieces, the difference between tractable and hopeless.

The asymmetry of conditioning is the source of frequent confusion and of one of probability's most important results. P(A given B) is generally not P(B given A): the probability of a positive test given disease is not the probability of disease given a positive test, and treating them as the same is a classic and costly mistake. Bayes' theorem is precisely the rule that relates the two directions, unavoidable whenever you need to invert a conditional, which in practice means whenever you reason from an observed effect back to a hidden cause. Every time a model updates what it expects in light of what it has seen, it is computing a conditional probability.
