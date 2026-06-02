# ai-firehose-mcp

An [MCP](https://modelcontextprotocol.io) server for **[AI Firehose](https://ai-firehose.com)**: query the bleeding edge of AI from any MCP client (Claude Code, Claude Desktop, and others).

It wraps the public ai-firehose.com read API, so it needs **no repository, no API keys, and no local data**. You install and run it with one command; nothing is ever cloned from GitHub.

## Install

### Claude Code

```
claude mcp add ai-firehose -- npx -y ai-firehose-mcp
```

### Claude Desktop

Open Settings, Developer, Edit Config, and add this to `claude_desktop_config.json`, then restart:

```json
{
  "mcpServers": {
    "ai-firehose": {
      "command": "npx",
      "args": ["-y", "ai-firehose-mcp"]
    }
  }
}
```

### Any other MCP client

Run the server over stdio:

```
npx -y ai-firehose-mcp
```

That is the whole install. `npx` fetches the package from the npm registry on first run.

## Tools

- **search_ai(query, kind?)**: semantic search over the corpus. Optional `kind` filter: `technique`, `tool`, or `opinion`.
- **whats_new(horizon?)**: what is new and breaking out over a `day`, `week`, `month`, or `quarter` (default `week`).
- **define(concept)**: glossary definition for an AI concept, plus its momentum, related concepts, and example items.
- **stats()**: corpus size, retention window, and breakdowns by source and kind.

## Configuration

- `AI_FIREHOSE_BASE_URL` (optional): override the API base. Defaults to `https://ai-firehose.com`.

## About

AI Firehose ingests the most salient AI signal each day and organizes it across four time depths: day, week, month, and quarter. This server exposes its query surface over MCP. There is no chatbot; these are programmatic query tools.

Source: https://github.com/aigamma/ai-firehose.com . MIT licensed.
