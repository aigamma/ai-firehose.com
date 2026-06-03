import { complete, MODELS } from "../lib/anthropic.mjs";
import { loadCache, saveCache } from "../lib/cache.mjs";
import { stripEmDashes } from "../lib/text.mjs";

/*
  One-sentence concept definitions for the glossary hubs. Generated for the top
  concepts by attention (cost-bounded), grounded in a few items that mention the
  concept, and cached by concept id so re-runs are nearly free. The cache is
  keyed by id, so a concept keeps its definition across runs even as attention
  shifts.
*/
const SYSTEM =
  "You write one-sentence, factual definitions of AI concepts for a glossary. No hype, no em dashes. If it is a tool or product, say what it is and what it does. If it is a technique, say what it is and what problem it addresses. If it is a discourse theme, state the question at stake. One sentence, under 40 words.";

export async function defineConcepts(concepts, conceptToItems = {}, { limit = 60, model = MODELS.enduring } = {}) {
  const cache = loadCache("definitions");
  const top = [...concepts].sort((a, b) => (b.attention || 0) - (a.attention || 0)).slice(0, limit);
  let made = 0;
  for (const c of top) {
    if (cache[c.id]) continue;
    const ctx = (conceptToItems[c.id] || []).slice(0, 3).map((it) => `- ${it.title}`).join("\n");
    const prompt = `Concept: ${c.label}\nKind: ${c.kind}\nSeen in:\n${ctx || "- (no examples)"}\n\nWrite the one-sentence definition.`;
    try {
      const text = await complete({ model, system: SYSTEM, prompt, maxTokens: 120 });
      cache[c.id] = stripEmDashes(text.replace(/\s+/g, " ").trim());
      made += 1;
    } catch {
      /* skip on error; try again next run */
    }
  }
  if (made) saveCache("definitions", cache);
  return cache;
}
