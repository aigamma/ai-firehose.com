---
title: Cybersecurity
slug: cybersecurity
kind: opinion
category: Alignment and Safety
aliases: AI cybersecurity, AI security
related: ai-alignment, prompt-injection, ai-regulation, constitutional-ai, frontier-model, ai-agent
summary: The two-sided relationship between AI and computer security: AI as a tool that strengthens both attackers and defenders, and AI systems as a new attack surface of their own. Whether it helps defenders or attackers more is unsettled and consequential.
---

AI enters cybersecurity from both ends at once. It is a tool that makes attackers faster, finding vulnerabilities, writing exploits, crafting convincing phishing at scale, and a tool that makes defenders faster, triaging alerts, spotting anomalies, patching code. And it is itself a new thing to attack: a model that can be manipulated, leaked from, or hijacked in ways traditional software cannot. Cybersecurity in the AI era is the contest among all three.

The novel part is the third. A language model takes instructions in the same channel as data, which means untrusted content it reads, a web page, an email, a document, can carry hidden instructions it then follows, the attack called prompt injection. An agent with tools makes this worse, because a hijacked agent does not just say the wrong thing, it acts, exfiltrating data or running commands. The old security boundary between code and input dissolves when the input is interpreted by something that can be talked into anything.

The central open question is whether AI favors offense or defense. The pessimist's case is that attackers need one hole and AI helps them find it faster, while defenders must cover everything; the optimist's case is that defense has always been labor-bound and AI relieves exactly that bottleneck, automating the analysis and patching that humans could never staff. Which effect dominates is not yet known, and it matters enormously, because a technology that tilts the field toward attackers makes everything built on software more fragile.

What is clear is that AI does not leave the security balance where it found it; it raises the stakes on both sides and inserts a fragile new component in the middle. The systems we are racing to make autonomous and tool-wielding are, by that same design, more dangerous when subverted, which is why securing AI is not a separate niche from building it but a constraint on how far it can safely be trusted to act.
