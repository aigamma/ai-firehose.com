// Unit tests for the pure gamification logic (src/lib/game.js). Deterministic: every call
// passes fixed inputs (no wall clock). Run with: node --test src/lib/game.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { xpFor, levelFor, updateStreak, masteryStats, newlyUnlocked } from "./game.js";

test("xpFor rewards correct recall over lapses, with a first-seen bonus", () => {
  assert.equal(xpFor("again"), 2);
  assert.equal(xpFor("good"), 10);
  assert.equal(xpFor("easy"), 12);
  assert.equal(xpFor("good", true), 15); // +5 first-seen bonus
  assert.equal(xpFor("nonsense"), 10); // an unknown grade is treated as good
});

test("levelFor follows the quadratic curve and reports progress to the next level", () => {
  assert.equal(levelFor(0).level, 1);
  assert.equal(levelFor(50).level, 2); // 50 * 1^2
  assert.equal(levelFor(199).level, 2);
  assert.equal(levelFor(200).level, 3); // 50 * 2^2
  const l = levelFor(100); // level 2: starts at 50, next at 200
  assert.equal(l.into, 50);
  assert.equal(l.span, 150);
  assert.equal(l.toNext, 100);
});

test("updateStreak: same day holds, the next day increments, a gap resets to 1", () => {
  assert.deepEqual(updateStreak({ current: 3, longest: 5, lastDay: "2026-06-09" }, "2026-06-09"), { current: 3, longest: 5, lastDay: "2026-06-09" });
  assert.deepEqual(updateStreak({ current: 3, longest: 5, lastDay: "2026-06-09" }, "2026-06-10"), { current: 4, longest: 5, lastDay: "2026-06-10" });
  assert.deepEqual(updateStreak({ current: 3, longest: 5, lastDay: "2026-06-09" }, "2026-06-12"), { current: 1, longest: 5, lastDay: "2026-06-12" });
  assert.deepEqual(updateStreak({}, "2026-06-09"), { current: 1, longest: 1, lastDay: "2026-06-09" }); // a fresh streak
});

test("masteryStats counts mature cards (interval >= 21), excludes removed, groups by category", () => {
  const concepts = [
    { id: "a", category: "Deep Learning" },
    { id: "b", category: "Deep Learning" },
    { id: "c", category: "RL" },
  ];
  const states = {
    a: { interval: 30 }, // mature
    b: { interval: 5 }, // not yet
    c: { interval: 100, removed: true }, // removed, excluded even though mature
  };
  const m = masteryStats(states, concepts);
  assert.equal(m.mastered, 1);
  assert.equal(m.total, 3);
  assert.deepEqual(m.byCategory["Deep Learning"], { mastered: 1, total: 2 });
  assert.deepEqual(m.byCategory["RL"], { mastered: 0, total: 1 });
});

test("newlyUnlocked returns satisfied achievements not already unlocked", () => {
  const ctx = { totalReviews: 100, streak: 7, level: 5, mastered: 50, categoryDone: false };
  const fresh = newlyUnlocked(ctx, { first: 1, hundred: 1 }); // first + hundred already unlocked
  assert.ok(fresh.includes("streak7") && fresh.includes("level5") && fresh.includes("mastered50"));
  assert.ok(!fresh.includes("hundred"), "already-unlocked ids are excluded");
  assert.ok(!fresh.includes("thousand"), "unmet achievements are excluded");
  assert.deepEqual(newlyUnlocked({ totalReviews: 0 }, {}), []); // nothing met yet
});
