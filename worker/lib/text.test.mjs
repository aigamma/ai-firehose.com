import { test } from "node:test";
import assert from "node:assert/strict";
import { stripEmDashes } from "./text.mjs";

test("stripEmDashes replaces em dashes (and surrounding spaces) with a comma", () => {
  assert.equal(stripEmDashes("agents — they browse — and act"), "agents, they browse, and act");
  assert.equal(stripEmDashes("open—source"), "open, source");
  assert.equal(stripEmDashes("A, — B"), "A, B"); // no doubled comma
});

test("stripEmDashes leaves en dashes, hyphens, and non-strings alone", () => {
  assert.equal(stripEmDashes("2020–2024"), "2020–2024"); // en dash, numeric range
  assert.equal(stripEmDashes("state-of-the-art"), "state-of-the-art");
  assert.equal(stripEmDashes("no dashes here"), "no dashes here");
  assert.equal(stripEmDashes(undefined), undefined);
  assert.equal(stripEmDashes(null), null);
});
