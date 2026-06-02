# Sources

Every source is an adapter under `worker/sources/` behind a common interface that returns raw Items. The classifier (not the adapter) decides each item's `kind`. Each source has an authority weight that scales how strongly it moves the rotation.

## YouTube (primary, coded from scratch)

Eric's favorite high-signal teachers are the primary input and a leading indicator: when a trusted teacher covers a new topic, it should move the boards early.

- **Registry.** `sources/youtube_channels.json` (Eric curates). Each channel has a `channel_id`, `name`, `authority_weight`, and a `kind_bias` hint.
- **New-upload detection.** Poll the free per-channel RSS feed `https://www.youtube.com/feeds/videos.xml?channel_id=<ID>`. No API key. Cheap enough to poll often.
- **Metadata and captions.** `yt-dlp` (open source) for title, description, duration, and captions (the timedtext track) when present.
- **Transcription fallback.** When captions are absent, download audio with `yt-dlp` and transcribe with Whisper. This is the exact transcript pattern civil uses. The Whisper host (whisper.cpp on the worker vs the OpenAI Whisper API) is decided in Phase 1 by cost and quality.
- **Apify.** Documented only as a paid fallback if RSS or yt-dlp is blocked at scale. The default path is from scratch.

## Other Sources

- **arXiv.** Public Atom API across cs.AI, cs.LG, cs.CL, cs.CV. Technique and research signal.
- **Hugging Face.** Trending models, datasets, and Papers via the authenticated HF MCP (account `ai-gamma`). Tool and technique signal.
- **GitHub Trending** and **Hacker News / Show HN.** Public endpoints (the HN Firebase API, GitHub search). Tool and launch signal.
- **Blogs and newsletters.** RSS, driven by a manifest like worldthought's Gutenberg manifest: OpenAI, Anthropic, Google DeepMind, Meta AI, Import AI, The Batch, Latent Space, Simon Willison. Opinion and announcement signal.
- **Reddit** (r/LocalLLaMA, r/MachineLearning) and **X** curated lists. Community pulse. X access is the hardest; v1 may start read-only or via lists.

## Authority Weighting

`source_authority_weight` (and per-channel `authority_weight` for YouTube) feeds `w_source` in the attention math (`docs/RAG.md`). Favorite teachers and primary labs are weighted high; noisy community sources lower. This is what makes a trusted teacher's coverage a leading indicator rather than just one more mention.

## Adding a Source

Implement the adapter interface, register it, set a default authority weight, and document it here in the same commit (the maintenance rule). The classifier and the rest of the pipeline are source-agnostic downstream of fetch.
