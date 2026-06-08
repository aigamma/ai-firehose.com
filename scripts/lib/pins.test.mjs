import { test } from "node:test";
import assert from "node:assert/strict";
import { isPinExpired, prunePins } from "./pins.mjs";

const NOW = Date.parse("2026-06-08T00:00:00Z");
const agoISO = (days) => new Date(NOW - days * 86400000).toISOString();

test("a pin expires strictly after 90 days on the site (keyed on pinned_at)", () => {
  assert.equal(isPinExpired({ videoId: "a", pinned_at: agoISO(89) }, NOW), false);
  assert.equal(isPinExpired({ videoId: "a", pinned_at: agoISO(90) }, NOW), false); // exactly 90d is still kept
  assert.equal(isPinExpired({ videoId: "a", pinned_at: agoISO(91) }, NOW), true);
});

test("a pin with no or unparseable pinned_at is not expired (grace until stamped)", () => {
  assert.equal(isPinExpired({ videoId: "a" }, NOW), false);
  assert.equal(isPinExpired({ videoId: "a", pinned_at: "" }, NOW), false);
  assert.equal(isPinExpired({ videoId: "a", pinned_at: "not-a-date" }, NOW), false);
});

test("prunePins splits kept from dropped", () => {
  const pins = [
    { videoId: "fresh", pinned_at: agoISO(10) },
    { videoId: "old", pinned_at: agoISO(120) },
    { videoId: "unstamped" },
  ];
  const { kept, dropped } = prunePins(pins, NOW);
  assert.deepEqual(kept.map((p) => p.videoId), ["fresh", "unstamped"]);
  assert.deepEqual(dropped.map((p) => p.videoId), ["old"]);
});
