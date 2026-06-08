import { test } from "node:test";
import assert from "node:assert/strict";
import { withinRetention } from "./build_creators.mjs";

// The Watch stream caps featured videos at the rolling-quarter retention, in parity with
// the corpus prune (keyed on published_at). Guards against an inverted comparison or a
// unit slip in the boundary, the most likely way this silently breaks.
test("withinRetention keeps in-window videos and drops stale ones", () => {
  // A fixed cutoff: anything published on or after 2026-03-01 is in the window.
  const cutoff = Date.parse("2026-03-01T00:00:00Z");

  assert.equal(withinRetention("2026-05-01T00:00:00Z", cutoff), true, "recent video kept");
  assert.equal(withinRetention("2026-03-01T00:00:00Z", cutoff), true, "exactly at the cutoff kept");
  assert.equal(withinRetention("2026-01-01T00:00:00Z", cutoff), false, "stale video dropped");
});

test("withinRetention drops undated and unparseable videos", () => {
  const cutoff = Date.parse("2026-03-01T00:00:00Z");
  assert.equal(withinRetention(null, cutoff), false);
  assert.equal(withinRetention("", cutoff), false);
  assert.equal(withinRetention("not-a-date", cutoff), false);
});
