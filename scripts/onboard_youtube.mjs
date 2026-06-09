/*
  One command to onboard a dropped list of YouTube educator handles.

  Resolves each handle (an @handle, a channel URL, or a UC id) to a channel id and adds it
  to the ingestion registry (sources/youtube_channels.json) via the same idempotent
  youtube_registry writer, then rebuilds the served directory so the local tree reflects
  the adds. Adding a channel here does three things at once: it enters the three-month RAG
  on the next worker run, it weights the trend rotation, and it appears in the Watch
  browse-and-subscribe directory.

  It NEVER commits or pushes. It prints a summary table and the exact verify/commit/push
  steps. The Fly worker reads origin/main, so the work is live only once pushed. Keyless
  (no API key, no Pinecone/Voyage/Anthropic spend).

  Usage:
    node scripts/onboard_youtube.mjs @a @b @c            # add at the safe default 0.85 mixed
    node scripts/onboard_youtube.mjs @anchor --weight=0.95
    node scripts/onboard_youtube.mjs https://youtube.com/@x UCyyyy --kind=opinion
    node scripts/onboard_youtube.mjs --track-only @a @b  # ingest and track, but do not list in the directory
    node scripts/onboard_youtube.mjs --dry @a @b         # resolve and preview, write nothing

  Full runbook, and how to choose weight and kind: docs/ONBOARD_YOUTUBE_CHANNEL.md.
*/
import { pathToFileURL } from "node:url";
import { addChannel, resolveChannel } from "../worker/sources/youtube_registry.mjs";
import { buildDirectory } from "./build_directory.mjs";

function parseArgs(argv) {
  const handles = argv.filter((a) => !a.startsWith("--"));
  const flags = Object.fromEntries(
    argv
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, v] = a.replace(/^--/, "").split("=");
        return [k, v ?? true];
      })
  );
  return { handles, flags };
}

async function main() {
  const { handles, flags } = parseArgs(process.argv.slice(2));
  if (!handles.length) {
    console.log("usage: node scripts/onboard_youtube.mjs <@handle|url|UCid> [more...] [--weight=0.85] [--kind=mixed] [--track-only] [--dry]");
    process.exit(1);
  }
  const weight = flags.weight ? Number(flags.weight) : 0.85;
  const kind = flags.kind || "mixed";
  const dry = Boolean(flags.dry);
  // --track-only (alias --hide): ingest and rotation-weight, but keep out of the public
  // directory (logged and tracked, not endorsed). --endorse (alias --list) clears it.
  const hide = flags["track-only"] || flags.hide ? true : flags.endorse || flags.list ? false : undefined;
  // --recommend (alias --inner-circle): flag the channel a recommended inner-circle pick
  // (star badge + front billing on Watch). It is the strongest endorsement, so it also
  // clears any track-only flag. --unrecommend clears it.
  const recommend = flags.recommend || flags["inner-circle"] ? true : flags.unrecommend ? false : undefined;
  const mode =
    (recommend === true ? "  [recommended: inner circle, endorsed]" : "") +
    (hide === true ? "  [track-only: ingested, hidden from the directory]" : hide === false ? "  [endorsed: listed in the directory]" : "");

  console.log(`Onboarding ${handles.length} channel(s) at weight=${weight} kind=${kind}${mode}${dry ? "   (DRY RUN, no writes)" : ""}\n`);

  const added = [];
  const skipped = [];
  for (const h of handles) {
    try {
      const info = dry ? await resolveChannel(h) : await addChannel(h, { weight, kind, hide, recommend });
      added.push({ name: info.name, handle: info.handle || h, channel_id: info.channel_id });
      console.log(`  ${dry ? "resolved" : "added   "}  ${info.name}  ${info.handle || ""}  ${info.channel_id}`);
    } catch (e) {
      skipped.push({ handle: h, error: e.message });
      console.log(`  skip      ${h}: ${e.message}`);
    }
  }

  if (dry) {
    console.log(`\nDRY RUN complete. Re-run without --dry to add the ${added.length} resolved channel(s).`);
    return;
  }

  // Adding to the ingestion registry changes the directory (driven by youtube_channels.json),
  // not the Watch spotlight (driven by featured.json), so only the directory is rebuilt.
  console.log(`\nRebuilding the directory...`);
  const dir = await buildDirectory({ source: "onboard" }).catch((e) => {
    console.error(`directory: ${e.message}`);
    return null;
  });

  const byId = new Map((dir?.roster || []).map((r) => [r.channel_id, r]));
  if (added.length) {
    console.log(`\n  ${"name".padEnd(28)} ${"handle".padEnd(20)} ${"wt".padEnd(5)} ${"kind".padEnd(10)} status`);
    for (const r of added) {
      const e = byId.get(r.channel_id);
      const base =
        hide === true && recommend !== true
          ? "tracked, hidden from directory"
          : e
            ? e.videoCount > 0
              ? `${e.videoCount} videos, listed`
              : "listed, not yet ingested"
            : "listed";
      const status = `${recommend === true ? "recommended, " : ""}${base}`;
      console.log(`  ${String(r.name).padEnd(28)} ${String(r.handle).padEnd(20)} ${String(weight).padEnd(5)} ${String(kind).padEnd(10)} ${status}`);
    }
  }
  if (skipped.length) {
    console.log(`\n  ${skipped.length} could not be resolved (retry once, or add by UC id; see docs/ONBOARD_YOUTUBE_CHANNEL.md):`);
    for (const r of skipped) console.log(`    ${r.handle}: ${r.error}`);
  }

  console.log(`
Next steps (the worker reads origin/main, so this is not live until pushed):
  1. node worker/sources/youtube_registry.mjs list           # confirm the entries
  2. npm run check:generated && npm test && npm run build    # gates stay green
  3. git add sources/youtube_channels.json public/data/directory.json
  4. git commit -m "sources: onboard ${added.map((r) => r.name).join(", ") || "channels"}"
  5. git push origin main && git rev-parse HEAD              # confirm HEAD == origin/main
`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
