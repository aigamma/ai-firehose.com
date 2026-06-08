---
title: Alignment Tax
slug: alignment-tax
kind: technique
category: Alignment and Safety
aliases: alignment tax, safety tax
related: ai-alignment, rlhf, reward-modeling, scalable-oversight, constitutional-ai
summary: The cost in raw capability a model pays to be made safe and aligned, when the training that makes it helpful, honest, and harmless also makes it a little worse at some tasks. The size of that tax, and whether it can be driven to zero, is a central practical and strategic question for alignment.
---

Making a model safe is not free. The same alignment training that teaches a model to refuse harmful requests, hedge when unsure, and stay on task can also blunt its sharpness, leaving it more verbose, more cautious, or measurably weaker on some benchmark than the raw pretrained model was. That gap, the capability surrendered in exchange for good behavior, is the alignment tax.

The tax matters strategically because it shapes incentives. If alignment costs a lot of capability, then in a competitive race the aligned model loses to the unaligned one, and there is pressure to skimp on safety to stay ahead, which is exactly the dynamic safety researchers most fear. If alignment is nearly free, that pressure disappears and there is little reason not to align. So driving the alignment tax toward zero is not just an engineering nicety; it is what makes choosing safety compatible with staying competitive.

The encouraging empirical news is that the tax has fallen as methods improved. Early alignment techniques traded noticeable capability for safety, but better reward models, methods like RLHF and constitutional AI, and careful data curation have shrunk the gap, and in some cases alignment training even improves capability, because learning to follow instructions well and reason carefully is itself useful, not just safe. The relationship between helpful and harmless is not purely a tradeoff.

The alignment tax is the quiet variable behind a lot of the safety debate, because it converts a moral question into an economic one. As long as the tax is low, safety and capability point the same way and the aligned model can also be the best model; if it ever turns out to be unavoidably high, the field faces a genuine conflict between making systems capable and making them safe, which is why measuring and minimizing it is treated as core alignment work rather than an afterthought.
