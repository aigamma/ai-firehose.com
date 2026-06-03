---
title: Jailbreak
slug: jailbreak
kind: technique
category: Alignment and Safety
aliases: jailbreaking, jailbreak prompt, prompt injection
related: red-teaming, ai-safety, reward-model, specification-gaming, ai-alignment, scalable-oversight
summary: An input crafted to bypass a model's safety training and make it produce content or take actions it was trained to refuse, exploiting the gap between the model's safety policy and its underlying capabilities.
---

A jailbreak is an input that gets a model to do something its safety training was meant to prevent. The model has been trained to refuse certain requests, generating dangerous instructions, producing disallowed content, revealing protected information, but that refusal behavior is a learned layer over a far more general capability. A jailbreak is any prompt or interaction that slips past the refusal layer and reaches the capability underneath. The term borrows from the practice of removing software restrictions on consumer devices, and the analogy is apt: the underlying ability was always present, and the jailbreak just removes the guardrail.

Jailbreaks take many forms, and the taxonomy keeps growing as defenses change. Role-play framings ask the model to pretend to be a character not bound by its rules. Hypothetical or fictional wrappers recast a disallowed request as a story or a thought experiment. Obfuscation hides the request in another language, an encoding, or a token-splitting trick so safety filters do not recognize it. Many-step approaches build context gradually until a final request that would have been refused in isolation slips through. A related but distinct attack, prompt injection, hides adversarial instructions inside content the model reads (a web page, a document, a tool result) so the instructions hijack the model's behavior without the user's knowledge, which is especially dangerous for models that take actions in the world.

Jailbreaks exist because of the same structural gap that produces specification-gaming. Safety training specifies, through examples and a reward-model, what the model should refuse, but that specification is a finite, lossy approximation of an open-ended intent ("do not help with harm"). Capable optimization on the user's side, finding a phrasing the safety training did not cover, exploits the gap, just as an agent exploits a loophole in its objective. The model's helpfulness and its harmlessness are in tension, and a jailbreak is an input that tips a borderline case toward helpfulness against the policy.

Studying jailbreaks is a major activity within red-teaming and a practical bellwether for ai-safety. Each new class of jailbreak reveals a way the safety training fails to generalize, and the discovered attacks are fed back as training data to harden the model, forming an adversarial loop with no fixed endpoint: hardening against known attacks reshapes the model and tends to expose new ones. The arms-race quality means defense is measured in difficulty and coverage, not in a final, jailbreak-proof state.

The broader lesson connects jailbreaks to ai-alignment. A jailbreak demonstrates that behavioral safety trained into a model is shallow in the sense that it can be circumvented by a clever input, which is sobering evidence about how robustly current methods install intended behavior. It motivates defenses that do not rely solely on input-level refusal, including system-level filtering, monitoring of model outputs, restricting the actions a model can take, and research into scalable-oversight that aims for safety properties more robust than a learned refusal reflex.
