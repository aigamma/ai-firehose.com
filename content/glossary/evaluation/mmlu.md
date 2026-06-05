---
title: MMLU
slug: mmlu
kind: technique
category: Evaluation and Benchmarks
aliases: Massive Multitask Language Understanding
related: benchmark-contamination, perplexity, f1-score, llm-as-judge, humaneval
summary: A multiple-choice benchmark of about 16,000 questions spanning 57 subjects, from elementary mathematics to professional law and medicine, used to measure the broad knowledge and reasoning of a language model with a single accuracy number. It captured breadth so a high score is hard to fake by overfitting one task, but because the questions are public and old, it is the motivating example of benchmark contamination: high scores can reflect having seen the answers.
---

For a stretch of the large-model era, the first number anyone reached for to argue a system was frontier-class was its MMLU score. Massive Multitask Language Understanding, introduced in 2020, poses roughly sixteen thousand four-option multiple-choice questions drawn from fifty-seven subjects, ranging from elementary mathematics and US history to college physics, professional law, clinical medicine, and moral philosophy. The model picks one of the four answers, and the reported metric is plain accuracy: the fraction of questions answered correctly, averaged over all subjects.

MMLU matters because it tried to capture breadth rather than a single skill. Earlier benchmarks tested one capability at a time, but MMLU bundles dozens of academic and professional domains into one number, so a high score is hard to achieve by overfitting a narrow task. For several years it was the chart that vendors led with, the common yardstick by which a new model was judged "GPT-4 class" or not, and it remains a widely cited reference point even as the field migrates to harder successors like MMLU-Pro and GPQA.

The metric is computed in a few-shot setting. Each question is shown to the model alongside a small number of worked examples (the original protocol used five), and the model is asked to produce the letter of the correct choice. Scoring usually compares the probability the model assigns to each of the four answer tokens and counts the highest-probability choice as the model's answer, though chat models are increasingly graded by parsing the letter out of their free-form response. Because there are four options, random guessing scores about 25 percent, which is the floor against which any real result is read.

MMLU's limitations are by now well documented, and the keeper is the deepest: because the questions are public and old, they leak into pretraining corpora, so high scores can reflect benchmark-contamination, the model having effectively seen the answers during training, rather than genuine understanding. The dataset also contains a non-trivial number of mislabeled or ambiguous items, which caps the achievable accuracy below 100 percent and adds noise to fine comparisons near the top of the leaderboard. And because every question is multiple choice, the format rewards recognition over generation and tells you nothing about whether a model can produce a correct answer unprompted, reason through a novel problem, or avoid confident errors (see calibration).

MMLU is the canonical example of an extrinsic, task-level benchmark, the complement to an intrinsic measure like perplexity: perplexity asks whether the model predicts text well, MMLU asks whether the model knows things. Its vulnerability to benchmark-contamination is the motivating example for that concept, and its multiple-choice format is precisely what newer free-response and llm-as-judge evaluations were built to move beyond.
