---
title: Pooling
slug: pooling
kind: technique
category: Computer Vision
aliases: max pooling, average pooling
related: convolutional-neural-network, image-classification, semantic-segmentation, feature-pyramid, object-detection
summary: A downsampling operation that summarizes each small neighborhood of a feature map into one value, shrinking resolution while keeping the strongest or average response. It buys cheaper computation and a degree of translation invariance, but the very invariance that helps classification (presence matters, not position) hurts tasks like segmentation that need precise location.
---

Pooling reduces the spatial size of a feature map by summarizing each small region into one number. A pooling layer slides a window, often two by two, across the feature map and replaces the values inside each window with a single summary: max pooling keeps the largest value, average pooling keeps the mean. Striding the window by its own size halves the height and width, so a stack of pooling layers progressively shrinks a large image down to a small, dense grid of features. It is one of the two basic building blocks, alongside convolution, of the classic convolutional neural network.

Pooling earns its place for two reasons. First, it cheaply reduces resolution, cutting the computation and memory the deeper layers must handle and letting the network afford more channels and depth. Second, it grants a degree of translation invariance: because max pooling reports only that a strong feature appeared somewhere in the window, not exactly where, small shifts of the input leave the output unchanged, which makes the learned representation robust to the object being a few pixels left or right, desirable for image classification where only the presence of an object matters, not its precise position.

In practice, max pooling dominated early convolutional networks because keeping the strongest activation tends to preserve the most salient evidence of a feature. A special case, global average pooling, collapses an entire feature map to a single value per channel and is the standard way to turn a spatial feature grid into a fixed-length vector for the final classifier, replacing the parameter-heavy fully connected layers older networks used. Pooling also defines the levels of a feature pyramid, since each successive pooled map represents the image at a coarser scale.

The same invariance that helps classification hurts tasks that need precise location, which is the tension worth holding onto. Semantic segmentation and object detection must recover spatial detail that pooling discards, which is why segmentation networks pair an aggressively pooled encoder with an upsampling decoder and skip connections. Many modern architectures reduce their reliance on pooling, achieving downsampling instead through strided convolutions, and the vision transformer abandons it altogether in favor of patching and attention.
