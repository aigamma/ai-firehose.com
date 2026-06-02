import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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
  writeFileSync(resolve(DIR, `${name}.json`), JSON.stringify(obj));
}
