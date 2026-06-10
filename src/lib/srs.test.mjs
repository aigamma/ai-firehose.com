// Unit tests for the pure SM-2-lite scheduler (src/lib/srs.js). Every call passes a
// fixed nowMs, so the suite is deterministic and never reads the wall clock. Run with:
//   node --test src/lib/srs.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { newCard, gradeCard, selectDue, dueCount, pruneStates, seeLess, seeMore, setFlags } from "./srs.js";

const NOW = 1_700_000_000_000; // a fixed epoch ms for every test
const DAY = 86400000;

test("newCard is due immediately with default ease and empty history", () => {
  const c = newCard("alpha", NOW);
  assert.equal(c.id, "alpha");
  assert.equal(c.due, NOW);
  assert.equal(c.interval, 0);
  assert.equal(c.ease, 2.5);
  assert.equal(c.reps, 0);
  assert.equal(c.lapses, 0);
});

test("a good grade grows the interval and pushes due into the future", () => {
  const fresh = newCard("alpha", NOW);

  // First success: 1-day interval, due one day out, ease unchanged.
  const g1 = gradeCard(fresh, "good", NOW);
  assert.equal(g1.interval, 1);
  assert.equal(g1.reps, 1);
  assert.equal(g1.ease, 2.5);
  assert.equal(g1.due, NOW + 1 * DAY);

  // Second success: interval = prior interval * ease (1 * 2.5 = 2.5), and it grows.
  const g2 = gradeCard(g1, "good", NOW);
  assert.ok(g2.interval > g1.interval, "interval should grow on repeated good");
  assert.equal(g2.interval, 2.5);
  assert.equal(g2.due, NOW + 2.5 * DAY);
});

test("a later again increments lapses and lowers ease", () => {
  const fresh = newCard("beta", NOW);
  const good = gradeCard(fresh, "good", NOW); // ease 2.5, reps 1
  const again = gradeCard(good, "again", NOW);

  assert.equal(again.lapses, 1, "lapses increments on again");
  assert.ok(again.ease < good.ease, "ease drops on again");
  assert.ok(Math.abs(again.ease - 2.3) < 1e-9, "ease falls by 0.20");
  assert.equal(again.reps, 0, "reps resets on a lapse");
  assert.equal(again.interval, 0, "interval collapses on a lapse");
  assert.equal(again.due, NOW + 60000, "again is due about a minute later, this session");
});

test("ease cannot fall below the 1.3 floor no matter how many lapses", () => {
  let c = newCard("gamma", NOW);
  for (let i = 0; i < 20; i += 1) {
    c = gradeCard(c, "again", NOW);
  }
  assert.equal(c.ease, 1.3, "ease is clamped at the 1.3 floor");
  // And one more again keeps it pinned, not below.
  c = gradeCard(c, "again", NOW);
  assert.equal(c.ease, 1.3);
});

test("hard lowers ease by 0.15 and grows the interval gently", () => {
  const fresh = newCard("delta", NOW);
  const good = gradeCard(fresh, "good", NOW); // interval 1, ease 2.5
  const hard = gradeCard(good, "hard", NOW);
  assert.ok(Math.abs(hard.ease - 2.35) < 1e-9, "ease falls by 0.15 on hard");
  assert.equal(hard.interval, Math.max(1, 1 * 1.2), "interval grows to interval * 1.2");
  assert.equal(hard.due, NOW + hard.interval * DAY);
});

test("easy raises ease and jumps the interval to 4 days from new", () => {
  const fresh = newCard("epsilon", NOW);
  const easy = gradeCard(fresh, "easy", NOW);
  assert.ok(Math.abs(easy.ease - 2.65) < 1e-9, "ease rises by 0.15 on easy");
  assert.equal(easy.interval, 4, "a brand-new easy card jumps to a 4-day interval");
  assert.equal(easy.due, NOW + 4 * DAY);
});

test("selectDue returns only due ids, sorted by due ascending", () => {
  const states = {
    soon: { id: "soon", due: NOW - 10 * DAY, interval: 1, ease: 2.5, reps: 1, lapses: 0 },
    now: { id: "now", due: NOW, interval: 0, ease: 2.5, reps: 0, lapses: 0 },
    later: { id: "later", due: NOW + 5 * DAY, interval: 5, ease: 2.5, reps: 2, lapses: 0 },
    overdue: { id: "overdue", due: NOW - 1 * DAY, interval: 1, ease: 2.5, reps: 1, lapses: 0 },
  };
  const due = selectDue(states, NOW);
  // "later" is in the future and excluded; the rest are sorted soonest-due first.
  assert.deepEqual(due, ["soon", "overdue", "now"]);
  assert.ok(!due.includes("later"), "a not-yet-due card is excluded");
});

test("dueCount matches the number of due ids selectDue returns", () => {
  const states = {
    a: { id: "a", due: NOW - DAY, interval: 1, ease: 2.5, reps: 1, lapses: 0 },
    b: { id: "b", due: NOW, interval: 0, ease: 2.5, reps: 0, lapses: 0 },
    c: { id: "c", due: NOW + DAY, interval: 1, ease: 2.5, reps: 1, lapses: 0 },
  };
  assert.equal(dueCount(states, NOW), 2);
  assert.equal(dueCount(states, NOW), selectDue(states, NOW).length);
  assert.equal(dueCount({}, NOW), 0);
});

test("pruneStates drops unknown ids and keeps the valid ones", () => {
  const states = {
    keep: { id: "keep", due: NOW, interval: 0, ease: 2.5, reps: 0, lapses: 0 },
    drop: { id: "drop", due: NOW, interval: 0, ease: 2.5, reps: 0, lapses: 0 },
  };
  const pruned = pruneStates(states, new Set(["keep", "other"]));
  assert.deepEqual(Object.keys(pruned), ["keep"]);
  assert.ok(!("drop" in pruned), "an id absent from the valid set is removed");
  // The input is left untouched (a new object is returned).
  assert.ok("drop" in states, "pruneStates does not mutate its input");
  // An array of valid ids works the same as a Set.
  assert.deepEqual(Object.keys(pruneStates(states, ["drop"])), ["drop"]);
});

test("garbage or missing stored state is treated as a fresh card, never throws", () => {
  // A malformed state grades as if fresh: a good grade yields a 1-day interval.
  const g = gradeCard({ id: "x", due: "nope", ease: null, interval: undefined }, "good", NOW);
  assert.equal(g.interval, 1);
  assert.equal(g.ease, 2.5);
  assert.equal(g.due, NOW + DAY);
  // selectDue normalizes a corrupt due to due-now, so it surfaces rather than hiding.
  assert.deepEqual(selectDue({ x: { id: "x", due: "broken" } }, NOW), ["x"]);
});

test("seeLess pushes the interval out and eases up, so the card returns much later", () => {
  const good = gradeCard(newCard("a", NOW), "good", NOW); // interval 1, ease 2.5
  const less = seeLess(good, NOW);
  assert.equal(less.interval, 3, "interval triples (1 * 3)");
  assert.ok(Math.abs(less.ease - 2.65) < 1e-9, "ease rises by 0.15");
  assert.equal(less.due, NOW + 3 * DAY);
});

test("seeMore (challenging) brings the card back soon, lowers ease, and flags it", () => {
  const grown = gradeCard(gradeCard(newCard("b", NOW), "good", NOW), "good", NOW); // interval 2.5
  const more = seeMore(grown, NOW);
  assert.equal(more.interval, 1, "challenging keeps a short 1-day interval");
  assert.equal(more.challenging, true, "the challenging flag is set");
  assert.ok(more.ease < grown.ease, "ease drops so it stays frequent");
  assert.equal(more.due, NOW + DAY);
});

test("setFlags sets and clears flags without rescheduling, and the flag survives grading", () => {
  const good = gradeCard(newCard("c", NOW), "good", NOW);
  const fav = setFlags(good, { fav: true }, NOW);
  assert.equal(fav.fav, true);
  assert.equal(fav.due, good.due, "favoriting does not reschedule");
  assert.equal(gradeCard(fav, "good", NOW).fav, true, "favorite carries across grading");
  assert.ok(!("fav" in setFlags(fav, { fav: false }, NOW)), "a flag can be cleared");
});

test("a removed card never resurfaces in selectDue or dueCount, even when overdue", () => {
  const states = {
    live: { id: "live", due: NOW - DAY, interval: 1, ease: 2.5, reps: 1, lapses: 0 },
    gone: { id: "gone", due: NOW - 10 * DAY, interval: 1, ease: 2.5, reps: 1, lapses: 0, removed: true },
  };
  assert.deepEqual(selectDue(states, NOW), ["live"]);
  assert.equal(dueCount(states, NOW), 1);
});
