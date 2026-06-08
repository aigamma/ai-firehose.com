---
title: Tree of Thoughts
slug: tree-of-thoughts
kind: technique
category: Inference and Sampling
aliases: tree of thoughts, ToT, tree search reasoning
related: chain-of-thought, self-consistency, reasoning-model, monte-carlo-tree-search, planning
summary: A reasoning method that explores candidate steps as a branching tree, evaluating and expanding promising branches and backtracking from dead ends, so a model searches over solution paths instead of committing to one linear chain. It is the step from reasoning-as-a-path to reasoning-as-search: where chain-of-thought has no lookahead and self-consistency never revisits a chain, tree of thoughts adds explicit exploration and backtracking.
---

Tree of thoughts generalizes chain-of-thought from a single line of reasoning into a search over many. A chain of thought commits to one sequence of steps; if an early step is a mistake, the whole chain inherits it. Tree of thoughts instead treats each partial solution as a node and each next reasoning step as a branch, building a tree of possible paths the model can explore, evaluate, and prune.

The loop has three parts. The model proposes several candidate next thoughts from the current state, rather than just one; it then evaluates those states, often by prompting itself to judge how promising each is or whether it is still on track, producing a score; and a search procedure, such as breadth-first or depth-first expansion or a Monte Carlo tree search style rollout, uses those scores to decide which branches to expand and which to abandon, and critically it can backtrack, returning to an earlier node when a path reaches a dead end and trying a different branch.

This makes the difference from related methods clear. Chain-of-thought is a single path with no lookahead; self-consistency samples many independent complete chains and votes, but never revisits or repairs a chain mid-flight; tree of thoughts adds explicit exploration and backtracking, which helps most on problems that require planning, search, or trying several approaches, such as puzzles, games, and constraint problems, where a greedy first attempt usually fails.

The cost is steep, since proposing and evaluating many branches multiplies the number of model calls, and the quality of the search depends heavily on whether the model can reliably judge its own intermediate states. Learned reasoning models internalize some of this search-like behavior through training, which can reduce the need to orchestrate an explicit tree at inference time, but the explicit method remains a clear and useful framing of reasoning as search.
