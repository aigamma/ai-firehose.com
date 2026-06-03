import test from "node:test";
import assert from "node:assert/strict";
import { findNewStaleRefs } from "./check_docs_fresh.mjs";

// The durable-docs protocol made enforceable: a current-state doc that names a
// source path or `npm run` script absent from the committed tree fails the suite,
// UNLESS it is in scripts/docs_stale_baseline.json (tracked debt). New drift is
// blocked immediately. History logs are excluded by the checker (see its header).
test("current-state docs introduce no new stale references", () => {
  const fresh = findNewStaleRefs();
  assert.deepEqual(
    fresh,
    [],
    `\nNew stale doc references found:\n${fresh.map((b) => `  [${b.kind}] ${b.doc} -> ${b.ref}`).join("\n")}\n` +
      "Fix the doc to match the committed tree (do not add to the baseline to silence it).\n",
  );
});
