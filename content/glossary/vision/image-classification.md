---
title: Image Classification
slug: image-classification
kind: technique
category: Computer Vision
related: convolutional-neural-network, vision-transformer, supervised-learning, softmax, pooling, transfer-learning, data-augmentation
summary: The task of assigning a whole image to one label from a fixed set, the simplest framing of visual recognition and the proving ground on which deep learning first beat hand-engineered methods. Its outsized importance is that the features a network learns while classifying transfer to every other vision task, which is why classification pretraining is where most visual backbones begin.
---

Image classification takes an entire image and predicts a single label naming what it depicts, choosing from a fixed vocabulary of categories. Given a photograph, a classifier outputs "tabby cat" or "fire truck" rather than locating where those things are or outlining their shape. It is the simplest framing of visual recognition and, for that reason, the one the field was built on: the ImageNet benchmark, over a million images across a thousand categories, turned classification into the proving ground where deep learning first overtook hand-engineered methods in 2012.

The task matters out of proportion to its apparent simplicity, because the representations a network learns while classifying turn out to be broadly useful. A model trained to tell a thousand object categories apart must, along the way, learn to detect edges, textures, parts, and whole objects, and those learned features transfer to other vision tasks, which is why classification pretraining is the usual first step before transfer learning or fine-tuning onto detection, segmentation, or any narrower problem. The accuracy number on a classification benchmark became the field's shorthand for how good a visual backbone is.

Mechanically a classifier maps an image to a vector of scores, one per category, then passes those scores through a softmax to produce a probability distribution over the labels. Training minimizes the cross-entropy between this predicted distribution and the true one-hot label, a supervised learning setup that needs many labeled examples, and because labeled images are finite and models overfit, classifiers lean heavily on data augmentation and regularization to generalize.

The dominant architectures have shifted over time. For most of the 2010s the convolutional neural network ruled, building a hierarchy of features through stacked convolution and pooling layers and reading out a final label from the top. Since 2020 the vision transformer has matched or exceeded convolutional accuracy by splitting the image into patches and applying attention, though it typically needs more data or stronger augmentation to reach the same generalization. Both families ultimately solve the same problem: compress an image down to one decision.
