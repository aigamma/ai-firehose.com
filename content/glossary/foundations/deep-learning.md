---
title: Deep Learning
slug: deep-learning
kind: technique
category: Foundations and History
aliases: deep neural networks
related: neural-network, machine-learning, connectionism, perceptron, the-bitter-lesson, artificial-intelligence
summary: The branch of machine learning that stacks many layers of neural units to learn its own features straight from raw data, rather than being handed features a human designed. Depth is what builds those features in a hierarchy, edges to shapes to objects, and it is the approach behind most AI breakthroughs since the 2010s.
---

For decades, the hardest and most valuable work in machine learning was feature engineering: a human expert deciding by hand which measurable properties of an image, a sound, or a sentence a model should be allowed to look at. Deep learning made most of that labor obsolete. Its central idea, representation learning, is to feed the network raw data, pixels, audio samples, characters, and let it discover the useful features itself, layer by layer, with early layers catching simple patterns like edges and later layers composing them into parts, objects, and concepts. The machine turned out to be better at designing its own inputs than we were.

None of the core machinery was new. The units descend from the perceptron, training still runs on backpropagation and gradient descent, and stacking layers is a decades-old idea. What arrived in the 2010s was scale: large labeled datasets, fast parallel hardware in the form of GPUs, and a handful of tricks that let very deep stacks train without the signal dissolving on the way through. The tipping point even has a date. In 2012 a deep convolutional network roughly halved the error rate on the ImageNet image-classification benchmark, and the margin was decisive enough that the field reorganized around the approach within a few years.

What deep learning delivered was precisely the set of problems that had embarrassed AI for a generation, the perceptual tasks Moravec's paradox flags as hardest to program: vision, speech, translation, and eventually language itself. Different architectures specialize the same idea, convolutional networks for images, recurrent networks and then the transformer for sequences, but the common thread is always depth and learned representation in place of hand-coded knowledge. The features nobody could write down by hand, the tacit sense of what a cat looks like, are exactly what the layers learned to represent on their own.

Deep learning is the clearest vindication of the bitter lesson: it swapped engineered features and symbolic rules for general networks that improve as data and compute grow, and that scaling is what carried it past everything before it. The bill arrives in the same currency as the power. Deep models are data-hungry, expensive to train, and opaque, since their knowledge lives in billions of weights rather than legible rules, so the better they work the less we can say about why. Nearly every system this site tracks is built on them, which makes deep learning less one technique among many than the default substrate the rest of the field now assumes.
