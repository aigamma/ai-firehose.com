import test from "node:test";
import assert from "node:assert/strict";
import { findBrokenRelated, findBrokenPaths } from "./check_glossary.mjs";

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

test("every learning-path step resolves to a real concept", () => {
  const broken = findBrokenPaths();
  assert.deepEqual(
    broken,
    [],
    `\nDangling learning-path steps:\n${broken.map((b) => `  ${b.path} -> ${b.step}`).join("\n")}\n`,
  );
});
