import { structured, MODELS } from "../lib/anthropic.mjs";
import { stripEmDashes } from "../lib/text.mjs";

/*
  Classification without guessing. Claude returns schema-valid JSON via a forced
  tool call: the kind (with a one-line justification), a factual summary, the
  concepts referenced, named entities, and (for opinions) the stance. kind is
  decided here, not by the source, because one video can teach, demo, and argue.
*/
const TOOL = {
  name: "record_item",
  description: "Record the classification and extraction for one AI-industry item.",
  input_schema: {
    type: "object",
    properties: {
      kind: {
        type: "string",
        enum: ["technique", "tool", "opinion"],
        description: "technique = a method/approach/algorithm; tool = a product/library/model/framework/service; opinion = a take/prediction/debate/commentary. Pick the one dominant kind.",
      },
      kind_reason: { type: "string", description: "One short clause justifying the kind." },
      summary: { type: "string", description: "Two or three factual sentences. No em dashes." },
      concepts: {
        type: "array",
        items: { type: "string" },
        description: "Canonical short names of AI techniques, tools, or ideas referenced, for example Mixture of Experts, vLLM, test-time compute.",
      },
      entities: { type: "array", items: { type: "string" }, description: "Organizations, models, people, or products named." },
      stance: { type: "string", description: "For an opinion, the position taken in one clause. Empty otherwise." },
    },
    required: ["kind", "kind_reason", "summary", "concepts", "entities"],
  },
};

const SYSTEM = `You classify items from the AI industry for an intelligence dashboard that is structured as an outlier hunt. Be precise and factual. Never use em dashes. Concept names must be short and canonical so that near-duplicates collapse later (prefer "test-time compute" over "scaling inference-time compute"). One item has exactly one primary kind; pick the dominant one and justify briefly.`;

export async function classifyItem(item, { model = MODELS.bulk } = {}) {
  const prompt = [
    `Source: ${item.source}`,
    item.author_or_channel ? `Channel/Author: ${item.author_or_channel}` : "",
    `Title: ${item.title}`,
    "",
    "Text:",
    (item.summary_text || "").slice(0, 6000),
  ]
    .filter(Boolean)
    .join("\n");
  const r = await structured({ model, system: SYSTEM, prompt, tool: TOOL, maxTokens: 700 });
  // Defense in depth: the prompt forbids em dashes, but enforce it on the prose
  // the model returns (summary and stance are displayed; see lib/text.mjs).
  r.summary = stripEmDashes(r.summary);
  if (r.stance) r.stance = stripEmDashes(r.stance);
  // concepts and entities flow verbatim into cluster names and glossary/concept
  // labels, so sanitize them too. stripEmDashes leaves non-strings untouched.
  if (Array.isArray(r.concepts)) r.concepts = r.concepts.map(stripEmDashes);
  if (Array.isArray(r.entities)) r.entities = r.entities.map(stripEmDashes);
  return r;
}
