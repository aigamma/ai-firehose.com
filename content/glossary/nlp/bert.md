---
title: BERT
slug: bert
kind: tool
category: NLP Foundations
aliases: Bidirectional Encoder Representations from Transformers
related: masked-language-modeling, self-attention, word-embedding, word2vec, named-entity-recognition, large-language-model
summary: A transformer-based model from Google (2018) that learns deeply bidirectional contextual word representations by pretraining on masked-language-modeling, then fine-tuning for many NLP tasks. It reset the state of the art across the field and made pretrain-then-fine-tune the default workflow, and it is the encoder, understanding-first counterpart to the generative LLM lineage.
---

BERT, Bidirectional Encoder Representations from Transformers, reset the state of the art across natural language processing when Google released it in 2018. Built from the encoder half of the transformer, it is pretrained on large amounts of unlabeled text, then fine-tuned with a small task-specific head for problems like question answering, sentiment classification, and named-entity recognition. Its arrival marked the moment the field shifted decisively from static word embeddings to deep contextual representations.

BERT's signature idea is deep bidirectionality. Earlier language models read text left to right, predicting each word from the words before it, so a word's representation could only draw on one side of its context; BERT instead conditions on both directions at once. It achieves this with masked-language-modeling: during pretraining a fraction of the input tokens are hidden, and the model must predict them using the entire surrounding sentence, left and right together. A second pretraining task, next-sentence prediction, trains it to judge whether one passage plausibly follows another, encouraging it to represent relationships between sentences.

Under the hood BERT is a stack of transformer encoder layers, each built on self-attention, so every token's representation is computed by attending to every other token in the input. This is what makes its embeddings contextual: the word "bank" receives a different vector in "river bank" than in "savings bank", resolving the polysemy that static methods like word2vec and glove cannot. The output is a context-sensitive embedding for every position, plus a special pooled vector used to represent the whole sequence for classification.

BERT matters because it made transfer learning the default workflow in NLP. One expensive pretraining run on generic text yields a model practitioners fine-tune cheaply on their own labeled data, often setting new records with comparatively little task-specific engineering. This pretrain-then-fine-tune recipe spread rapidly and spawned a large family of variants, including smaller distilled versions for efficiency and versions tuned for specific languages and domains.

In the broader arc, BERT is the encoder-side culmination of the transformer era's first wave. It excels at understanding text, producing representations for downstream classification and extraction, which distinguishes it from the decoder-style generative models, the large language model lineage, that produce fluent text. The two families share the transformer and self-attention as common ancestry, and BERT remains a foundational reference point and a widely deployed workhorse for tasks that need rich understanding rather than open-ended generation.
