# crowllm-mcp

MCP server for [CrowLLM](https://crowllm.com), an OpenAI-compatible gateway with one key for 180+ models and a zero-rated `:free` shelf.

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

- Use `search_models` with `free_only: true` to see ids that bill at zero.
- Forked/free ids are rate-limited; use them for exploration rather than long loops.

## License

MIT
