/*
  Pure transforms that shape precomputed data into served payloads. Shared by the
  pipeline (run.mjs) and the one-time migration (slim_artifacts.mjs) so the rule
  "a served artifact ships only what a page renders" lives in exactly one place
  and can be unit tested. See docs/RAG.md for the artifact schemas.
*/

export const DEF_SNIPPET = 180;

// A short, single-line teaser for the glossary list. The full definition lives in
// the per-concept hub.
export function defSnippet(definition, max = DEF_SNIPPET) {
  if (!definition) return "";
  return definition.length > max ? `${definition.slice(0, max).trimEnd()}…` : definition;
}

// The light glossary list/search payload: identity, attention, aliases, snippet.
// Drops the heavy hub fields (definition, neighbors, axis_positions, top_items).
export function slimGlossaryConcept(c) {
  return {
    id: c.id,
    label: c.label,
    kind: c.kind,
    attention: c.attention,
    aliases: c.aliases || [],
    def_snippet: defSnippet(c.definition),
  };
}

// The served spectrum axis: drop the 1024-dim axis_vector (server-only, for future
// live projection) and the raw position (the UI reads position_normalized).
export function slimSpectrumAxis({ axis_vector, positions, ...ax }) {
  return { ...ax, positions: (positions || []).map(({ position, ...p }) => p) };
}

// The axis vectors, parked outside the browser payload (worker cache) for a future
// server-side live-projection endpoint.
export function axisVectors(spectrums) {
  return spectrums.map((a) => ({ slug: a.slug, axis_vector: a.axis_vector }));
}
