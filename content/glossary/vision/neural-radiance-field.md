---
title: Neural Radiance Field
slug: neural-radiance-field
kind: technique
category: Computer Vision
aliases: NeRF, neural radiance fields
related: gaussian-splatting, multilayer-perceptron, vision-transformer, diffusion-model
summary: A method that represents a 3D scene as a continuous function, a small neural network mapping a 3D point and viewing direction to color and density, trained from a set of 2D photos so it can render the scene from any new viewpoint.
---

A neural radiance field, or NeRF, is a strikingly simple idea that transformed 3D computer vision: represent an entire scene as a function, not a mesh or a point cloud. The function is a small neural network (a multilayer perceptron) that takes a 3D position and a viewing direction and returns the color and density of the scene at that point. To render an image, you march rays from the camera through this field and accumulate color and opacity along each ray (volume rendering), producing a view.

The magic is how it is trained. Given a few dozen ordinary photos of a scene from known camera positions, you optimize the network so that the views it renders match those photos. Once fit, the network can render the scene from any new viewpoint, including ones never photographed, with photorealistic detail, reflections, and transparency. This novel-view synthesis from a handful of images, introduced in 2020, was a leap over prior 3D reconstruction.

It set off an enormous wave of research and found uses in graphics, virtual and augmented reality, robotics, and 3D content creation, and the function-as-scene idea influenced how people think about implicit representations.

Its original limitations were practical: training a NeRF took hours and rendering was slow, and each network captured only one scene. A long line of work attacked the speed, and gaussian splatting later offered an explicit, rasterizable alternative that achieves real-time rendering, which has displaced NeRF for many applications while the implicit-field idea remains foundational.
