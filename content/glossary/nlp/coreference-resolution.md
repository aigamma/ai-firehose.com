---
title: Coreference Resolution
slug: coreference-resolution
kind: technique
category: NLP Foundations
aliases: coreference, anaphora resolution, pronoun resolution
related: named-entity-recognition, dependency-parsing, part-of-speech-tagging, self-attention, bert, sequence-to-sequence
summary: The task of determining which expressions in a text refer to the same real-world entity, linking pronouns and noun phrases back to their antecedents so that scattered mentions are grouped into coherent chains.
---

Coreference resolution is the task of finding all the expressions in a document that point to the same entity and grouping them together. In the sentence "Marie won the prize because she had worked for years on it", a system must recognize that "she" refers to "Marie" and "it" refers to "the prize". Each such group of co-referring mentions is a coreference chain. The problem is fundamental to genuine language understanding, because human text is saturated with pronouns, abbreviations, and repeated descriptions that only make sense once the reader knows who or what each one denotes.

The task breaks into recognizable subproblems. The most familiar is pronoun resolution, also called anaphora resolution, where a pronoun must be linked back to an earlier antecedent. But coreference is broader: it also links full noun phrases, as when "the president", "Lincoln", and "he" all refer to one person across a paragraph. Resolving these links draws on many signals at once. Grammatical agreement in number and gender narrows the candidates, syntactic structure from dependency-parsing constrains what a pronoun can bind to, the entity types from named-entity-recognition rule out mismatches, and world knowledge often settles the rest, as in the famous Winograd cases where "the trophy did not fit in the suitcase because it was too big" requires reasoning to know "it" is the trophy.

Approaches to coreference have tracked the broader history of NLP. Early systems were rule-based, encoding linguistic constraints and salience heuristics by hand. These gave way to statistical models that scored candidate antecedents with learned features, and then to neural models. Modern systems are typically built on contextual encoders such as bert, where self-attention already produces representations sensitive to which earlier words a token relates to, making the model well suited to scoring which mention a given span corefers with. Some recent work even casts coreference as a sequence-to-sequence or generation problem, having a language model rewrite or annotate the text with its entity links directly.

Coreference resolution matters because so many downstream tasks silently depend on it. Information extraction must attribute every fact to the right entity, summarization must not lose track of who did what, question answering must follow pronouns to their referents, and machine translation must carry agreement across a passage. It is also a sensitive probe of how well a model truly understands a text rather than merely processing its surface, which is why coreference benchmarks remain a respected measure of language understanding and why the hardest cases, requiring commonsense reasoning, continue to challenge even strong large models.
