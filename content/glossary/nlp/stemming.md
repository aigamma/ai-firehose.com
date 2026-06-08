---
title: Stemming
slug: stemming
kind: technique
category: NLP Foundations
aliases: stemmer, Porter stemmer
related: lemmatization, tf-idf, bag-of-words, n-gram-model, part-of-speech-tagging, topic-modeling
summary: A fast, rule-based normalization that strips suffixes to reduce words to a common stem, conflating related forms without consulting a dictionary, so the stem need not be a real word ("studies" to "studi"). Its crudeness produces two signature errors, overstemming (merging "universe" and "university") and understemming, and it sits at the lightweight end of a spectrum running to lemmatization.
---

Stemming reduces a word to a root form, its stem, by mechanically stripping off affixes according to a set of rules. "Connection", "connected", and "connecting" all reduce to the stem "connect", so a system can treat them as the same term. The aim is the same normalization lemmatization seeks, collapsing the many grammatical variants of a word so they are counted together, but stemming pursues it with a deliberately crude, fast procedure rather than linguistic analysis. It has been a staple of information retrieval since the 1980s, when keeping search indexes small and matching queries to documents cheaply was paramount.

The defining feature is that it is rule-based and dictionary-free. The classic Porter stemmer, and successors like Snowball, apply an ordered sequence of suffix-rewriting rules: remove a trailing "ing", collapse a doubled consonant, turn "ies" into "i", and so on. The algorithm never checks whether the result is a real word, which is why stems are often not words at all: "studies" becomes "studi", "happiness" becomes "happi". This is acceptable because the stem is only an internal key for grouping, never shown to a user, and the payoff is speed and simplicity, with no need for a lexicon or part-of-speech tagging and easy portability across the regular morphology of many languages.

Stemming's crudeness produces two characteristic errors worth knowing. Overstemming conflates words that should stay distinct, as when "universal", "university", and "universe" all collapse to "univers", harming precision; understemming fails to merge forms that belong together, as when "data" and "datum" are left separate, harming recall. Aggressive stemmers overstem, conservative ones understem, and tuning a stemmer is largely about balancing these. Because the process is purely lexical, it also cannot resolve the ambiguities a dictionary-based lemmatizer handles, such as choosing the right root for a word that is both a noun and a verb.

The right way to place stemming is as the lightweight end of a normalization spectrum that runs to lemmatization at the linguistically careful end: stemming is faster and needs no language resources but can mangle words, while lemmatization is slower and resource-heavy but always returns valid dictionary forms. In classical pipelines a stemmer feeds cleaner, lower-dimensional input to tf-idf scoring, bag-of-words classifiers, and topic modeling, often improving retrieval at negligible cost. Like other heavy preprocessing it has receded in modern neural NLP, where subword tokenization and learned representations let models handle morphology on their own, but stemming endures in search engines and lightweight text tooling where its speed and simplicity still pay off.
