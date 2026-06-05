---
title: Adversarial AI
slug: adversarial-ai
kind: opinion
category: Alignment and Safety
aliases: adversarial attacks, adversarial machine learning, AI red teaming
related: prompt-injection, cybersecurity, ai-alignment, reward-hacking, ai-regulation, constitutional-ai
summary: The study of how AI systems fail under inputs crafted to fool them, and the techniques on both sides: attacks that exploit a model's blind spots, and defenses that try to close them. It exists because models are confidently wrong in ways their ordinary evaluation never reveals, and only an adversary thinks to find.
---

A model evaluated on ordinary inputs can look reliable and still be brittle, because ordinary inputs do not probe its blind spots. Adversarial AI is the study of what happens when someone designs inputs specifically to break it: an image perturbed in ways invisible to a human that flips the classifier, a prompt engineered to bypass a safety filter, a poisoned example slipped into training data. The premise is that a system's real robustness is not how it does on the average case but how it does against someone trying to make it fail.

The attacks span the model's whole lifecycle. At inference, adversarial examples find the tiny input changes that cause large output errors, exploiting that a model's decision boundaries are stranger than its accuracy suggests. At the prompt, jailbreaks and injections talk a model out of its guardrails or smuggle instructions through data it reads. At training, data poisoning plants behavior that activates later. Each exploits the same root fact: a model learns correlations that hold on its training distribution but were never the robust, causal rules a human would use, so off-distribution inputs find the gap.

The uncomfortable lesson is that defense is structurally harder than attack, and may stay that way. A defender must close every hole; an attacker needs one, and can adapt to each new defense, which is why the field reads as an arms race where patched vulnerabilities are replaced by new ones rather than eliminated. Worse, the same scaling that makes models more capable does not reliably make them more robust, so a more powerful model can be just as foolable, sometimes more so, because its very fluency makes its confident errors more convincing.

Adversarial AI matters most as systems gain the ability to act. A misclassified image is a contained error; an agent talked into running a command or leaking data through a crafted input is a breach. As models move from answering to acting, their adversarial weaknesses stop being academic curiosities and become the attack surface of everything built on them, which is why red-teaming, deliberately attacking your own system before someone else does, is becoming a standard part of building one rather than an afterthought.
