import test from "node:test";
import assert from "node:assert/strict";
import { findBrokenRelated } from "./check_glossary.mjs";

// The doc anti-staleness discipline, extended to the knowledge graph: a glossary
// `related:` slug that does not resolve to a real concept is silently dropped from
// the hub mesh by build_glossary, so this fails the suite instead, keeping the
// cross-links honest as the KB grows.
test("every glossary related link resolves to a real concept", () => {
  const broken = findBrokenRelated();
  assert.deepEqual(
    broken,
    [],
    `\nDangling related links (silently dropped by the build):\n${broken.map((b) => `  ${b.slug} -> ${b.related}`).join("\n")}\n`,
  );
});
