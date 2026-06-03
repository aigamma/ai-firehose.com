---
title: Moravec's Paradox
slug: moravecs-paradox
kind: technique
category: Foundations and History
aliases: Moravec paradox
related: artificial-intelligence, symbolic-ai, the-bitter-lesson, machine-learning, deep-learning
summary: The observation that tasks humans find effortless, such as perception and movement, are extremely hard for machines, while tasks humans find hard, such as formal logic and arithmetic, are comparatively easy for machines. High-level reasoning is cheap to mechanize, low-level sensorimotor skill is not.
---

Moravec's paradox, named for the roboticist Hans Moravec and articulated in the 1980s by Moravec along with Marvin Minsky and others, captures a counterintuitive inversion of difficulty in artificial intelligence. The things that feel effortless to a person, recognizing a face, walking across a cluttered room, picking up a cup, grasping the meaning of a spoken sentence, turn out to be staggeringly hard to build into a machine. The things that feel like hard intellectual work, playing chess, proving theorems, doing long arithmetic, turn out to be comparatively easy to mechanize. The hierarchy of difficulty for machines is roughly the reverse of the one we feel.

The standard explanation is evolutionary. Perception and motor control are the products of hundreds of millions of years of natural selection, optimized so thoroughly and run so far below conscious awareness that they feel like nothing at all from the inside. Abstract reasoning, by contrast, is an evolutionarily recent and thin veneer, which is why it feels effortful and is exactly the kind of deliberate, rule-following process that early symbolic AI could imitate. As Moravec put it, we are most aware of the parts of our minds that are youngest and least reliable, and least aware of the ancient machinery that does the genuinely hard computation.

The paradox matters because it explains the actual trajectory of AI. Symbolic AI scored its early wins precisely on the abstract, rule-governed tasks the paradox predicts are easy: theorem provers, chess programs, and the expert system. Meanwhile the sensorimotor problems stayed stubbornly unsolved for decades, which is why robust machine vision, speech, and dexterous robotics arrived so much later than chess engines. The paradox reframes a generation of disappointment: the field was not failing at intelligence in general, it was bouncing off the specific parts of it that are hardest to mechanize.

Moravec's paradox connects tightly to the bitter lesson. The sensorimotor skills the paradox flags as hard are exactly the ones that resisted being hand-coded as rules and that finally yielded to learned, data-driven, compute-heavy methods: deep learning is what cracked vision and speech, not better hand-written rules. The two ideas together form a coherent picture of the field's history. Reasoning was easy to program and hard for evolution to grow, perception was easy for evolution to grow and hard to program, and the methods that conquered perception did so by learning it from data rather than by anyone writing it down.
