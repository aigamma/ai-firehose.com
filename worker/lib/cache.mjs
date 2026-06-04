import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Tiny JSON cache under worker/.cache (gitignored). Used to avoid re-paying for
// expensive LLM classification of unchanged items on every loop iteration.
const DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../.cache");

export function loadCache(name) {
  const p = resolve(DIR, `${name}.json`);
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return {};
  }
}

export function saveCache(name, obj) {
  mkdirSync(DIR, { recursive: true });
  // Atomic write: a hardware fault mid-write would corrupt the target, and loadCache
  // silently discards a corrupt cache and forces a full re-classify. Write a temp file
  // in the same directory (same filesystem, so rename is atomic), then rename it over.
  const p = resolve(DIR, `${name}.json`);
  const tmp = `${p}.tmp`;
  writeFileSync(tmp, JSON.stringify(obj));
  renameSync(tmp, p);
}
