---
title: Connectionism
slug: connectionism
kind: technique
category: Foundations and History
aliases: parallel distributed processing, PDP
related: neural-network, perceptron, symbolic-ai, deep-learning, machine-learning, the-bitter-lesson
summary: The rival school to symbolic AI, which holds that intelligence is not stored in rules but emerges from the connections among many simple units, learned from data as adjustable weights. It is the intellectual home of the neural network, and over the long run it won.
---

Connectionism begins with a refusal: knowledge is not a set of rules written down somewhere to be looked up. It is the school of thought that locates intelligence in the connections among many simple, individually unintelligent units, and holds that what a system knows lives in the strengths of those connections, the weights, learned by adjusting them in response to data. No single unit means anything, in the way no single neuron in your head holds a thought; meaning is distributed across the pattern of the whole. This is a head-on rejection of the symbolic AI premise that thinking is rule-following over explicit symbols.

The appeal has always been that this is, loosely, how the only known example of intelligence actually works. The artificial neuron is a stripped-down caricature of a brain cell summing its inputs and firing, and connectionism bets that wiring enough of them together and letting them learn will reproduce, in spirit, what evolution built. The lineage runs from the perceptron of the late 1950s through a long dormancy to the parallel distributed processing movement of the 1980s, when Rumelhart, McClelland, and Hinton showed that multilayer networks trained by backpropagation could learn the nonlinear functions a single perceptron famously could not, reviving a program that Minsky and Papert's critique had frozen.

Its strengths are precisely the weaknesses of the symbolic approach, turned inside out. A connectionist model learns directly from raw data, so it needs no human to enumerate the rules for what a cat looks like. It generalizes to inputs it has never seen, because it has captured a statistical regularity rather than memorized cases. And it degrades gracefully under noise or damage, getting gradually worse rather than failing all at once, because no single brittle rule carries the load; the knowledge is smeared across millions of numbers. These are exactly the properties that make perception and language tractable, the tasks symbolic systems could never crack.

Deep learning is simply connectionism at a scale its founders could not have pictured: the same layered units, the same learning by gradient descent, now run with billions of parameters over oceans of data, and the bitter lesson reads as a long vindication of the connectionist side of the old argument. The price is the mirror image of symbolic AI's transparency. A connectionist model's knowledge is a pattern of numbers with no human-readable rules to inspect, so it can be impossible to say why it produced a given output, which is the entire reason the field of interpretability exists. The frontier of neuro-symbolic AI is an attempt to keep connectionism's learning while recovering some of the reasoning and legibility it traded away.
