---
title: Simulated Annealing
slug: simulated-annealing
kind: technique
category: Advanced Optimization
aliases: SA, annealing optimization
related: evolutionary-strategy, bayesian-optimization, gradient-descent, loss-landscape
summary: A global optimizer for rugged landscapes that wanders by random moves, always accepting improvements and sometimes accepting worse moves, with the chance of a worse move cooled toward zero over time. That willingness to climb uphill is exactly what lets it cross the barriers that trap a strictly downhill method, and a single temperature dials the search from wild exploration to greedy descent.
---

Simulated annealing borrows its name and its mechanism from metallurgy: heat a metal and cool it slowly and its atoms settle into a low-energy, well-ordered crystal, where rapid quenching freezes in defects. The algorithm treats the objective as an energy to minimize and mimics that controlled cooling to find a low-energy configuration of the variables, which makes it a global optimizer for rugged, nonconvex landscapes where gradient-based descent would simply get trapped.

The defining trick is that simulated annealing is willing to move uphill. At each step it proposes a random nearby candidate, accepts it outright if it is better, and accepts it anyway, if it is worse, with a probability that depends on how much worse it is and on a control parameter called the temperature, the Metropolis acceptance rule. This deliberate willingness to take a worse solution is what lets the search climb out of a shallow local minimum and cross the barrier into a deeper one, the exact move a strictly downhill method like gradient descent can never make, because gradient descent follows the local slope and halts in the first basin it falls into.

The temperature is the heart of the method, and it is lowered on a schedule. Early, when it is high, almost any move is accepted and the search roams the whole landscape freely; as it cools, uphill moves grow progressively less likely, the search turns pickier and concentrates into the most promising basin, finally behaving like pure downhill descent as the temperature approaches zero. This shift from exploration to exploitation, governed by one cooling parameter, is the entire algorithm, and with a slow enough schedule it is provably guaranteed to find the global optimum, though such schedules are usually too slow to run in full.

Its real reach comes from needing no gradient, no continuity, and no convexity. It applies to discrete combinatorial problems like the traveling salesman, chip layout, and scheduling, where a gradient is undefined and gradient descent does not even apply, and it belongs to the family of derivative-free global optimizers alongside evolutionary strategies and Bayesian optimization, each striking a different bargain between exploration and exploitation. Its lasting conceptual gift is the explicit, tunable temperature that interpolates between random global search and greedy local descent.
