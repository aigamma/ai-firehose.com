---
title: Tree Search
slug: tree-search
kind: technique
category: Reinforcement Learning
aliases: tree search, search tree
related: monte-carlo-tree-search, tree-of-thoughts, planning, beam-search, markov-decision-process
summary: Exploring possible futures by branching: from the current state, consider the available actions, then the actions available after each of those, building a tree of what-ifs and searching it for a good path. It is the classical backbone of planning and game-playing, and it has returned as a way to let language models deliberate rather than answer in one pass.
---

Many problems are really questions about the future: which move, which sequence of steps, which plan leads somewhere good. Tree search answers them by branching. From the current state it enumerates the possible actions, then for each resulting state the actions available there, and so on, growing a tree of possible futures that it then searches for a path to a desirable outcome. It is the formal shape of looking ahead.

The catch is that the tree explodes. Each level multiplies the branches, so for any interesting problem the full tree is far too large to enumerate, and the entire craft of tree search is deciding which branches to explore and which to ignore. Classical game AI pruned with heuristics and alpha-beta cutoffs that skip provably worse lines; Monte Carlo tree search instead samples promising paths and uses the results to guide where to look next, balancing exploring uncertain branches against exploiting good ones, which is what powered the superhuman game-playing systems.

What makes tree search more than a game-AI relic is its return to language models. A single chain of thought is one path with no lookahead, and if it goes wrong early the answer is wrong with it; tree-of-thoughts and related methods let a model branch into several candidate lines of reasoning, evaluate them, and backtrack from dead ends, which is tree search applied to deliberation rather than to board positions. The payoff is largest on problems that genuinely require planning or trying several approaches, where a greedy first attempt usually fails.

The enduring idea is that tree search converts more computation into better decisions, deterministically and on demand. Spend more on exploring the tree and you get a better path, which is the same lever test-time compute pulls for reasoning models: thinking longer, structured as search over possibilities, is a separate axis of capability from how good any single step is. The cost is exactly that compute, so the art remains what it always was, searching the few branches that matter and ignoring the vast majority that do not.
