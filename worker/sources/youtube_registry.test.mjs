import { test } from "node:test";
import assert from "node:assert/strict";
import { activeChannels } from "./youtube_registry.mjs";

// The registry's resolveChannel/addChannel/removeChannel paths hit the network or mutate
// the committed roster file, so they are exercised by the onboarding command, not here.
// activeChannels is the pure, read-only filter the ingestion loop uses to choose which
// channels to poll; this pins its contract against the committed roster
// (worker/sources/youtube_channels.json): every returned channel is active and has a
// channel_id, so an inactive or malformed entry is never polled. The hide_from_directory
// flag is deliberately NOT a filter here, because a track-only channel is still ingested
// for signal (it is only withheld from the directory listing surface).

test("activeChannels returns only active channels that carry a channel_id", () => {
  const active = activeChannels();
  assert.ok(Array.isArray(active), "returns an array");
  assert.ok(active.length > 0, "the committed roster has active channels to poll");
  for (const c of active) {
    assert.ok(c.active, `expected ${c.name || c.channel_id} to be active`);
    assert.ok(c.channel_id, `expected ${c.name || "a channel"} to have a channel_id`);
  }
});
