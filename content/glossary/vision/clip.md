---
title: CLIP
slug: clip
kind: technique
category: Computer Vision
aliases: Contrastive Language-Image Pretraining
related: contrastive-learning, vision-transformer, embedding-model, semantic-search, image-classification, latent-space
summary: A model trained to put images and text in one shared embedding space by contrastive learning over hundreds of millions of image-caption pairs. By turning recognition into a matching problem against natural language, it unlocks zero-shot classification with no fixed label set, and the same shared space became the conditioning signal behind text-to-image generators.
---

CLIP, short for Contrastive Language-Image Pretraining, learns a single shared embedding space for both images and text. It is built from two encoders, an image encoder (commonly a vision transformer) and a text encoder (a transformer over tokens), trained jointly so that an image and its caption land near each other in that space while unrelated image-text pairs land far apart. Released by OpenAI in 2021 and trained on roughly four hundred million image-caption pairs scraped from the web, CLIP became the default bridge between the visual and textual worlds.

It matters because it turns recognition into a matching problem against natural language, which unlocks zero-shot classification. To classify an image into arbitrary categories you never trained on, you embed the candidate label names as text, "a photo of a dog", "a photo of a cat", embed the image, and pick the label whose embedding is closest. There is no fixed label set and no fine-tuning required, a sharp departure from conventional image classification, which is locked to the categories it was trained on. The same shared space powers text-to-image semantic search, image deduplication, and the conditioning signal inside text-to-image generators.

The training objective is contrastive learning. Within each large batch of image-text pairs, the model computes the similarity between every image embedding and every text embedding, forming a grid of scores, and is trained so the matching diagonal pairs score highest and all the off-diagonal mismatches score low, using a symmetric cross-entropy loss over the rows and columns. This pushes the two encoders to agree on a common geometry of meaning, so proximity in the latent space reflects semantic similarity across both modalities. The result is a general-purpose embedding model for vision grounded in language.

CLIP sits at the foundation of modern multimodal systems. Its frozen image encoder is a popular visual backbone, its text-image alignment is the conditioning mechanism behind diffusion-based image generators, and its embeddings feed retrieval pipelines. By learning from naturally occurring captions rather than hand-curated labels, it inherits the breadth of the open web, which is the source of both its remarkable generality and its biases.
