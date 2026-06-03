---
title: Text-to-Speech
slug: text-to-speech
kind: technique
category: NLP Foundations
aliases: TTS, speech synthesis
related: automatic-speech-recognition, diffusion-model, autoregressive-model, transformer
summary: The task of synthesizing natural-sounding speech from text, the output side of voice interfaces; modern neural systems capture prosody, timbre, and emotion, and can clone a voice from seconds of sample audio.
---

Text-to-speech is the inverse of speech recognition: it turns written text into an audio waveform of someone speaking. The difficulty is not just pronouncing words but doing so naturally, with the rhythm, stress, and intonation (prosody) that make speech sound human rather than robotic, and adapting all of that to context, since the same sentence is spoken differently as a question, a statement, or an aside.

Classical systems concatenated recorded speech fragments or used parametric vocoders, and sounded mechanical. Neural TTS changed that. A common modern pipeline predicts acoustic features from text and a neural vocoder turns those into a waveform, while end-to-end and token-based approaches generate audio directly; both autoregressive models and diffusion are used, mirroring the architectures behind text and image generation. The results are close to indistinguishable from human speech, with controllable emotion and style, and voice cloning that can mimic a speaker from only seconds of reference audio.

The applications are broad and genuinely useful: accessibility for the visually impaired, voice assistants, audiobooks, and dubbing.

That same realism is a safety concern. Convincing synthetic voices enable fraud and impersonation, which is why provenance and watermarking, and detection of synthetic audio, are part of responsible deployment, the audio counterpart of the issues that synthetic text and images raise.
