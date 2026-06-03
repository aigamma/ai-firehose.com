---
title: Data Augmentation
slug: data-augmentation
kind: technique
category: Computer Vision
related: overfitting, regularization, image-classification, supervised-learning, contrastive-learning, vision-transformer
summary: A regularization technique that enlarges a training set by applying label-preserving random transformations to existing examples, teaching a model the invariances it should respect and reducing overfitting.
---

Data augmentation expands a training set artificially by transforming existing examples in ways that change their appearance but not their label. For images this means random crops, horizontal flips, rotations, color and brightness shifts, scaling, and blurs: a photo of a cat flipped left-to-right or slightly recolored is still a photo of a cat. By generating many such variants on the fly during training, augmentation lets a model see effectively far more data than was collected, without the cost of labeling anything new. It is one of the most reliable and cheapest tools in computer vision.

Augmentation matters chiefly as a defense against [overfitting](overfitting). Deep networks have enormous capacity and, given a finite labeled dataset, will memorize incidental quirks of the training images instead of learning the underlying object. By presenting a shifting, perturbed version of each example every epoch, augmentation makes memorization much harder and forces the network to rely on features that survive the transformations. In this sense it acts as a form of [regularization](regularization), and it is especially important for data-hungry architectures like the [vision transformer](vision-transformer), which overfit small datasets without aggressive augmentation.

The deeper principle is that augmentation injects prior knowledge about invariances directly into [supervised learning](supervised-learning). When you flip images horizontally and keep the label, you are telling the model that left-right orientation is irrelevant to the category, an invariance a [convolutional neural network](convolutional-neural-network) cannot fully assume on its own. Choosing augmentations is therefore choosing which transformations the task should ignore. The choice must be label-preserving: flipping a digit photo is fine for "is this a cat", but a horizontal flip turns a 6 into something closer to a 9, so it is wrong for digit recognition.

Augmentation has grown from a few hand-picked transforms into learned and automated policies, such as RandAugment and AutoAugment, and into powerful combination schemes like Mixup and CutMix that blend two images and their labels. It is also the engine of self-supervised [contrastive learning](contrastive-learning): methods like the one behind SimCLR create two differently augmented views of the same image and train the model to recognize them as the same, using augmentation to manufacture the supervision signal itself.
