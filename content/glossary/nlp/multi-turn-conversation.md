---
title: Multi-Turn Conversation
slug: multi-turn-conversation
kind: technique
category: NLP Foundations
aliases: multi-turn conversation, multi-turn dialogue
related: context-window, context-management, mt-bench, in-context-learning, large-language-model
summary: Holding a coherent exchange across many back-and-forth turns, where each reply must account for everything said before, not just the latest message. It is harder than single-turn answering because the model must track references, remember commitments, and stay consistent as the conversation grows.
---

Answering one question is single-turn; holding a conversation is not. In a real exchange, "make it shorter" only means something given the previous answer, "what about the second one" refers back several messages, and a model that agreed to a constraint three turns ago is expected to still honor it. Multi-turn conversation is the capability of staying coherent across that accumulating context, where each reply depends on the whole history rather than the last line.

Mechanically, a language model has no memory between calls, so multi-turn ability is manufactured by feeding the entire prior conversation back into the context window on every turn. That works until the dialogue outgrows the window, at which point the system must summarize or drop older turns, which is the context-management problem in its most common form. The model also has to resolve references across turns, track who said what, and keep its own earlier statements consistent, none of which single-turn benchmarks test.

The reason it is its own concern is that single-turn competence does not guarantee multi-turn competence. A model can ace isolated questions yet lose the thread over a long chat, contradicting itself, forgetting a constraint, or quietly dropping context that fell out of the window, which is why benchmarks like MT-Bench were built specifically to grade conversational coherence rather than one-shot accuracy. The failures are distinctive: they appear only once the conversation is long enough.

Multi-turn conversation is the form most people actually meet AI through, the chat, and so it is where coherence, memory, and consistency are judged in practice. It connects directly to the harder open problems of agent memory and long-horizon reasoning, since a conversation that runs for hours is just a long-horizon task whose state is the dialogue itself, and keeping that state coherent is the same discipline of deciding what to carry forward and what to let go.
