---
title: Perceptron
slug: perceptron
kind: technique
category: Foundations and History
aliases: perceptrons
related: neural-network, connectionism, machine-learning, deep-learning, ai-winter, symbolic-ai
summary: The first machine that learned from its own mistakes: a single artificial neuron, built in hardware in 1958, that adjusts its weights until it can split two classes with a line. Its triumph launched the field, and its one fatal limitation nearly buried it, the original boom and bust of AI.
---

The perceptron was the first device that learned from being wrong. Frank Rosenblatt built it in 1958 not as a program but as a room-sized machine, the Mark I, with motor-driven dials standing in for weights, and it learned to tell simple shapes apart by turning those dials whenever it made a mistake. The press lost its head: the New York Times relayed the Navy's expectation of a machine that would soon walk, talk, see, write, and reproduce itself. Underneath the hype sat a genuinely new idea, a machine whose behavior was not written down in advance but tuned by experience.

What it actually does is draw a line. A perceptron multiplies each input by a weight, sums them, and fires if the total clears a threshold, which geometrically means it slices the input space with a flat boundary and reports which side a point lands on. The learning rule is almost embarrassingly plain: when the perceptron misclassifies an example, nudge each weight a little in the direction that would have fixed it. Rosenblatt proved this loop is guaranteed to find a separating line whenever one exists, the perceptron convergence theorem, which is what turned "a machine that learns" from a slogan into mathematics.

Then the line became the problem. In 1969 Marvin Minsky and Seymour Papert proved, in a book titled simply Perceptrons, that a single perceptron cannot learn exclusive-or, the function true when exactly one of two inputs is on. No straight line separates XOR's two classes, and no amount of training conjures one. The limitation was real but narrow, since stacking perceptrons into layers erases it completely, yet nobody then knew how to train such stacks, and the negative result landed like a verdict. Money and enthusiasm drained out of neural research for over a decade, the first AI winter, set off in part by a proof about a function of two bits.

The thaw came in the 1980s, when backpropagation finally supplied a way to train the very multilayer networks Minsky and Papert had said were needed, and the perceptron was revealed as the seed of everything after it. Each artificial neuron in a modern network is a perceptron with its hard threshold softened into a smooth activation function and trained by gradient descent rather than the original rule. The whole tower of deep learning is this one primitive composed billions of times. The perceptron sits on a hinge in the field's history: proof that machines could learn, a flaw stark enough to nearly end the project, and a design simple enough that its descendants now run at the scale of the entire internet.
