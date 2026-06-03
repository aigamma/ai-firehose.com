---
title: Self-Supervised Learning
slug: self-supervised-learning
kind: technique
category: Core Machine Learning
aliases: self-supervised learning, SSL
related: supervised-learning, unsupervised-learning, pretraining, contrastive-learning, masked-language-modeling
summary: A learning paradigm where the supervision signal is generated from the data itself, by hiding part of each example and training the model to predict it, which lets models learn rich representations from vast unlabeled data and is the engine behind modern pretraining.
---

Self-supervised learning is the idea that made foundation models possible: get supervision for free by inventing a prediction task out of the unlabeled data. Hide a word in a sentence and train the model to fill it in; show all but the next token and train it to predict that token; mask a patch of an image and train the model to reconstruct it. No human ever labels anything, yet each example provides its own target, so the model trains with the precision of supervised learning on data that costs nothing to obtain.

This matters because labels are the scarce resource. Hand-annotating data is slow and expensive, while raw text, images, and code exist in effectively unlimited supply. Self-supervision turns that ocean of unlabeled data into training signal, which is why it, not labeled datasets, is what scaled. Every large language model is pretrained by self-supervised next-token prediction; encoder models like BERT use masked-token prediction; and much of modern vision uses self-supervised contrastive or reconstruction objectives.

It sits between the classic categories. Like unsupervised learning it needs no human labels, but like supervised learning it optimizes a concrete prediction target, just one derived automatically from the input. The representations it learns are general-purpose: a model pretrained this way can then be fine-tuned, or simply prompted, to do countless downstream tasks.

The deep reason it works is that predicting the hidden part of data well requires actually understanding the data's structure. To guess the next word reliably, a model must absorb grammar, facts, and reasoning patterns, so the "trivial" prediction task forces the rich representation as a byproduct. That is the quiet engine under the whole current era.
