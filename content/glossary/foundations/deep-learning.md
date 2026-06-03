---
title: Deep Learning
slug: deep-learning
kind: technique
category: Foundations and History
aliases: deep neural networks
related: neural-network, machine-learning, connectionism, perceptron, the-bitter-lesson, artificial-intelligence
summary: A branch of machine learning that uses neural networks with many layers to learn hierarchical representations directly from raw data. It is the approach behind most of the AI advances of the 2010s and beyond.
---

Deep learning is the subfield of machine learning built on neural networks with many layers, where "deep" refers to the depth of that layer stack. Its defining idea is representation learning: rather than feeding a model hand-engineered features, you feed it raw data, pixels, audio samples, characters, and let the network discover its own features layer by layer. Early layers capture simple patterns such as edges or phonemes, later layers compose them into parts and then into whole objects or concepts. This hierarchy of learned representations is what distinguishes deep learning from earlier machine learning that depended on human-designed features.

The approach is the modern, scaled-up form of connectionism, and its core machinery is not new. The units are descendants of the perceptron, training relies on backpropagation to compute gradients and gradient descent to apply them, and the layered architecture goes back decades. What changed in the 2010s was scale: large labeled datasets, fast parallel hardware in the form of GPUs, and refinements that let very deep networks train stably. The 2012 result in which a deep convolutional network sharply cut the error rate on the ImageNet image-classification benchmark is widely treated as the moment deep learning's practical dominance became undeniable.

Deep learning matters because it delivered the capabilities that had eluded AI for a generation, and it did so on exactly the problems Moravec's paradox flagged as hardest. Machine vision, speech recognition, machine translation, and ultimately large language models all became practical through deep networks, after decades in which hand-built rules had failed at them. Different architectures specialize the basic idea: convolutional networks for images, recurrent networks and then transformers for sequences and language. The common thread is depth and learned representation rather than hand-coded knowledge.

The rise of deep learning is the clearest vindication of the bitter lesson. It replaced the carefully engineered features and symbolic rules of earlier AI with general networks that learn from data and improve as compute and data grow, the scaling behavior the lesson predicts will win. The tradeoffs are the familiar ones of connectionism, amplified by scale: deep models are data-hungry, computationally expensive to train, and hard to interpret, since their knowledge lives in billions of weights rather than readable rules. Even so, deep learning is the dominant paradigm of contemporary artificial intelligence, and most of the systems this site tracks are built on it.
