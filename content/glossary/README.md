# Authored Glossary (the durable knowledge layer)

These are hand-authored and Opus-authored, DURABLE glossary entries: foundational, advanced, and exotic AI, mathematics, and philosophy-of-mind concepts that persist regardless of the rolling-quarter retention that prunes trending corpus items. They are the permanent learning layer of ai-firehose.com, the part that sticks and compounds while the daily firehose decays.

One file per entry: `content/glossary/<category>/<slug>.md`. The build (`scripts/build_glossary.mjs`, also a `prebuild` step) compiles these into the served glossary artifacts (`public/data/glossary/index.json` and `public/data/glossary/c/<slug>.json`), merged with the corpus-derived concepts and marked `durable: true` so retention never prunes them. The build is idempotent and re-runnable.

## Format

A frontmatter block between `---` fences, then a Markdown body:

```
---
title: Gradient Descent
slug: gradient-descent
kind: technique
category: Optimization
aliases: GD, steepest descent
related: stochastic-gradient-descent, learning-rate, loss-landscape, backpropagation
summary: An optimization algorithm that iteratively steps the parameters of a model in the direction of steepest descent of a loss function, so the loss falls toward a minimum.
---

Gradient descent is the workhorse of machine learning optimization. It treats training
as a search over a high-dimensional surface, the loss landscape, and walks downhill.

Each step computes the gradient ... and moves the parameters a small amount against it,
scaled by the learning rate.
```

### Frontmatter fields
- `title`: display name, Title Case. Required.
- `slug`: kebab-case id; must equal the filename without `.md`. Required.
- `kind`: `technique`, `tool`, or `opinion`. Sets the badge color only. Default `technique`.
- `category`: the entry's category in Title Case (it can match the folder). Required.
- `aliases`: comma-separated alternate names, used for wiki-linking and search. Optional.
- `related`: comma-separated slugs of related entries, rendered as a Related link mesh. Optional.
- `summary`: a one to three sentence definition. Required. Also the glossary-list snippet.

### Body
Markdown prose. Supported: paragraphs (blank-line separated), `## Subheadings`, `- bullet lists`, `**bold**`, `*italic*`, `` `inline code` ``, and `[text](url)` links. Any glossary term or alias mentioned in the body auto-links to its hub, wiki-style, so write naturally and reference other concepts freely. The first mention of a term in a body is the one that links.

## Writing rules

The spare "no ornament" register used elsewhere in this project is the operational voice, how the tooling talks to its reader. Glossary content is held to a richer bar, because it is read to be learned from, not skimmed for status.

- No em dashes (the U+2014 character is forbidden project-wide). Use commas, colons, semicolons, periods, parentheses, or "and".
- Title Case for the title and any `##` subheadings.
- Teach, do not summarize. The goal is an entry an aspiring AI engineer learns something non-obvious from, even on a familiar topic. Make an argument about what matters in the concept; do not give every fact equal weight. Reference neighbor concepts in natural lowercase prose where the logic needs them (the wiki-linker auto-links the first mention regardless of case).
- Open on the problem the concept solves, a surprising consequence, the tension it resolves, a concrete instance, or a misconception it corrects. Never a copular dictionary lead ("X is a type of...", "X is the most widely used..."). You may define the term inside the first paragraph, just not as the first move.
- Earned vividness, not ornament. Exactly one memorable thing per entry: an analogy that explains, a surprising consequence, or an honestly named limit or tension. It must do real explanatory work, so that deleting it makes the concept harder to grasp. Banned: hype ("powerful", "revolutionary", "game-changing"), filler ("it is important to note", "in today's world", "a wide range of"), and decorative metaphor that explains nothing.
- Name the problem before the mechanism, and present the mechanism as deliberate engineering choices with reasons, not a neutral feature list.
- End on a tension, a limit, or the deepest structural insight, never a "see also" line or an applications roll-call. The last sentence should be worth remembering out of context.
- Aim for 3 to 6 paragraphs. Vary structure across entries; avoid the definition then mechanism then applications spine. Every striking claim must be checkable against a primary or authoritative source.
