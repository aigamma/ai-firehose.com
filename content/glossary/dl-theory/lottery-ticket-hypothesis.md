---
title: Lottery Ticket Hypothesis
slug: lottery-ticket-hypothesis
kind: technique
category: Deep Learning Theory
aliases: winning ticket, lottery tickets
related: regularization, generalization, knowledge-distillation, quantization, inductive-bias, neural-network
summary: The conjecture that a randomly initialized dense network already contains a small subnetwork which, trained alone from its original initialization, matches the full network's accuracy. Its deeper implication is that overparameterization helps mainly by buying more "lottery tickets", a search advantage in finding a trainable solution, not a representational necessity.
---

The lottery ticket hypothesis makes a precise and surprising claim about why large networks train well. Proposed by Jonathan Frankle and Michael Carbin in 2018, it says that inside a randomly initialized dense network there exists a sparse subnetwork, a "winning ticket", that can be trained on its own to the same accuracy as the full model in the same number of steps, provided it keeps the exact weights it was assigned at initialization. The full network's success is then partly the success of finding and training one of these lucky subnetworks among the many it contains.

The evidence comes from a specific recipe, iterative magnitude pruning: train a network, remove the smallest-magnitude weights, reset the survivors to their original initialization values rather than to fresh random numbers, and repeat. This routinely uncovers subnetworks with ten to twenty percent of the original weights that train to full accuracy. The reset step is essential, and it is where the metaphor lives: the same sparse structure, if reinitialized randomly, trains far worse, so the winning combination is the connectivity pattern together with that particular starting point. The network held a winning ticket all along.

The hypothesis matters because it separates two things usually conflated: how many parameters a network needs to represent a good solution, and how many it needs to find one by gradient descent. The first number can be small, as pruning shows, but the second appears to be large. Overparameterization seems to help mainly by buying more lottery tickets, raising the odds that some trainable sparse subnetwork sits inside the random initialization, which reframes overparameterization as a search advantage rather than a representational necessity and ties it to the same generalization puzzle as the neural tangent kernel and double descent.

Practically, the lottery ticket hypothesis reshaped how researchers think about pruning, sparsity, and efficient training. If winning tickets could be identified early, one could train a small network from the start and skip most of the cost, a goal pursued under names like early-bird tickets and pruning at initialization. It connects to compression methods such as quantization and knowledge distillation, which also seek a compact model that preserves a large one's behavior, and it remains a live question how reliably winning tickets transfer across datasets, scales, and architectures.
