---
title: Scaling Laws
slug: scaling-laws
kind: technique
category: Transformers and LLMs
aliases: scaling law, Chinchilla scaling
related: large-language-model, transformer, next-token-prediction, tokenization
summary: The empirical regularity that a transformer's loss falls as a smooth power law in model size, data, and compute, predictable enough to forecast a giant model from small pilot runs. It turned model-building from guesswork into planning, and its key caveat is that smooth aggregate loss can mask abilities that emerge abruptly at scale.
---

Scaling laws are the empirical regularities that govern how large language models improve as they grow. Across many orders of magnitude, the test loss of a transformer falls as a smooth power-law function of three quantities: the number of parameters, the number of training tokens, and the total compute spent. The striking part is how clean and predictable the relationship is: plotted on logarithmic axes, loss versus scale traces a nearly straight line, which means the performance of a model far larger than any yet trained can be extrapolated from a series of smaller runs.

These laws matter because they turned model building from guesswork into planning. Before they were characterized, it was unclear whether pouring in more compute would keep paying off or hit a wall, and the finding that returns continue smoothly, with no sign of saturation across the studied range, is much of the rationale for the enormous training runs of the past several years. It also lets a team decide, given a fixed compute budget, roughly what loss a final model will reach, and catch problems early when a small pilot run lands off the predicted curve.

A central refinement concerns how to spend a fixed budget between model size and data. Early work leaned toward making models as large as possible, but the later Chinchilla analysis showed many large models were badly undertrained, and that for compute-optimal training, parameters and training tokens should grow in roughly equal proportion, implying smaller models trained on far more data than was then customary. This reframing changed how the field allocates budget and explains why newer models are often not the largest but are trained on dramatically more tokens, until the supply of high-quality text itself becomes the binding constraint.

Scaling laws come with important caveats, and the sharpest is worth stating. They predict average next-token loss, a smooth aggregate, yet specific downstream abilities can appear to emerge more abruptly as scale crosses some threshold, so loss and capability do not track one another perfectly. The laws are also empirical fits, not guarantees, and depend on the architecture, data distribution, and tokenization staying fixed; change the recipe and the constants shift. Even so, the basic message, that transformer performance is a stable function of scale, is one of the most consequential facts behind the current trajectory of large language models.
