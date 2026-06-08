---
title: Text-to-Speech
slug: text-to-speech
kind: technique
category: NLP Foundations
aliases: TTS, speech synthesis
related: automatic-speech-recognition, diffusion-model, autoregressive-model, transformer
summary: The task of synthesizing natural-sounding speech from text, the output side of voice interfaces. The hard part is not pronouncing words but prosody, the rhythm, stress, and intonation that make speech sound human, and modern neural systems now clone a voice from seconds of audio, which is exactly why synthetic-voice detection and watermarking became a safety concern.
---

Text-to-speech is the inverse of speech recognition: it turns written text into an audio waveform of someone speaking. The difficulty is not just pronouncing words but doing so naturally, with the rhythm, stress, and intonation (prosody) that make speech sound human rather than robotic, and adapting all of that to context, since the same sentence is spoken differently as a question, a statement, or an aside.

Classical systems concatenated recorded speech fragments or used parametric vocoders, and sounded mechanical. Neural TTS changed that: a common modern pipeline predicts acoustic features from text and a neural vocoder turns those into a waveform, while end-to-end and token-based approaches generate audio directly, with both autoregressive models and diffusion in use, mirroring the architectures behind text and image generation. The results are close to indistinguishable from human speech, with controllable emotion and style, and voice cloning that can mimic a speaker from only seconds of reference audio.

The applications are broad and genuinely useful: accessibility for the visually impaired, voice assistants, audiobooks, and dubbing. Real-time use adds a latency constraint, so streaming systems must begin speaking before the full text is processed, trading a little prosodic smoothness for responsiveness, and quality is ultimately judged by human mean-opinion-score listening tests because no automatic metric fully captures naturalness.

That same realism has a darker edge, a safety concern. Convincing synthetic voices enable fraud and impersonation, which is why provenance and watermarking, and detection of synthetic audio, are part of responsible deployment, the audio counterpart of the issues that synthetic text and images raise.
