import { test } from "node:test";
import assert from "node:assert/strict";
import { computeBoards } from "./boards.mjs";
import { HORIZONS, KINDS, RETENTION_DAYS } from "../../src/data/registry.js";

// computeBoards is the shared, pure board builder (run.mjs and recompute_boards.mjs
// both call it). It composes already-tested primitives (buildSeries, windowSum,
// windowTrend, rotationForEntities); these tests pin the COMPOSITION it owns: a board
// per kind x horizon, the served entity shape, the attention > 0 filter, the
// descending sort, the 16-cap, and that a concept is scoped to the kind it appeared
// under and to the horizon window it falls inside. todayMs is supplied (the function
// reads no clock), so every case is deterministic.

const DAY = 86400000;
const TODAY = Date.parse("2026-06-01T12:00:00Z");
const daysAgo = (n) => new Date(TODAY - n * DAY).toISOString();

// One synthetic corpus item in the shape buildSeries reads.
const item = (kind, concepts, ageDays = 0, weight = 1) => ({
  kind,
  concepts,
  published_at: daysAgo(ageDays),
  source_authority_weight: weight,
});

const build = (working) =>
  computeBoards(working, { todayMs: TODAY, retentionDays: RETENTION_DAYS, horizons: HORIZONS, kinds: KINDS });

const labels = (board) => board.map((e) => e.label);

test("emits a board array for every kind x horizon", () => {
  const boards = build([item("technique", ["Alpha"])]);
  for (const k of KINDS) {
    for (const h of HORIZONS) {
      assert.ok(Array.isArray(boards[`${k.key}_${h.key}`]), `${k.key}_${h.key} is an array`);
    }
  }
  // No stray keys beyond the kind x horizon grid.
  assert.equal(Object.keys(boards).length, KINDS.length * HORIZONS.length);
});

test("entities carry only the served fields, are filtered to attention > 0, and sorted desc", () => {
  const boards = build([
    item("technique", ["Alpha"]), // Alpha mentioned twice today -> more attention
    item("technique", ["Alpha"]),
    item("technique", ["Beta"]),
  ]);
  const day = boards["technique_day"];
  assert.ok(day.length >= 2, "both concepts present");
  for (const e of day) {
    assert.equal(typeof e.id, "string");
    assert.equal(typeof e.label, "string");
    assert.equal(typeof e.attention, "number");
    assert.ok(e.attention > 0, "filtered to attention > 0");
    assert.equal(typeof e.delta, "number");
    assert.ok(Array.isArray(e.sparkline), "carries a sparkline");
    // The rotation fields (ratio, momentum, quadrant) are NOT shipped on the board.
    assert.equal(e.ratio, undefined);
    assert.equal(e.quadrant, undefined);
    // outlier is omitted entirely, or exactly the two flags TrendBoard renders.
    if (e.outlier !== undefined) {
      assert.deepEqual(Object.keys(e.outlier).sort(), ["breakout", "new_entrant"]);
    }
  }
  for (let i = 1; i < day.length; i++) {
    assert.ok(day[i - 1].attention >= day[i].attention, "descending by attention");
  }
  assert.equal(day[0].label, "Alpha", "the twice-mentioned concept ranks first");
});

test("the day window excludes older items that still appear in longer horizons", () => {
  const boards = build([
    item("technique", ["Fresh"], 0), // today
    item("technique", ["Older"], 5), // 5 days ago
  ]);
  assert.ok(labels(boards["technique_day"]).includes("Fresh"));
  assert.ok(!labels(boards["technique_day"]).includes("Older"), "5-day-old item is outside the 1-day window");
  assert.ok(labels(boards["technique_week"]).includes("Older"), "but inside the 7-day window");
  assert.ok(labels(boards["technique_quarter"]).includes("Older"), "and the 90-day window");
});

test("a concept is scoped to the kind it was mentioned under", () => {
  const boards = build([
    item("tool", ["OnlyTool"]),
    item("opinion", ["OnlyOpinion"]),
  ]);
  assert.ok(labels(boards["tool_day"]).includes("OnlyTool"));
  assert.ok(!labels(boards["technique_day"]).includes("OnlyTool"), "a tool concept does not leak into the technique board");
  assert.ok(labels(boards["opinion_day"]).includes("OnlyOpinion"));
  assert.ok(!labels(boards["tool_day"]).includes("OnlyOpinion"));
});

test("each board is capped at 16 entities", () => {
  const working = [];
  for (let i = 0; i < 25; i += 1) working.push(item("technique", [`Concept ${i}`]));
  const day = build(working)["technique_day"];
  assert.equal(day.length, 16, "25 eligible concepts are capped to the top 16");
});

test("is deterministic for the same input", () => {
  const working = [item("technique", ["Alpha"]), item("tool", ["Beta"], 2), item("opinion", ["Gamma"], 10)];
  assert.deepEqual(build(working), build(working));
});

test("an empty corpus yields empty boards, never throws", () => {
  const boards = build([]);
  for (const k of KINDS) {
    for (const h of HORIZONS) {
      assert.deepEqual(boards[`${k.key}_${h.key}`], []);
    }
  }
});
