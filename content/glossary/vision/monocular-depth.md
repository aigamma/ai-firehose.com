---
title: Monocular Depth Estimation
slug: monocular-depth
kind: technique
category: Computer Vision
aliases: monocular depth, monocular depth estimation, single-image depth
related: 3d-understanding, semantic-segmentation, convolutional-neural-network, vision-transformer, gaussian-splatting
summary: Recovering how far away each pixel is from a single ordinary photo, with no second camera or depth sensor to triangulate from. It is a fundamentally ill-posed problem, infinitely many 3D scenes project to the same flat image, that becomes solvable only because a model learns strong priors about how the world is usually shaped.
---

Two eyes, or two cameras, recover depth by triangulation: the same point shifts between the views, and the shift encodes distance. Monocular depth estimation throws that away and asks for depth from a single image, which is, strictly speaking, impossible: infinitely many three-dimensional scenes project to the exact same flat picture, so no amount of geometry can invert it uniquely. The problem is ill-posed by construction, and that is what makes it interesting.

It becomes solvable only by learning priors. A model trained on enough images absorbs the regularities the geometry alone cannot supply: objects lower in the frame tend to be closer, textures shrink with distance, known objects imply scale, shadows and occlusion order surfaces. The network is not triangulating; it is recognizing the cues a human also uses to perceive depth in a photograph, and predicting the depth map that is most consistent with how the world usually looks.

A persistent subtlety is scale ambiguity. From one image a model can often tell relative depth, this is nearer than that, far more reliably than absolute distance in meters, because the same scene shrunk by half looks identical at a different scale. Much of the field's progress has been in training on large, diverse data to produce depth that is sharp and consistent, and in deciding whether the task is relative ordering or true metric depth, which matters enormously for whether a robot can act on the output.

Monocular depth matters because cameras are everywhere and depth sensors are not, so recovering geometry from ordinary images unlocks 3D understanding cheaply for phones, cars, and drones. It is a clean case study in how learning rescues an ill-posed problem: where classical vision needs two views to be well-determined, a model with strong enough priors can hallucinate the missing dimension plausibly enough to be useful, which is both its power and the reason its failures can be confidently wrong.
