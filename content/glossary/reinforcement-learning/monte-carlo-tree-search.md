---
title: Monte Carlo Tree Search
slug: monte-carlo-tree-search
kind: technique
category: Reinforcement Learning
aliases: MCTS, UCT
related: reinforcement-learning, exploration-exploitation, value-function, model-based-reinforcement-learning, markov-decision-process, bellman-equation
summary: A planning algorithm that searches a decision tree by selectively simulating many possible futures, concentrating its effort on the most promising lines of play, famously the search method behind AlphaGo. It grows the tree asymmetrically, deepening good branches and barely touching bad ones, and its deepest idea is the loop between search and learning: the search produces better moves than the raw network, which is then trained to imitate the search.
---

Monte Carlo tree search, or MCTS, is a decision-time planning algorithm that decides what to do by looking ahead. Rather than evaluating every possible sequence of moves, which is infeasible in games like Go where the branching is astronomical, it builds a search tree incrementally and spends its budget simulating the lines of play that look most worth examining. It is best known as the search engine inside AlphaGo and AlphaZero, where it was paired with deep neural networks to reach superhuman play.

The method matters because it makes lookahead practical in enormous state spaces without needing a hand-crafted evaluation function. Classic game-tree search like minimax must evaluate positions with expert-designed heuristics and explores rather uniformly. MCTS instead estimates the value of a position by statistics gathered from simulations, and it grows the tree asymmetrically, deepening promising branches while barely touching unpromising ones. Because it requires a model that can simulate the consequences of actions, it is a form of model-based-reinforcement-learning.

Each iteration runs four phases. Selection walks down the existing tree from the root, at each node choosing a child by a rule that balances the exploration-exploitation tradeoff, typically the UCT formula (Upper Confidence bounds applied to Trees), which favors children with high estimated value and those visited few times. Expansion adds a new node at the frontier. Simulation, the Monte Carlo part, plays out from there to a terminal outcome, originally with random moves. Backpropagation then sends the result back up the path, updating the visit counts and value estimates of every node touched. Thousands of such iterations sharpen the root's action values, and the most-visited action is played.

The leap to superhuman play came from replacing the weakest parts of this loop with learned functions, and the loop itself is the real lesson. AlphaGo used a policy network to bias selection toward good moves and a value-function network to evaluate positions, so the rollouts no longer had to be random or even run to the end. AlphaZero went further, learning both networks purely from self-play with no human games, using MCTS itself as a policy-improvement operator: the search produces better move probabilities than the raw network, and the network is trained to imitate the search. This tight loop between search and learning is the algorithm's deepest idea.

MCTS is an anytime algorithm: stop it whenever the compute budget runs out and it returns the best action found so far, with quality improving smoothly as more simulations are allowed. It is most natural in deterministic, discrete settings such as board games, but variants extend it to stochastic and continuous problems. The broader lesson it taught the field, that combining learned value estimates with explicit search yields more than either alone, continues to shape work on planning agents and reasoning systems.
