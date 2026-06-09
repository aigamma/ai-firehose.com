/*
  Cross-platform prebuild orchestrator.

  npm runs scripts through different shells on different platforms. Keeping the
  sequence in Node avoids POSIX-only separators in package.json. All four generators
  are corpus-only and deterministic (no network, no wall clock), so each is a hard
  gate: a nonzero exit fails the build rather than silently shipping a stale artifact.
*/
import { spawnSync } from "node:child_process";

function run(label, args, { soft = false } = {}) {
  console.log(`prebuild: ${label}`);
  const r = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (r.status === 0) return;
  const msg = `prebuild: ${label} exited ${r.status ?? "without a status"}`;
  if (soft) {
    console.warn(`${msg}; using committed fallback.`);
    return;
  }
  throw new Error(msg);
}

run("glossary", ["scripts/build_glossary.mjs"]);
run("harness", ["scripts/build_harness.mjs"]);
run("creators", ["scripts/build_creators.mjs"]);
run("directory", ["scripts/build_directory.mjs"]);
