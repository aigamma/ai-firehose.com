---
title: Kalman Filter
slug: kalman-filter
kind: technique
category: Probabilistic Machine Learning
aliases: Kalman filtering, linear quadratic estimation
related: hidden-markov-model, gaussian-distribution, bayes-theorem, graphical-model, latent-variable-model, conditional-probability
summary: A recursive algorithm that tracks the hidden state of a linear system from noisy measurements, keeping a Gaussian belief it updates optimally as each observation arrives. It is the provably best estimator for linear-Gaussian systems, runs in constant time per step, and its predict-then-update cycle is Bayes' theorem in closed form, with a "Kalman gain" that blends prediction and measurement by their relative confidence.
---

A Kalman filter tracks the hidden state of a system that evolves over time when you can only see noisy measurements of it. It assumes the state moves by a linear dynamics model corrupted by Gaussian noise, and that each measurement is a linear function of the state plus more Gaussian noise. Under those assumptions the filter maintains its belief about the current state as a Gaussian distribution, summarized by a mean, the best estimate, and a covariance, the uncertainty around it, and it updates that belief every time a new measurement arrives.

It matters because it is the provably optimal estimator for linear-Gaussian systems and runs in constant memory and time per step, which makes it ideal for real-time use on limited hardware. It has guided spacecraft since the Apollo program, and it sits inside GPS receivers, aircraft autopilots, robot localization, sensor-fusion stacks, and economic time-series models. Whenever a quantity changes smoothly but can only be observed through imperfect sensors, the Kalman filter is the classical answer for fusing a motion model's prediction with a measurement's evidence.

Each cycle has two steps that mirror the logic of Bayes' theorem. In the predict step the filter pushes its current belief forward through the dynamics model, which shifts the mean and inflates the covariance because uncertainty grows when you extrapolate. In the update step a new measurement arrives and the filter blends prediction and observation, weighting each by its relative confidence through a quantity called the Kalman gain: when the sensor is precise the update leans on the measurement, when the sensor is noisy it leans on the prediction. Because everything stays Gaussian, both steps are closed-form matrix operations with no sampling or iteration.

The Kalman filter is the continuous-state, linear-Gaussian member of the same family as the hidden Markov model: both are state-space latent-variable models, and both are chain-structured graphical models in which a hidden state generates observations over time. The difference is that the hidden Markov model has discrete states and sums over them, while the Kalman filter has a real-valued state and uses Gaussian algebra. When real systems break the linear-Gaussian assumptions, extensions take over: the extended and unscented Kalman filters linearize or sample around the current estimate for nonlinear dynamics, and the particle filter drops the Gaussian assumption entirely for sample-based inference. The plain Kalman filter remains the exact, elegant base case from which that whole lineage descends.
