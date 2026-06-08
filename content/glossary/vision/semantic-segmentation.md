---
title: Semantic Segmentation
slug: semantic-segmentation
kind: technique
category: Computer Vision
related: object-detection, image-classification, convolutional-neural-network, feature-pyramid, pooling, vision-transformer
summary: The task of labeling every pixel with the category it belongs to, producing a dense map that traces objects' exact silhouettes rather than boxing them. It is the dense-prediction extreme of vision, and its architectural signature is the encoder-decoder with skip connections, which recovers the sharp boundaries an aggressively downsampled encoder would otherwise lose.
---

Semantic segmentation is image understanding at the finest spatial grain: it labels every single pixel with the category of the thing it belongs to. The output is a map the same size as the input, where one region is painted "road", another "car", another "sky". Unlike object detection, which wraps objects in rectangular boxes, segmentation traces their exact silhouettes, and unlike image classification, which emits one label for the whole image, it emits millions, one per pixel. The plain "semantic" variant treats all cars as the same class; the related instance segmentation task additionally separates car one from car two.

It matters wherever the precise shape and extent of regions drives a decision. Medical imaging uses it to outline a tumor or an organ down to the boundary, autonomous vehicles use it to know exactly which pixels are drivable road, and satellite analysis uses it to map land cover. Anywhere a bounding box is too coarse, because the object is irregular or the boundary itself is the point, segmentation is the tool.

Architecturally, segmentation networks follow an encoder-decoder shape, and that shape is the crux. An encoder, typically a convolutional neural network, progressively downsamples the image through pooling and strided convolutions to build rich, abstract features at low resolution; a decoder then upsamples those features back to full resolution, and skip connections carry fine spatial detail from early encoder layers across to the decoder so that sharp boundaries are not lost. The U-Net architecture made this encoder-decoder-with-skips pattern the template, and fully convolutional networks established that classification backbones could be repurposed for dense prediction. A feature pyramid is often used so objects at different scales are segmented consistently.

Segmentation completes the trio of core vision tasks, sitting at the dense-prediction extreme: classification answers "what", detection answers "what and roughly where", and segmentation answers "what at every pixel". Because all three read from the same kind of learned features, progress in backbones transfers across them, and the vision transformer has produced strong segmentation models that replace or augment the convolutional encoder with attention while keeping the encoder-decoder skeleton intact.
