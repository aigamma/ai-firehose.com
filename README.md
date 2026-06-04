# AI Firehose

**The bleeding edge, organized.** ai-firehose.com is a personal AI-industry intelligence dashboard, built as a daily outlier hunt. It answers four questions and then stops: what is new in the past day, what is new this week, this month, and this quarter.

It is the third in a personal trilogy. [aigamma.com](https://aigamma.com) was built to learn PhD-level math by interacting with models directly. [worldthought.com](https://worldthought.com) was built to learn philosophy and the connections between major thinkers. AI Firehose is built to feel organized and courageous facing the daily flood of AI, and to stay on the frontier.

## What It Does

- **A daily briefing.** A cited, model-written summary of what is new and what is breaking out, the lede of the dashboard, written at full strength by Claude Opus. Every claim links to the item or the concept it came from.
- **Trend boards, What Moved.** The topics that gained or lost the most attention this window versus the equal window before it, ranked per kind (Techniques, Tools, Opinions), with a magnitude bar and breakout and just-surfaced flags. The whole page switches between Day, Week, Month, and Quarter.
- **A durable knowledge base.** 453 Opus-authored concepts across 31 categories, explorable as an Atlas constellation, woven into the live trending taxonomy by wiki-style auto-linking, and studyable through curated learning paths and flashcards.
- **Watch.** Embedded videos from favorite AI teachers, each joined to the corpus so it carries a cited summary and links into the concepts it covers. Curated in-repo.
- **Live semantic search.** Non-chat retrieval across the corpus and knowledge base, on the Explore page alongside themes, spectrums, and connections, plus a subscribable RSS feed (`/feed.xml`).

## How It Stays Fresh

The corpus self-expires. Nothing older than about one quarter is retained, so the maps always depict the current frontier and never accumulate stale sediment. The primary input is a curated set of high-signal YouTube teachers, alongside arXiv, Hugging Face, GitHub, Hacker News, blogs and newsletters, and community sources.

## Architecture

A static React and Vite site on Netlify reads precomputed JSON artifacts. A scheduled worker on Fly.io ingests every day: fetch, transcribe, classify, embed, and rebuild the derived artifacts. Pinecone stores the vectors, Voyage embeds and reranks, and Claude classifies, writes the glossary definitions, and writes the daily briefing. There is no chatbot; the embedding layer powers organization and visualization.

## For Contributors (human or AI)

For a human-friendly tour of what the project is and everything in it, read [`OVERVIEW.md`](OVERVIEW.md). Then start with [`CLAUDE.md`](CLAUDE.md), the canonical technical guide. [`AGENTS.md`](AGENTS.md) delegates there for cross-vendor agents, and [`STEERING_DOCS.md`](STEERING_DOCS.md) maps every document. Run the site locally with `npm install` then `npm run dev`.
