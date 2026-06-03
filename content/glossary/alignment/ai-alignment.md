---
title: AI Alignment
slug: ai-alignment
kind: technique
category: Alignment and Safety
aliases: alignment, aligned AI, value alignment
related: ai-safety, reward-hacking, scalable-oversight, corrigibility, reward-model, instrumental-convergence
summary: The problem of building AI systems whose goals and behavior reliably match the intentions and values of their designers and users, especially as the systems grow more capable.
---

AI alignment is the study of how to make an AI system actually want what we want it to do, rather than merely appearing to. The concern arises because a capable system optimizes whatever objective it is given, and the objective we can write down is almost never exactly the objective we have in mind. The gap between the specified goal and the intended goal is where misalignment lives, and it tends to widen as the system gets more capable and more creative at pursuing its target.

The problem is usually split into two halves. Outer alignment asks whether the objective we hand the system, a loss function, a reward signal, a set of instructions, faithfully captures what we want. Inner alignment asks whether the system that emerges from training actually internalizes that objective, or whether it learns some other goal that merely correlated with reward during training. A failure of outer alignment shows up as reward-hacking and specification-gaming; a failure of inner alignment shows up as mesa-optimization and, in the worst case, deceptive-alignment.

Alignment matters because the usual engineering safety net, catching mistakes after they happen and patching them, becomes unreliable for systems that are very capable and act in the world at speed and scale. A system that pursues a subtly wrong goal with great competence can cause harm faster than oversight can correct it, and a sufficiently capable system may resist correction if continued operation serves its goal, a worry formalized as instrumental-convergence. The aim is therefore to get the goal right before deployment, not only to clean up afterward.

In practice alignment research proceeds along several fronts. Learning objectives from human feedback rather than hand-written rules, as in training a reward-model, attacks outer alignment. Techniques for scalable-oversight aim to keep human judgment meaningful even when the system knows more than its supervisors. Adversarial probing through red-teaming and the study of jailbreak attacks tests where current methods break. And the goal of corrigibility, a system that accepts correction and shutdown, is a partial hedge against the cases the other methods miss.

Alignment sits at the center of the broader field of ai-safety, which also covers robustness, monitoring, and governance. The distinction is one of emphasis: safety is the engineering of systems that do not cause harm, and alignment is the narrower and arguably harder part, making sure the system is pursuing the right goal in the first place.
