---
title: Superposition
slug: superposition
kind: technique
category: Mechanistic Interpretability
aliases: superposition hypothesis, feature superposition
related: polysemanticity, sparse-autoencoder, mechanistic-interpretability, circuit, feature-visualization, linear-representation-hypothesis
summary: The phenomenon in which a neural network represents more features than it has dimensions by storing them as overlapping, non-orthogonal directions in activation space, which is the leading explanation for why individual neurons are hard to interpret.
---

Superposition is the hypothesis that neural networks encode many more distinct features than they have neurons or dimensions to dedicate one apiece. Rather than assigning each concept its own clean axis, the network packs concepts into the activation space as a set of directions that are not mutually orthogonal, letting them overlap. The model tolerates the resulting interference because most features are rare and seldom co-occur, so on any given input only a few are active and the cross-talk stays small. In effect the network is performing a learned form of compression, trading a little noise for a great deal more representational capacity.

This idea matters because it dissolves a long-standing puzzle and reframes the entire interpretability project. Early hopes that each neuron would correspond to a single understandable concept ran aground on polysemanticity: neurons that fire for unrelated things, a cat, a car door, and a particular grammatical construction. Superposition explains polysemanticity as its surface symptom. If the true features outnumber the neurons, the network must route several features through each neuron, and the neuron looks confused only because it is being asked to carry signals that are clean in a different basis. The implication is that the neuron is the wrong unit of analysis; the feature, a direction in activation space, is the right one.

The mechanism rests on a fact from high-dimensional geometry. In a space of n dimensions you can fit only n strictly orthogonal vectors, but you can fit exponentially many vectors that are merely almost orthogonal, with small pairwise overlaps. A network exploits this slack: when features are sparse, the occasional interference between near-orthogonal directions is cheaper than the cost of leaving features unrepresented. Toy models trained on synthetic data reproduce the effect cleanly, showing features arranging themselves into structured geometric configurations, sometimes regular polytopes, as the pressure to compress trades off against the pressure to keep interference low.

Superposition is what makes mechanistic interpretability hard, and it directly motivates the tools built to overcome it. Because features lie in superposed directions rather than on neuron axes, you cannot read them off by inspecting neurons one at a time. The sparse autoencoder is the dominant response: it learns an overcomplete dictionary of directions, many more than there are neurons, under a sparsity penalty, and so disentangles the superposed code back into features that are individually monosemantic and interpretable. Understanding superposition is therefore the prerequisite for understanding why that method exists and why recovering a circuit from raw activations is rarely as simple as naming the neurons involved.
