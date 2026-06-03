import test from "node:test";
import assert from "node:assert/strict";
import { scanText, findEmDashes } from "./check_no_emdash.mjs";

// The em dash is referenced only by code point so this test file contains no literal
// U+2014 (and would not trip the gate if it were ever in scope).
const EM = String.fromCharCode(0x2014);

test("scanText detects an em dash and reports its line and column", () => {
  const hits = scanText(`clean first line\nthen a bad ${EM} dash`);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 2);
  assert.ok(hits[0].col > 1);
});

test("scanText finds multiple em dashes on one line", () => {
  assert.equal(scanText(`a ${EM} b ${EM} c`).length, 2);
});

test("scanText passes hyphens and en-dash numeric ranges (only the em dash is banned)", () => {
  assert.deepEqual(scanText("a normal-hyphen, a range 3–5, and prose."), []);
});

// Integration: the live authored tree must be em-dash free. This is what keeps the
// project's first writing rule from silently rotting as the KB grows by AI authoring.
test("no em dashes in authored generative text (live tree)", () => {
  const hits = findEmDashes();
  assert.deepEqual(
    hits,
    [],
    `\nEm dashes found in generative text:\n${hits.map((h) => `  ${h.file}:${h.line}  ...${h.excerpt}...`).join("\n")}\n`,
  );
});
