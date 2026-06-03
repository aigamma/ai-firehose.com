---
title: World Model
slug: world-model
kind: technique
category: Frontier Architectures
aliases: world models, learned world model, predictive world model
related: neural-ode, energy-based-model, state-space-model, mamba
summary: A learned internal model of how an environment evolves, which an agent uses to predict the consequences of actions and to plan or train inside its own imagination rather than only by acting in the real world.
---

A world model is a learned model of an environment's dynamics: given the current situation and a proposed action, it predicts the next situation, and often the resulting reward. The term is most associated with reinforcement learning and robotics, where an agent that possesses such a model can simulate the future internally. Rather than learning purely by trial and error in the real environment, which is slow, expensive, and sometimes dangerous, the agent can roll the world model forward in imagination, evaluate many hypothetical action sequences, and act on the one that looks best. The model becomes a fast, private sandbox in which to plan.

This matters because data efficiency and foresight are central bottlenecks in sequential decision making. A model-free agent must experience an outcome to learn from it; a model-based agent can anticipate outcomes it has never directly seen by composing what its world model has learned about the environment's regularities. Learning to predict the world also yields a rich representation as a by-product, because compressing the stream of observations into something predictive forces the model to discover the underlying state, the objects, and the causal structure that drive what happens next. That representation can then be reused for control, for exploration, and for transfer to new tasks.

In practice a world model usually has two parts: a perception component that compresses raw high-dimensional observations, such as images, into a compact latent state, and a dynamics component that predicts how that latent state changes over time under the agent's actions. The dynamics are a sequence model, and so the choice of sequence architecture matters directly. Recurrent networks were the early default; more recent systems use transformers, and the linear-time families in this category, including the state space model and mamba, are attractive here because planning may require rolling the dynamics forward over many steps cheaply. Continuous-time formulations like the neural ODE are a natural fit when the environment is physical and governed by differential equations.

World models connect the frontier architectures in this category to the broader goals of agentic AI. The famous early demonstration trained an agent almost entirely inside a compact learned simulation of a game and then transferred the policy back to the real environment, and the idea has since scaled to general agents that learn behaviors across many domains from imagined rollouts. The recurring theme is that prediction is the foundation of planning: an agent that can accurately model what will happen next holds, in effect, a differentiable simulator of its world, and energy-based formulations have been proposed as one principled way to score how plausible a predicted future is.
