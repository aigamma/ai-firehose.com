---
title: The Bitter Lesson
slug: the-bitter-lesson
kind: technique
category: Foundations and History
aliases: bitter lesson
related: machine-learning, deep-learning, symbolic-ai, neural-network, connectionism, moravecs-paradox
summary: Rich Sutton's 2019 observation that, across seventy years of AI, general methods that scale with computation have repeatedly beaten methods that build in human knowledge by hand. It is called bitter because the thing it factors out, your own hard-won understanding of the problem, is exactly what you most wanted to matter.
---

The bitter lesson is a short, deflating reading of seventy years of AI research, delivered by the reinforcement learning pioneer Rich Sutton in a 2019 essay. Its claim is blunt: over and over, the approaches that win in the long run are general methods that ride increases in computation, search and learning, rather than methods that try to build in what humans know about the problem. Researchers pour their understanding of chess, or vision, or language into a system; it works for a while; and then it is overtaken by a simpler, more general method handed more data and more compute. The lesson is what is left when that pattern is stated honestly.

The essay marshals concrete cases. In computer chess, the hand-crafted positional knowledge of grandmasters lost to brute-force search. In Go, human strategic heuristics were surpassed by systems that learned from self-play. In speech recognition and computer vision, decades of carefully engineered features, phonetic rules and edge detectors, were swept aside by neural networks that learned their own representations from raw data. The pattern is consistent: the data-hungry, compute-scaling approach of machine learning and connectionism keeps beating the knowledge-engineering approach of symbolic AI and the expert system.

It is called bitter for two reasons, and the first is psychological. A researcher wants their insight into the problem to be the thing that makes the machine smart, so being told the machine does better by learning on its own, with their cleverness factored out, is genuinely deflating, like being told the part of the work you were proudest of was the part that did not scale. The second reason is that the lesson refuses to stay learned. In the short run, building in human knowledge almost always helps, so the field reaches for it again and again, and only over a longer horizon does the scalable general method pull ahead. Sutton's prescription is to stop trying to hand-build the contents of intelligence and instead build methods that can discover those contents themselves.

The bitter lesson is descriptive history offered as prescriptive advice, and it is contested on both counts. Critics note that human knowledge still seeds the methods that scale, that the right architecture and the right data are themselves forms of built-in insight, and that compute is neither free nor infinite. But as a heuristic it has been strikingly predictive of the deep learning era, whose dominant recipe is a general architecture, a large dataset, and a great deal of computation. It pairs naturally with Moravec's paradox: the parts of intelligence hardest to hand-code, perception and motor skill, are exactly where learned, compute-scaled methods have delivered the most, the two ideas describing the same terrain from opposite directions.
