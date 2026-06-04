---
title: Autoencoder
slug: autoencoder
kind: technique
category: Deep Learning Architectures
aliases: autoencoder, auto-encoder, AE
related: multilayer-perceptron, convolutional-neural-network, latent-space, backpropagation, dropout, attention-mechanism
summary: A network trained to copy its input to its output through a narrow bottleneck, a constraint that forces it to learn a compressed code capturing the data's structure. No labels are needed, which makes it a workhorse of unsupervised representation learning, and its compress-then-reconstruct template recurs across the whole field.
---

An autoencoder is trained to copy its input to its output, but through a constraint that makes the task nontrivial. It has two halves: an encoder that maps the input down to a lower-dimensional code, and a decoder that maps that code back up to a reconstruction of the original. The training objective is simply to make the reconstruction match the input, typically by minimizing a reconstruction error such as mean squared error, with the weights learned by backpropagation and gradient descent.

It is a workhorse of unsupervised representation learning, and the bottleneck is why. The narrow middle layer forces the network to discard noise and redundancy and keep only the structure needed to rebuild the input, so the code becomes a compressed summary of the data. Because the targets are the inputs themselves, no labels are required, which makes autoencoders useful for dimensionality reduction, denoising, anomaly detection, and pretraining when labeled data is scarce.

The mechanism is best understood through the latent space, the space of codes the encoder produces. A well-trained autoencoder organizes that space so similar inputs map to nearby codes, learning a nonlinear manifold on which the data lives. With linear layers and a squared-error loss it recovers something close to principal component analysis, but with nonlinear activation functions and depth it captures far richer structure. Variants strengthen the representation in different ways: a denoising autoencoder corrupts the input and asks the network to restore the clean version, while a sparse autoencoder penalizes the code so that few units are active at once, related in spirit to dropout.

Autoencoders connect to much of the broader field. The variational autoencoder reshapes the bottleneck into a probability distribution, turning the model generative so it can sample new data by decoding points drawn from the latent space, and interpolating along a path there yields smooth transitions between examples. The encoder-decoder template itself, compress then reconstruct, recurs across architectures, from the convolutional neural network used for image autoencoding to the attention mechanism at the heart of sequence-to-sequence transformers and the masked-reconstruction objectives that pretrain many large models.
