/*
  Self-expiring hand-pinned Watch videos.

  A pin (`sources/featured.json` `pinned[]`) looks evergreen, but the rule is that nothing
  lingers: a pinned video is removed from the record `PIN_RETENTION_DAYS` (90) days after it
  went ON THE SITE, keyed on `pinned_at` (when it was pinned), not the video's publish date.
  This is the pin counterpart to the corpus retention prune; the durable glossary layer is
  the only thing exempt from expiry.

  Pure and unit-tested (`scripts/lib/pins.test.mjs`). A pin with no `pinned_at` is treated as
  not-yet-expired (grace): the stamp is written at add time and by `pruneFeaturedPins`, so a
  hand-added entry starts its 90-day clock rather than vanishing early or lingering forever.
*/
import { PIN_RETENTION_DAYS } from "../../src/data/registry.js";

const DAY_MS = 86400000;

// True once a pin has been on the site for strictly more than `days` (by `pinned_at`).
export function isPinExpired(pin, nowMs, days = PIN_RETENTION_DAYS) {
  const at = pin?.pinned_at;
  if (!at) return false; // not stamped yet: not expired until its clock is started
  const t = new Date(at).getTime();
  if (!Number.isFinite(t)) return false;
  return nowMs - t > days * DAY_MS;
}

// Split pins into the ones still inside their on-site window and the expired ones.
export function prunePins(pinned = [], nowMs, days = PIN_RETENTION_DAYS) {
  const kept = [];
  const dropped = [];
  for (const p of pinned) (isPinExpired(p, nowMs, days) ? dropped : kept).push(p);
  return { kept, dropped };
}
