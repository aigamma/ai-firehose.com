---
title: Elo Rating
slug: elo-rating
kind: technique
category: Evaluation and Benchmarks
aliases: Elo, Elo score, Bradley-Terry rating
related: llm-as-judge, mmlu, calibration, humaneval
summary: A method for ranking competitors from pairwise win-loss outcomes, originally for chess, now widely used to rank language models from head-to-head preference votes. The absolute numbers are arbitrary, only the difference between two ratings carries meaning (mapping through a logistic curve to a win probability), and the method's load-bearing assumptions, a single skill axis and transitivity, are exactly what intransitive model preferences can violate.
---

The Elo rating, named for the physicist Arpad Elo who devised it for chess in the 1960s, is a way to turn a stream of one-on-one contests into a single number per competitor that predicts who will beat whom. Each player or model holds a rating; the difference between two ratings maps, through a logistic curve, to the probability that one beats the other. A 400-point gap, in the conventional scaling, corresponds to roughly a 10-to-1 expected win ratio. The absolute numbers are arbitrary and anchored only by convention; what carries meaning is the difference between two ratings.

For language models the Elo rating has become the dominant way to measure subjective quality that no fixed-answer benchmark can capture. Platforms like Chatbot Arena show anonymous users two model responses to the same prompt and ask which is better; each vote is a match, and the aggregate produces a leaderboard. This matters because helpfulness, style, and conversational quality resist multiple-choice scoring: there is no answer key, only preferences. Elo converts thousands of noisy pairwise preferences into a stable, interpretable ranking, sidestepping the saturation and contamination problems that plague static benchmarks like mmlu.

Computation is incremental in the classical formulation. Before a match each side has an expected score from the logistic of their rating difference; after the match the winner gains and the loser sheds points in proportion to how surprising the result was, scaled by a constant called the K-factor that sets how fast ratings move. In the language-model setting a batched, order-independent variant is preferred: the win-loss records are fit all at once with a Bradley-Terry model (maximum-likelihood logistic regression over the outcomes), which removes the path dependence of sequential updates and yields confidence intervals on each rating.

The method has real limitations, and the deepest are its assumptions. Elo assumes a single latent skill axis and transitivity (if A beats B and B beats C, A should beat C), but model preferences can be intransitive and prompt-dependent, so one number flattens genuine structure. Ratings drift with the judge population and the prompt mix, making cross-leaderboard comparison unsafe, and they are gameable: a chatty, confident, sycophantic style can win human votes without being more correct, the same calibration failure that makes human preference an imperfect proxy for truth. Sparse or non-random matchups also widen the confidence intervals, so small rating gaps near the top are frequently not statistically significant.

The Elo rating is the natural scoring layer on top of llm-as-judge and human pairwise evaluation, the same way accuracy sits on top of a multiple-choice test like mmlu. Where a benchmark needs a ground-truth key, Elo needs only a verdict of which of two outputs is better, which is why it has become the standard currency for ranking open-ended model quality.
