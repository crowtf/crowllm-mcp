#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = (process.env.CROWLLM_BASE_URL || "https://crowllm.com").replace(/\/+$/, "");
const API_KEY = process.env.CROWLLM_API_KEY || "";

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function postJson(path, body) {
  if (!API_KEY) throw new Error("CROWLLM_API_KEY is not set");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  return data;
}

const text = (value) => ({
  content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value) }],
});

const server = new McpServer({ name: "crowllm", version: "0.1.0" });

server.registerTool(
  "search_models",
  {
    title: "Search CrowLLM models",
    description:
      "Search the live CrowLLM catalog (GET /v1/models). Optionally return only ':free' ids (most, but not all, bill at zero - use get_pricing for the truly zero-rated rows).",
    inputSchema: {
      query: z.string().optional().describe("Substring to match against model ids"),
      free_only: z.boolean().optional().describe("Only return ids ending in ':free' (most bill at zero; not all do)"),
      limit: z.number().int().min(1).max(500).optional().describe("Maximum number of ids (default 100)"),
    },
  },
  async ({ query, free_only, limit }) => {
    const data = await getJson("/v1/models");
    let ids = (data.data || []).map((m) => m.id);
    if (free_only) ids = ids.filter((id) => id.endsWith(":free"));
    if (query) ids = ids.filter((id) => id.toLowerCase().includes(query.toLowerCase()));
    const total = ids.length;
    return text({ total, models: ids.slice(0, limit ?? 100) });
  }
);

server.registerTool(
  "get_pricing",
  {
    title: "CrowLLM pricing",
    description:
      "List CrowLLM list prices in USD per 1M tokens. Input = 2 x model_ratio; output = input x completion_ratio.",
    inputSchema: {
      free_only: z.boolean().optional().describe("Only zero-rated rows"),
      query: z.string().optional().describe("Substring to match against model names"),
      limit: z.number().int().min(1).max(500).optional().describe("Maximum rows (default 50)"),
    },
  },
  async ({ free_only, query, limit }) => {
    const data = await getJson("/api/pricing");
    let rows = (data.data || []).map((r) => {
      const input = Number(r.model_ratio ?? 0) * 2;
      const output = input * Number(r.completion_ratio ?? 1);
      return {
        model: r.model_name,
        free: input === 0 && output === 0,
        input_per_mtok: Number(input.toFixed(4)),
        output_per_mtok: Number(output.toFixed(4)),
      };
    });
    if (free_only) rows = rows.filter((r) => r.free);
    if (query) rows = rows.filter((r) => r.model.toLowerCase().includes(query.toLowerCase()));
    return text({ total: rows.length, pricing: rows.slice(0, limit ?? 50) });
  }
);

server.registerTool(
  "chat",
  {
    title: "Chat through CrowLLM",
    description:
      "Send a prompt to any CrowLLM model (POST /v1/chat/completions) and return the reply with token usage.",
    inputSchema: {
      model: z.string().describe("Model id, e.g. deepseek-v4-flash"),
      prompt: z.string().describe("User message"),
      system: z.string().optional().describe("Optional system message"),
      temperature: z.number().min(0).max(2).optional(),
      max_tokens: z.number().int().min(1).optional(),
    },
  },
  async ({ model, prompt, system, temperature, max_tokens }) => {
    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });
    const data = await postJson("/v1/chat/completions", {
      model,
      messages,
      ...(temperature !== undefined ? { temperature } : {}),
      ...(max_tokens !== undefined ? { max_tokens } : {}),
    });
    const choice = data.choices?.[0];
    return text({
      model: data.model ?? model,
      reply: choice?.message?.content ?? "",
      finish_reason: choice?.finish_reason ?? null,
      usage: data.usage ?? null,
    });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
