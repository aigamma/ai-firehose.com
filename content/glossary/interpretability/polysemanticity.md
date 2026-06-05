---
title: Polysemanticity
slug: polysemanticity
kind: technique
category: Mechanistic Interpretability
aliases: polysemantic neurons, polysemantic
related: superposition, sparse-autoencoder, mechanistic-interpretability, feature-visualization, circuit, linear-representation-hypothesis
summary: The observation that a single neuron in a trained network often responds to several unrelated concepts at once, which makes neurons poor units of interpretation and is understood as the surface symptom of superposition. It is the visible symptom, superposition the underlying cause, and recognizing it is what redirected the field from reading neurons one at a time toward recovering the features they entangle.
---

Polysemanticity is the property of a neuron that fires for multiple, semantically unrelated things. Inspect the inputs that most excite a given unit and you frequently find a grab-bag: a vision neuron that responds to cat faces, the fronts of cars, and a particular pattern of foliage, or a language neuron that activates on Python syntax, formal legal phrasing, and certain proper nouns. The neuron is not broken; it is genuinely participating in the computation for all of these. It simply does not correspond to any single human concept, which is exactly what makes it polysemantic.

This phenomenon matters because it defeats the most natural strategy for understanding a network. If each neuron stood for one idea, interpreting a model would reduce to labeling its neurons, and a mechanistic account would almost write itself. Polysemanticity says that hope is misplaced: the neuron is the wrong unit of analysis. Recognizing this reframed the entire field, redirecting effort away from reading neurons one at a time and toward recovering the features, the actual directions in activation space, that the network uses. Almost every modern interpretability tool is shaped by the need to get past polysemantic neurons.

The accepted explanation for polysemanticity is superposition, and the symptom-versus-cause relation is the keeper. A network has strong incentive to represent more features than it has neurons, and high-dimensional geometry lets it do so by storing features as overlapping, near-orthogonal directions rather than on individual neuron axes; when several of those directions pass through one neuron, that neuron inherits a piece of each, and so appears to respond to all of them. Polysemanticity is therefore the visible symptom and superposition the underlying cause: the neuron looks confused only because it is being read in the wrong basis, mixing signals that would be clean if separated.

Because polysemanticity is what stands between raw activations and an interpretable circuit, undoing it is the explicit goal of the sparse autoencoder, which learns an overcomplete dictionary under a sparsity penalty so that each recovered feature is monosemantic, responding to a single concept. The distinction also sharpens what the linear representation hypothesis claims: meaning lives along directions in activation space, not in the firing of any one coordinate, so a polysemantic neuron is just a coordinate that several meaningful directions happen to cross. Understanding polysemanticity is the entry point to understanding why interpretability had to move from neurons to features in the first place.
