---
title: Consistency Model
slug: consistency-model
kind: technique
category: Generative Models
aliases: consistency models, consistency distillation
related: diffusion-model, denoising-diffusion, score-based-model, flow-matching, rectified-flow
summary: A generative model trained so that every point along a diffusion trajectory maps directly back to the same clean origin, which lets it jump from noise to a finished sample in one evaluation instead of the dozens or hundreds a diffusion model needs. It attacks diffusion's central weakness, speed, by changing what the network predicts rather than by taking smaller steps.
---

Consistency models attack the central weakness of diffusion models: speed. A diffusion model generates by starting from noise and removing a little of it over many sequential steps, each a full network evaluation, so producing one sample can take dozens or hundreds of passes, fine for offline batches but painful for interactive use. Consistency models aim to collapse that long walk into a single leap.

The idea is in the name. The diffusion process defines a trajectory from a clean data point out to pure noise, and a consistency model is trained so that any point along that trajectory maps directly back to the same clean origin. If the model is consistent in this sense, then from a fully noised input it can jump straight to a finished sample in one evaluation, and a handful of steps can be used to trade a little speed for a little more quality. This is a fundamentally different objective from learning to take one small denoising step at a time, which is why it can shortcut the whole trajectory.

Such a model can be trained two ways: by distilling a pretrained diffusion teacher, learning to match the teacher's trajectory in far fewer steps, or trained from scratch in isolation. Either way the payoff is one-step or few-step generation at quality approaching the slow diffusion baseline, which is what makes near-real-time image generation practical.

Consistency models sit alongside other approaches to fast sampling, like rectified flow, that all try to straighten or shortcut the curved path a standard diffusion or score-based model must integrate. They share the underlying mathematics of diffusion while changing what the network is trained to predict, the recurring theme of fast-sampling research: keep the quality of the slow process while paying for far fewer network calls.
