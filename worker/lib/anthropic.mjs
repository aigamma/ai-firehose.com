import { ENV } from "./env.mjs";

// Anthropic client. Bulk classification runs on Haiku (cheap, fast); quality
// gates (concept definitions, cluster names) run on Sonnet. Structured output
// is a forced tool call, so the model must return schema-valid JSON.
const URL = "https://api.anthropic.com/v1/messages";
const VERSION = "2023-06-01";

export const MODELS = {
  bulk: "claude-haiku-4-5-20251001",
  quality: "claude-sonnet-4-6",
};

async function call(body) {
  const r = await fetch(URL, {
    method: "POST",
    headers: { "x-api-key": ENV.anthropicKey, "anthropic-version": VERSION, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 400)}`);
  return r.json();
}

// Force a tool call and return its validated input object.
export async function structured({ model = MODELS.bulk, system, prompt, tool, maxTokens = 1024 }) {
  const j = await call({
    model,
    max_tokens: maxTokens,
    system,
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
    messages: [{ role: "user", content: prompt }],
  });
  const block = (j.content || []).find((b) => b.type === "tool_use");
  if (!block) throw new Error("Anthropic returned no tool_use block");
  return block.input;
}

// Plain text completion (for short definitions, cluster names).
export async function complete({ model = MODELS.bulk, system, prompt, maxTokens = 512 }) {
  const j = await call({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] });
  return (j.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
