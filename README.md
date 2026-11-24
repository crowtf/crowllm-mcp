# crowllm-mcp

[![crowllm-mcp MCP server](https://glama.ai/mcp/servers/@crowtf/crowllm-mcp/badges/score.svg)](https://glama.ai/mcp/servers/@crowtf/crowllm-mcp)
[![npm](https://img.shields.io/npm/v/crowllm-mcp.svg)](https://www.npmjs.com/package/crowllm-mcp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP server for [CrowLLM](https://crowllm.com), an OpenAI-compatible gateway: one key for models from several labs, plus a mostly zero-rated `:free` shelf (31 of the 39 free-suffixed ids bill nothing today — the shelf rotates, so ask the server rather than trusting a list).

Works with any MCP client over stdio: Claude Desktop, Cline, Continue, Cherry Studio, LibreChat, and the rest.

## Tools

| Tool | What it does | Key needed |
| --- | --- | --- |
| `search_models` | Search the live catalogue (`GET /v1/models`), optionally free ids only | no |
| `get_pricing` | USD per 1M tokens for any model, from `GET /api/pricing` | no |
| `chat` | Send a prompt through `POST /v1/chat/completions`, returns the reply and token usage | yes |

Example prompts once installed:

- "Which CrowLLM models are free right now, and what do they cost per million tokens?"
- "Compare the input and output price of three long-context models on CrowLLM."
- "Ask the cheapest free model to summarise this text."

## Install

Published on npm — no build step:

```bash
npm install -g crowllm-mcp
```

or run it without installing:

```bash
npx -y crowllm-mcp
```

Prefer a pinned checkout? Use a tag:

```bash
npx -y github:crowtf/crowllm-mcp#v0.1.2
```

## Configure (Cline / Claude Desktop / any MCP client)

```json
{
  "mcpServers": {
    "crowllm": {
      "command": "npx",
      "args": ["-y", "crowllm-mcp"],
      "env": {
        "CROWLLM_API_KEY": "your-crowllm-key"
      }
    }
  }
}
```

- `CROWLLM_API_KEY` — created at [crowllm.com](https://crowllm.com); required for `chat`, optional for `search_models` and `get_pricing`
- `CROWLLM_BASE_URL` — optional, defaults to `https://crowllm.com`

## Free tier

`search_models`' `free_only` filters by the `:free` id suffix. Most of those ids bill at zero, but a few are metered, so check `get_pricing` (or call it with `free_only: true`) before relying on one. Free ids are rate-limited — good for exploration, not for long agent loops.

The same host also serves Anthropic (`/v1/messages`, bare origin) and Gemini (`/v1beta`) wire shapes; this package speaks the OpenAI shape.

## Links

- Gateway: https://crowllm.com · catalogue: https://crowllm.com/v1/models (no key)
- Rates: https://crowllm.com/api/pricing (no key)
- MCP registry manifest: `server.json` in this repo targets `io.github.crowtf/crowllm-mcp` (stdio); the registry entry is published with the release workflow
- Glama: https://glama.ai/mcp/servers/@crowtf/crowllm-mcp

## License

MIT
