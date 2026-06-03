---
title: Kalman Filter
slug: kalman-filter
kind: technique
category: Probabilistic Machine Learning
aliases: Kalman filtering, linear quadratic estimation
related: hidden-markov-model, gaussian-distribution, bayes-theorem, graphical-model, latent-variable-model, conditional-probability
summary: A recursive algorithm that estimates the hidden state of a linear dynamical system from noisy measurements, maintaining a Gaussian belief that it updates optimally as each new observation arrives.
---

A Kalman filter is a recursive algorithm for tracking the hidden state of a system that evolves over time when you can only see noisy measurements of it. It assumes the state moves according to a linear dynamics model corrupted by Gaussian noise, and that each measurement is a linear function of the state plus more Gaussian noise. Under those assumptions the filter maintains a belief about the current state as a [Gaussian distribution](gaussian-distribution), summarized by a mean, the best estimate, and a covariance, the uncertainty around it, and it updates that belief every time a new measurement arrives.

The Kalman filter matters because it is the provably optimal estimator for linear-Gaussian systems and because it runs in constant memory and time per step, which makes it ideal for real-time use on limited hardware. It has guided spacecraft since the Apollo program, and it sits inside GPS receivers, aircraft autopilots, robot localization, sensor fusion stacks, and economic time-series models. Whenever a quantity changes smoothly but can only be observed through imperfect sensors, the Kalman filter is the classical answer for fusing the prediction from a motion model with the evidence from a measurement.

Each cycle has two steps that mirror the logic of [Bayes' theorem](bayes-theorem). In the predict step the filter pushes its current belief forward through the dynamics model, which shifts the mean and inflates the covariance because uncertainty grows when you extrapolate. In the update step a new measurement arrives and the filter blends prediction and observation, weighting each by its relative confidence through a quantity called the Kalman gain. When the sensor is precise the update leans on the measurement; when the sensor is noisy it leans on the prediction. Because everything stays Gaussian, both steps are closed-form matrix operations with no sampling or iteration required.

The Kalman filter is the continuous-state, linear-Gaussian member of the same family as the [hidden Markov model](hidden-markov-model): both are state-space [latent variable models](latent-variable-model), and both are chain-structured [graphical models](graphical-model) in which a hidden state generates observations over time. The difference is that the hidden Markov model has discrete states and uses summation over them, while the Kalman filter has a real-valued state and uses Gaussian algebra. When real systems violate the linear-Gaussian assumptions, extensions take over: the extended and unscented Kalman filters linearize or sample around the current estimate to handle nonlinear dynamics, and the particle filter drops the Gaussian assumption entirely in favor of sample-based inference. The plain Kalman filter remains the exact, elegant base case from which that whole lineage descends.
