# AI Firehose

**The bleeding edge, organized.** ai-firehose.com is a personal AI-industry intelligence dashboard, built as a daily outlier hunt. It answers four questions and then stops: what is new in the past day, what is new this week, this month, and this quarter.

It is the third in a personal trilogy. [aigamma.com](https://aigamma.com) was built to learn PhD-level math by interacting with models directly. [worldthought.com](https://worldthought.com) was built to learn philosophy and the connections between major thinkers. AI Firehose is built to feel organized and courageous facing the daily flood of AI, and to stay on the frontier.

## What It Does

- **Three relative-rotation boards.** Techniques, Tools, and Opinions each rotate through Leading, Improving, Weakening, and Lagging quadrants, using relative-strength math (borrowed from market rotation graphs) applied to attention rather than price.
- **A unified constellation.** A 2D map of the whole idea space, every item placed by its embedding, colored by kind, sized by attention. Outliers sit at the edges or move fast.
- **Trending leaderboards and an outliers strip.** The biggest movers, the breakouts, the brand-new entrants.
- **A Glossary of Techniques.** An AI-grown, self-organizing taxonomy where each technique is an integration hub linking to the items, neighbors, and discourse axes around it.
- **Live semantic search.** Non-chat retrieval across the corpus.
- **Explore and subscribe.** Themes, concept spectrums, and an influence graph on the Explore page, plus a subscribable RSS feed (`/feed.xml`) of everything new.

## How It Stays Fresh

The corpus self-expires. Nothing older than about one quarter is retained, so the maps always depict the current frontier and never accumulate stale sediment. The primary input is a curated set of high-signal YouTube teachers, alongside arXiv, Hugging Face, GitHub, Hacker News, blogs and newsletters, and community sources.

## Architecture

A static React and Vite site on Netlify reads precomputed JSON artifacts. A scheduled worker on Fly.io ingests every day: fetch, transcribe, classify, embed, and rebuild the derived artifacts. Pinecone stores the vectors, Voyage embeds and reranks, and Claude classifies and writes definitions. There is no chatbot; the embedding layer powers organization and visualization.

## For Contributors (human or AI)

Start with [`CLAUDE.md`](CLAUDE.md), the canonical guide. [`AGENTS.md`](AGENTS.md) delegates there for cross-vendor agents. [`STEERING_DOCS.md`](STEERING_DOCS.md) maps every document. Run the site locally with `npm install` then `npm run dev`.
