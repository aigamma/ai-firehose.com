import test from "node:test";
import assert from "node:assert/strict";
import { findBrokenRelated, findBrokenPaths, findAmbiguousAliases } from "./check_glossary.mjs";

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

// The wiki-linker gives each surface form one owner (label wins, then first alias).
// An alias claimed by two or more concepts with no label owner auto-links arbitrarily,
// a silent mislink. Keep the authored alias namespace unambiguous as the KB grows.
test("no authored alias is ambiguous across concepts", () => {
  const ambiguous = findAmbiguousAliases();
  assert.deepEqual(
    ambiguous,
    [],
    `\nAmbiguous aliases (auto-link arbitrarily):\n${ambiguous.map((b) => `  "${b.surface}" -> ${b.owners.join(", ")}`).join("\n")}\n`,
  );
});
