# crowllm-mcp

MCP server for [CrowLLM](https://crowllm.com), an OpenAI-compatible gateway with one key for 180+ models and a `:free` shelf (31 of the 40 zero-rated on 2026-11-22).

## Tools

- `search_models` — search the live catalog (`GET /v1/models`), optionally free ids only
- `get_pricing` — list prices in USD per 1M tokens from `GET /api/pricing`
- `chat` — send a prompt to any model through `POST /v1/chat/completions` and get the reply with usage

## Install

```bash
npm install -g crowllm-mcp
```

or run without installing:

```bash
npx -y crowllm-mcp
```

Until the npm release is out, run the tagged build straight from GitHub:

```bash
npx -y github:crowwdev/crowllm-mcp#v0.1.0
```

or from a clone:

```bash
git clone https://github.com/crowwdev/crowllm-mcp.git
cd crowllm-mcp
npm install
node index.js
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

## Notes

- Use `get_pricing` with `free_only: true` to see rows that bill at zero. `search_models`' `free_only` filters by the `:free` id suffix; most of those bill at zero, but a few are metered, so check `get_pricing` before relying on one.
- Forked/free ids are rate-limited; use them for exploration rather than long loops.

## License

MIT

## Registry

This repository carries a `server.json` manifest for the official MCP registry
(`io.github.crowwdev/crowllm-mcp`, npm package `crowllm-mcp`, stdio transport). It becomes
publishable once the npm package is released.
