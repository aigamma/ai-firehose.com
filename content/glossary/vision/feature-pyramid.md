---
title: Feature Pyramid
slug: feature-pyramid
kind: technique
category: Computer Vision
aliases: FPN, feature pyramid network
related: object-detection, semantic-segmentation, convolutional-neural-network, pooling, optical-flow, image-classification
summary: A multi-scale set of feature maps from several depths of a network, so objects of very different sizes are each recognized at an appropriate resolution. It gives a network a sense of scale a single flat feature map lacks, and the Feature Pyramid Network made this nearly free by reusing maps the backbone already computes, fused top-down with lateral connections.
---

A feature pyramid is a set of feature maps computed at several spatial scales so a model can reason about objects regardless of their size. As an image passes through a convolutional neural network, each round of pooling or strided convolution halves the resolution, producing a natural hierarchy: early maps are high-resolution with simple features, late maps low-resolution with rich, abstract features. A feature pyramid treats this hierarchy as a tool, reading predictions from multiple levels so small objects are handled by the fine, high-resolution maps and large objects by the coarse, semantically strong ones.

It matters because scale variation is one of the hardest facts of real images: the same object can fill the frame or occupy a dozen pixels, and a single fixed-resolution feature map cannot serve both well. Before pyramids, detectors either ran the whole network at many input sizes, which was slow, or accepted poor accuracy on small objects. The Feature Pyramid Network, introduced in 2017 and abbreviated FPN, made multi-scale features nearly free by reusing the maps the backbone already computes, and it quickly became standard equipment in object detection and semantic segmentation.

The key architectural idea in FPN is a top-down pathway with lateral connections. The deep, low-resolution maps carry strong semantics but coarse location; the shallow, high-resolution maps carry precise location but weak semantics. FPN upsamples the deep maps and merges them with the corresponding shallow maps through lateral connections, so every level of the resulting pyramid is both high-resolution and semantically rich, and predictions are made at each level independently, with each level responsible for a band of object sizes.

A feature pyramid is best seen as a way to give a network a sense of scale that a flat feature map lacks, and the same coarse-to-fine principle appears throughout vision, including the pyramidal refinement used to estimate large displacements in optical flow. It works hand in glove with the convolutional hierarchy and with pooling, and analogous multi-scale designs carry over to vision transformer backbones that produce features at several resolutions.
