# Installing crowllm-mcp

Quick install for LLM agents:

1. Run `npx -y crowllm-mcp` (Node.js 18+).
2. Set `CROWLLM_API_KEY` (create one at https://crowllm.com) if you want the `chat` tool.
3. Add the server to your MCP config:

```json
{
  "mcpServers": {
    "crowllm": {
      "command": "npx",
      "args": ["-y", "crowllm-mcp"],
      "env": { "CROWLLM_API_KEY": "your-crowllm-key" }
    }
  }
}
```

Tools: `search_models`, `get_pricing`, `chat`. No build step; Node.js only.
