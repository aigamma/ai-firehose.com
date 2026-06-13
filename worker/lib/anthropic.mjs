import { ENV } from "./env.mjs";
import { recordLlm } from "./otel.mjs";

// Anthropic client. Three tiers chosen by stakes, not by default: bulk (Haiku)
// for high-volume day-to-day work (classifying each item); quality (Sonnet) for
// the middle tier (cluster naming, future passes); enduring (Opus 4.8) for the
// durable, high-stakes prose a smart reader keeps, the daily brief and the
// glossary definitions. Structured output is a forced tool call, so the model
// must return schema-valid JSON.
const URL = "https://api.anthropic.com/v1/messages";
const VERSION = "2023-06-01";

export const MODELS = {
  bulk: "claude-haiku-4-5-20251001",
  quality: "claude-sonnet-4-6",
  enduring: "claude-opus-4-8",
};

async function call(body, operation = "structured") {
  const startMs = Date.now();
  try {
    const r = await fetch(URL, {
      method: "POST",
      headers: { "x-api-key": ENV.anthropicKey, "anthropic-version": VERSION, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 400)}`);
    const j = await r.json();
    // Capture the token usage the worker used to discard (gen_ai.* conventions).
    recordLlm({
      system: "anthropic",
      model: j.model || body.model,
      operation,
      inputTokens: j.usage?.input_tokens ?? 0,
      outputTokens: j.usage?.output_tokens ?? 0,
      startMs,
      ok: true,
    });
    return j;
  } catch (e) {
    recordLlm({ system: "anthropic", model: body.model, operation, startMs, ok: false });
    throw e;
  }
}

// Force a tool call and return its validated input object.
export async function structured({ model = MODELS.bulk, system, prompt, tool, maxTokens = 1024, operation = "structured" }) {
  const j = await call(
    {
      model,
      max_tokens: maxTokens,
      system,
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: [{ role: "user", content: prompt }],
    },
    operation
  );
  const block = (j.content || []).find((b) => b.type === "tool_use");
  if (!block) throw new Error("Anthropic returned no tool_use block");
  return block.input;
}

// Plain text completion (for short definitions, cluster names).
export async function complete({ model = MODELS.bulk, system, prompt, maxTokens = 512, operation = "complete" }) {
  const j = await call({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] }, operation);
  return (j.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
