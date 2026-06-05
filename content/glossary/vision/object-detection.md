---
title: Object Detection
slug: object-detection
kind: technique
category: Computer Vision
related: image-classification, semantic-segmentation, convolutional-neural-network, feature-pyramid, vision-transformer, pooling
summary: The task of finding every object in an image and reporting both its category and a bounding box, recognition combined with localization. It is the bridge between pure recognition and acting on a scene, because a system cannot plan around "a pedestrian somewhere in this image", it needs the pedestrian's location and extent.
---

Object detection asks a model not just what is in an image but where. Its output is a list of detections, each a bounding box drawn around an object together with a category label and a confidence score. Where image classification commits to a single answer for the whole frame, detection must handle a variable number of objects, of different sizes, possibly overlapping, and decide for each region whether anything is there at all. It is the workhorse task behind autonomous driving, surveillance, robotics, and photo organization.

It matters because most real visual scenes contain many things at once, and acting on a scene requires knowing their positions. A self-driving system cannot stop at "there is a pedestrian somewhere in this image"; it needs the pedestrian's location and extent to plan around them. Detection therefore became the bridge between pure recognition and downstream decision-making, and its accuracy is measured by mean average precision, which rewards boxes that both name the object correctly and overlap the true box tightly.

Approaches split historically into two families. Two-stage detectors, exemplified by the R-CNN line, first propose candidate regions that might contain objects, then classify and refine each one; one-stage detectors like YOLO and SSD skip the proposal step and predict boxes and labels directly across a dense grid in a single pass, trading some accuracy for speed. Both rely on a backbone, usually a convolutional neural network, to extract features, and both benefit from a feature pyramid that reads features at several scales so small and large objects are detected equally well. Pooling operations such as region-of-interest pooling crop and resize the features under each candidate box to a fixed size for the classifier.

Detection is best understood as recognition plus localization layered onto a shared visual backbone, so advances in backbones flow straight through to it. The same shift seen elsewhere in vision is underway here: transformer-based detectors such as DETR reframe detection as a set-prediction problem solved by attention, dropping the hand-designed proposal and anchor machinery in favor of a vision transformer style architecture. Detection sits between classification, which ignores position, and semantic segmentation, which labels position down to the pixel.
