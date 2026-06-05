import test from "node:test";
import assert from "node:assert/strict";
import { findBadCountClaims, findBadModelTierClaims } from "./check_doc_accuracy.mjs";

test("public count claims match the generated artifacts", () => {
  const bad = findBadCountClaims();
  assert.deepEqual(
    bad,
    [],
    `\nStale public count claims:\n${bad.map((b) => `  ${b.file}: expected ${b.expected}; found ${JSON.stringify(b.found ?? b.reason)} in ${b.line || "(missing)"}`).join("\n")}\n`,
  );
});

test("CLAUDE.md names the configured model tiers and families", () => {
  const bad = findBadModelTierClaims();
  assert.deepEqual(
    bad,
    [],
    `\nModel tier docs are stale:\n${bad.map((m) => `  ${m.tier}: ${m.model}`).join("\n")}\n`,
  );
});
