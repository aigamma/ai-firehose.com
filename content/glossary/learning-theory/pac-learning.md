---
title: PAC Learning
slug: pac-learning
kind: technique
category: Learning Theory
aliases: PAC, probably approximately correct, probably approximately correct learning
related: vc-dimension, sample-complexity, generalization, empirical-risk-minimization, no-free-lunch-theorem
summary: A formal framework, due to Leslie Valiant, that defines what it means to learn a concept from examples: with high probability, a learner should output a hypothesis whose error is small, using a number of samples that grows only polynomially in the relevant parameters.
---

PAC learning, short for Probably Approximately Correct, is the foundational model of computational learning theory. Introduced by Leslie Valiant in 1984, it gives a precise mathematical answer to a question that sounds informal: when can we say an algorithm has actually learned something from data? The framework asks the learner to be approximately correct, meaning its error is below a tolerance epsilon, and to be so only probably, meaning it may fail with a small probability delta. Both slacks are necessary because a learner sees a finite random sample and can always be unlucky or land just short of perfect.

The setup is as follows. There is an unknown target concept drawn from a known concept class, and examples arrive labeled according to that concept from some fixed but unknown distribution. A concept class is PAC learnable if there exists an algorithm that, for any target concept, any distribution, and any chosen epsilon and delta, returns a hypothesis with error at most epsilon with probability at least one minus delta. The crucial demand is efficiency: the number of examples and the running time must scale polynomially in one over epsilon, one over delta, and the size of the problem. Learnability that requires exponentially many examples is not considered learning in any useful sense.

PAC learning matters because it separates what is learnable in principle from what is not, and it does so distribution-free, making no assumption about the data-generating distribution beyond that train and test come from the same one. This is what connects it to Generalization: a PAC guarantee is a worst-case bound on the gap between performance on the sample and performance on the full distribution. The framework also gives Sample Complexity its formal meaning, the count of examples sufficient to reach the epsilon and delta targets.

The deepest result in the theory ties learnability to a single combinatorial quantity, the VC Dimension of the concept class. A class is PAC learnable with a finite sample complexity if and only if its VC dimension is finite, and the number of samples needed grows roughly linearly with that dimension. This is why VC dimension is the central measure of capacity in classical learning theory. PAC learning also clarifies the role of Empirical Risk Minimization: under a finite VC dimension, choosing the hypothesis that minimizes error on the training sample is enough to obtain a PAC guarantee, which justifies the basic recipe of fitting the data and trusting it to transfer.

PAC learning has limits that later theory addressed. The original model assumes a realizable case, where some concept in the class fits perfectly, and the agnostic extension relaxes this to allow the best hypothesis to still make errors. It is also a worst-case framework over all distributions, so it can be pessimistic about the friendly distributions seen in practice, and the No Free Lunch Theorem shows why some such pessimism is unavoidable without assumptions. Even so, PAC learning remains the conceptual bedrock on which the modern vocabulary of learnability, capacity, and generalization is built.
