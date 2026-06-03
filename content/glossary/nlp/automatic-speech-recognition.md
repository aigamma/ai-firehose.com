---
title: Automatic Speech Recognition
slug: automatic-speech-recognition
kind: technique
category: NLP Foundations
aliases: ASR, speech recognition, speech-to-text
related: sequence-to-sequence, transformer, multimodal-learning, large-language-model
summary: The task of transcribing spoken audio into text, a core modality bridge for AI; modern systems are large neural models, often encoder-decoder transformers like Whisper, trained on vast audio-text pairs and robust across accents, noise, and languages.
---

Automatic speech recognition turns sound into words. It is the input side of every voice interface, and a key bridge between the messy analog world and the text that language models work in. The audio is converted to a spectral representation (a mel spectrogram), and the system maps that sequence of audio frames to a sequence of words, a hard problem because speech is continuous, variable, noisy, and full of accents and homophones.

The field moved through distinct eras. Classical systems combined hidden Markov models for the acoustics with n-gram language models for the text, in elaborate pipelines. Deep learning replaced the acoustics with neural networks and connectionist temporal classification, and the current generation is end-to-end: an encoder reads the audio and a decoder generates text, exactly the transformer sequence-to-sequence setup used for translation. Whisper is the well-known example, trained weakly-supervised on a huge, diverse web corpus of audio and transcripts, which is what makes it multilingual and robust out of the box.

This is directly relevant to this project: the ingestion worker uses Whisper to transcribe videos that lack captions, turning spoken content into text the corpus and classifier can work with.

The remaining hard cases are background noise, overlapping speakers, heavy accents, rare proper nouns, code-switching between languages, and the latency demands of real-time transcription, which is why streaming ASR and speaker diarization are active areas alongside raw accuracy.
