---
title: Squeeze-and-Excitation
slug: squeeze-and-excitation
kind: technique
category: Deep Learning Architectures
aliases: SE block, squeeze and excitation network, SENet
related: convolutional-neural-network, attention-mechanism, residual-connection, pooling, activation-function, feature-pyramid
summary: A lightweight module that learns a per-channel importance weight from global context and rescales each feature map accordingly, a form of channel attention. Where self-attention asks which positions a token should attend to, a squeeze-and-excitation block asks which channels the network should attend to given the whole image, and it costs almost nothing.
---

Squeeze-and-excitation is a small module inserted into a convolutional network that recalibrates its feature channels by learned importance. A convolution produces a stack of feature maps, one per channel, and treats them all as equally relevant by default; a squeeze-and-excitation block instead learns, from the input itself, a single scalar weight for each channel and multiplies that channel's whole feature map by its weight, turning some channels up and others down. Proposed by Hu, Shen, and Sun in 2017, it won the ImageNet classification challenge that year and showed that explicitly modeling relationships between channels gives a meaningful accuracy gain for very little added cost.

The block works in the two steps its name describes. The squeeze step collapses each channel's spatial map into one number by global average pooling, summarizing the entire image's response for that channel into a compact descriptor, so the subsequent decision can draw on global context rather than a local patch. The excitation step feeds that descriptor through a tiny two-layer network with a bottleneck in the middle and a sigmoid activation at the end, producing a weight between zero and one for every channel, which are then applied back to the original feature maps by channel-wise multiplication. The bottleneck keeps the parameter and compute overhead small, which is central to the block's appeal.

It matters because it is one of the clearest and earliest forms of channel attention, an attention mechanism that operates over feature channels instead of over sequence positions. Where self-attention in a transformer asks which other tokens a position should attend to, a squeeze-and-excitation block asks which channels the network should attend to given the whole image, and answers with a learned gating vector. This reframed part of convolutional design around adaptive, content-dependent feature reweighting, and it influenced a line of follow-on attention modules that also model spatial importance or combine the two.

In practice the block is a drop-in addition, placed inside the residual blocks of a backbone so it recalibrates features just before they are added back through the residual connection. Because it is cheap and architecture-agnostic, it spread quickly into standard image classification and detection backbones and into the feature-pyramid stages used for multi-scale recognition, and it remains a common ingredient in efficient convolutional models where a small, learned boost in representational quality is worth its negligible cost.
