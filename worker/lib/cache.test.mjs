import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCache, saveCache } from "./cache.mjs";

// loadCache/saveCache are the tiny JSON cache every expensive pipeline stage leans on
// (classification, briefing, definitions) so an unchanged item is never re-paid. The
// load-bearing contract is corruption tolerance: this dev machine takes hardware faults,
// and a torn write must degrade to a clean re-classify, never a thrown pipeline. These
// tests use a dedicated cache name under the real (gitignored) worker/.cache and clean
// up after themselves; node --test isolates files, so the name cannot collide.
const DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../.cache");
const NAME = "__cache_unit_test__";
const FILE = resolve(DIR, `${NAME}.json`);
const cleanup = () => {
  for (const f of [FILE, `${FILE}.tmp`]) if (existsSync(f)) rmSync(f);
};

test("loadCache returns an empty object for a cache that does not exist", () => {
  cleanup();
  assert.deepEqual(loadCache(NAME), {});
});

test("saveCache then loadCache round-trips a nested object", () => {
  cleanup();
  saveCache(NAME, { a: 1, nested: { b: [2, 3], c: "x" } });
  assert.deepEqual(loadCache(NAME), { a: 1, nested: { b: [2, 3], c: "x" } });
  cleanup();
});

test("loadCache silently discards a corrupt cache (the hardware-fault safety net)", () => {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, "{ this is not valid json,,,");
  assert.deepEqual(loadCache(NAME), {}, "a torn write forces a clean re-classify, never throws");
  cleanup();
});

test("saveCache leaves no .tmp file behind (the rename is atomic)", () => {
  cleanup();
  saveCache(NAME, { ok: true });
  assert.ok(existsSync(FILE), "the cache file is written");
  assert.ok(!existsSync(`${FILE}.tmp`), "the temp file is renamed over, not left behind");
  cleanup();
});
