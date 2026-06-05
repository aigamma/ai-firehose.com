/*
  Generated artifact freshness gate.

  This script runs the committed data generators that are part of the read surface,
  then fails if the generated artifacts differ from the working tree. It is kept
  outside node --test because the generators write JSON files and must not run in
  parallel with tests that read those files.

  Run: node scripts/check_generated_fresh.mjs
*/
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(label, args) {
  console.log(`generated-fresh: ${label}`);
  const r = spawnSync(process.execPath, args, { cwd: ROOT, stdio: "inherit" });
  if (r.status === 0) return;
  throw new Error(`${label} exited ${r.status ?? "without a status"}`);
}

function diffText(paths) {
  const r = spawnSync("git", ["diff", "--", ...paths], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (r.status === 0) return r.stdout || "";
  if (r.stderr) process.stderr.write(r.stderr);
  throw new Error(`git diff failed for ${paths.join(", ")}`);
}

const paths = ["public/data/glossary", "public/data/harness.json", "public/data/creators.json"];
const before = diffText(paths);

run("glossary", ["scripts/build_glossary.mjs"]);
run("harness", ["scripts/build_harness.mjs"]);
run("creators", ["scripts/build_creators.mjs"]);

const after = diffText(paths);
if (after !== before) {
  if (after) process.stdout.write(after);
  throw new Error(`generated artifacts changed after regeneration: ${paths.join(", ")}`);
}
console.log("generated-fresh: generated artifacts match the working tree.");
