/*
  Prune expired hand-pinned videos from the record (`sources/featured.json`).

  The pin counterpart to the corpus retention prune: it stamps `pinned_at` on any pin that
  lacks it (starting its 90-day on-site clock) and removes any pin past `PIN_RETENTION_DAYS`
  days on the site, so a pinned video does not exist in the record after 90 days. Rewrites
  `featured.json` in place when anything changed. Runs in the worker (`run.mjs`) each pass and
  is committed by `worker/publish.sh`; also available on demand via `npm run prune:pins`.
  See `docs/SOURCES.md`.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { prunePins } from "./lib/pins.mjs";

const FEATURED = resolve(dirname(fileURLToPath(import.meta.url)), "../sources/featured.json");

export function pruneFeaturedPins({ nowMs = Date.now(), todayISO = new Date().toISOString().slice(0, 10) } = {}) {
  const featured = JSON.parse(readFileSync(FEATURED, "utf8"));
  const original = featured.pinned || [];

  // Stamp pinned_at on any pin missing it, so its on-site clock starts now.
  let stamped = 0;
  const withStamps = original.map((p) => {
    if (p && p.videoId && !p.pinned_at) {
      stamped += 1;
      return { ...p, pinned_at: todayISO };
    }
    return p;
  });

  const { kept, dropped } = prunePins(withStamps, nowMs);
  if (stamped || dropped.length) {
    featured.pinned = kept;
    writeFileSync(FEATURED, `${JSON.stringify(featured, null, 2)}\n`);
  }
  return { kept, dropped, stamped };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const { kept, dropped, stamped } = pruneFeaturedPins();
  console.log(`prune:pins: ${kept.length} kept, ${dropped.length} expired and removed, ${stamped} newly stamped`);
}
