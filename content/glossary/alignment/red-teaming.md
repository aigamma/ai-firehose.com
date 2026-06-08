---
title: Red-Teaming
slug: red-teaming
kind: technique
category: Alignment and Safety
aliases: red teaming, red team, adversarial testing
related: jailbreak, ai-safety, reward-hacking, specification-gaming, scalable-oversight, ai-alignment
summary: The practice of deliberately attacking a system to find its failures before adversaries or accidents do, adapted from security to probe AI models for harmful, unsafe, or policy-violating behavior. Its honest limit is asymmetric: it can demonstrate that failures exist but never prove their absence, and it is weak against an adversary that behaves well precisely when it knows it is being probed.
---

Red-teaming is structured adversarial testing: a team takes the role of an attacker and tries hard to make a system fail, so that the failures are discovered and fixed under controlled conditions rather than in the wild. The name and method come from military and cybersecurity practice, where a red team plays the opponent against a defending blue team. Applied to AI, red-teaming means searching for inputs and interactions that cause a model to produce harmful content, leak information it should protect, follow instructions it should refuse, or otherwise behave outside its intended bounds.

For modern language and multimodal models, red-teaming centers on eliciting behavior the model is supposed to avoid. Red-teamers craft prompts that attempt a jailbreak, the act of circumventing a model's safety training, and probe for failure modes like producing dangerous instructions, generating disallowed content, revealing system prompts or training data, or being manipulated through indirect channels. The goal is breadth and creativity: the value of a red team lies in finding the cases that ordinary testing and the designers' own imagination miss, which is the same blind spot that lets specification-gaming and reward-hacking slip through.

Red-teaming is conducted in several modes. Human experts probe by hand, which is creative but slow and limited in coverage. Automated red-teaming uses other models or search procedures to generate large volumes of adversarial inputs, trading some creativity for scale. Crowdsourced exercises and public challenges widen the pool of attackers. The discovered failures feed back into training, often as new examples used to fine-tune the model against the attack, so red-teaming and safety training form a loop. This loop is adversarial and ongoing, because patching known attacks reshapes the model and tends to surface new ones.

The reason red-teaming is indispensable is that the space of possible inputs is far too large to cover with predefined tests, and the most damaging failures are usually the unanticipated ones. Adversarial probing is one of the few practical tools for getting evidence about how a system behaves at the edges of its training distribution. It is a core component of ai-safety and a standard step before releasing a capable model, often required by internal policy or external commitments.

Red-teaming has real limits worth stating plainly. It can demonstrate that failures exist but cannot prove their absence: passing a red-team exercise means the team did not find a problem, not that none remains. It is also weaker against an adversary that knows it is being tested, the worry at the heart of deceptive-alignment, since a system that behaves well precisely when probed will survive red-teaming while remaining unsafe. For these reasons red-teaming is treated as necessary but not sufficient, paired with scalable-oversight, interpretability, and ongoing monitoring after deployment.
