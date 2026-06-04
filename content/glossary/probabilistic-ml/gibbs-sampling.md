---
title: Gibbs Sampling
slug: gibbs-sampling
kind: technique
category: Probabilistic Machine Learning
aliases: Gibbs sampler
related: markov-chain-monte-carlo, graphical-model, latent-variable-model, bayesian-inference, variational-inference
summary: An MCMC method that samples a multivariate distribution by repeatedly drawing each variable from its conditional given the current values of all the others, useful whenever those conditionals are easy even when the joint is not. It is the special case of Metropolis-Hastings where every move is accepted, which costs nothing to tune, but it crawls badly when variables are strongly correlated.
---

Gibbs sampling draws from a complicated joint distribution over many variables when sampling the joint directly is hard but sampling each variable one at a time, conditioned on the rest, is easy. The algorithm sweeps through the variables in turn: it fixes every variable but one at their current values, draws a new value for that one from its full conditional distribution, then moves to the next variable using the value just drawn. Repeating these sweeps produces a sequence of states that forms a Markov chain whose stationary distribution is exactly the joint you wanted, and after a burn-in period the states are treated as correlated samples from the target.

Gibbs sampling is a special case of Markov chain Monte Carlo, and more precisely it is a Metropolis-Hastings algorithm in which every proposed move is accepted with probability one. That guaranteed acceptance is the payoff for the extra requirement it imposes: you must be able to sample each variable's conditional distribution. When the model is built from conditionally conjugate pieces, those conditionals have clean closed forms and Gibbs sampling becomes remarkably simple to implement, with no step size or proposal distribution to tune, which is why it became a workhorse of applied Bayesian statistics and the engine behind early general-purpose inference software.

It matters most for the structured probabilistic models where conditionals factor nicely. In a graphical model, the full conditional of any variable depends only on its neighbors, the Markov blanket, so each Gibbs update is local and cheap no matter how large the whole model is. This makes it a natural fit for latent variable models like topic models, where it alternates between sampling the topic of each word and the parameters of each topic, and for inference in Markov random fields and Bayesian networks, providing a route to Bayesian inference that sidesteps the intractable normalizing constant entirely, since only ratios within each conditional are ever needed.

The price of that simplicity is its behavior when variables are strongly correlated. Because each step moves along a single coordinate axis, the chain explores a tightly correlated joint slowly, taking many small zig-zag steps to traverse a ridge that a joint move would cross at once, which inflates the mixing time and the variance of estimates. Remedies include blocking, sampling several correlated variables together as a group, and reparameterizing the model to reduce correlation. When even the conditionals are intractable, Gibbs sampling gives way to more general Metropolis-Hastings moves or to variational inference, which trades exact samples for a fast optimization-based approximation.
