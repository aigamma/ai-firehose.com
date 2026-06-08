---
title: Domain Adaptation
slug: domain-adaptation
kind: technique
category: Core Machine Learning
aliases: domain adaptation, domain shift
related: transfer-learning, fine-tuning, catastrophic-forgetting, supervised-learning, data-augmentation
summary: Adapting a model trained on one data distribution so it works on a related but different one, a medical model moving to a new hospital's scans, a speech model meeting a new accent, without a full set of fresh labels. It targets the gap between where a model was trained and where it is actually used, which is where most deployed models quietly fail.
---

A model is trained on one slice of the world and then deployed on another. The training images came from one set of cameras, the real ones come from another; the labeled speech was clean, the users mumble in noise. Performance that looked excellent in the lab sags in production, and the culprit is the shift in distribution between the two. Domain adaptation is the work of closing that gap, moving a model from its source domain to a target domain that is related but not the same.

The methods turn on how much labeled target data you have. With a little, the lever is fine-tuning on the target, carefully, so the model adjusts without forgetting the source. With none, the harder and more interesting case, the goal is to align the two domains in some shared representation, training the model so its internal features cannot tell source from target, on the theory that a classifier built on domain-invariant features will transfer. Generating synthetic target-like data through augmentation is a third route, manufacturing the variety the source data lacked.

The distinction worth holding is that domain adaptation is a narrower, more tractable cousin of transfer learning. Transfer learning moves to a different task; domain adaptation keeps the same task and only changes the data distribution under it, which is what makes the unlabeled case solvable at all, since the label space is shared and only the inputs have drifted. It is also distinct from the broader problem of distribution shift, which simply names the failure; domain adaptation is one family of fixes for it.

The reason it matters is that the lab-to-deployment gap is where most real models fail, quietly and after launch, not on the benchmark. A model is only as good as its match to the data it actually meets, and the world rarely matches the training set for long, which is why domain adaptation, and the broader discipline of noticing and correcting distribution shift, is as much a part of shipping reliable AI as raw accuracy on a held-out test.
