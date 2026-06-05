import { loadCache, saveCache } from "../lib/cache.mjs";
import { hash16 } from "../lib/hash.mjs";

/*
  Committed vector manifest: the cost oracle for Pinecone and Voyage.

  Deterministic ids make upserts idempotent, but they do not by themselves prevent
  repeated embedding calls. The manifest records the text hash and metadata hash
  for each vector id, so a scheduled run can embed only new or changed text, update
  metadata without re-embedding, and delete stale ids it knows it previously wrote.
*/

export const VECTOR_MANIFEST_VERSION = 1;

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, stable(value[k])]));
  }
  return value;
}

export const stableJson = (value) => JSON.stringify(stable(value));
export const textHash = (text) => hash16(String(text || ""));
export const metadataHash = (metadata) => hash16(stableJson(metadata || {}));

export function normalizeManifest(raw = {}) {
  return {
    version: raw.version === VECTOR_MANIFEST_VERSION ? raw.version : VECTOR_MANIFEST_VERSION,
    updated_at: raw.updated_at || null,
    vectors: raw.vectors && typeof raw.vectors === "object" ? raw.vectors : {},
  };
}

export function loadVectorManifest() {
  return normalizeManifest(loadCache("vector_manifest"));
}

export function saveVectorManifest(manifest, now = new Date().toISOString()) {
  saveCache("vector_manifest", normalizeManifest({ ...manifest, updated_at: now }));
}

export function withHashes(record) {
  return {
    ...record,
    text_hash: textHash(record.text),
    metadata_hash: metadataHash(record.metadata),
  };
}

export function planVectorSync(manifest, records, type) {
  const normalized = normalizeManifest(manifest);
  const rows = records.map(withHashes);
  const currentIds = new Set(rows.map((r) => r.id));
  const toEmbed = [];
  const toUpdate = [];
  let unchanged = 0;

  for (const row of rows) {
    const prior = normalized.vectors[row.id];
    if (!prior || prior.text_hash !== row.text_hash) {
      toEmbed.push(row);
    } else if (prior.metadata_hash !== row.metadata_hash) {
      toUpdate.push(row);
    } else {
      unchanged += 1;
    }
  }

  const staleIds = Object.entries(normalized.vectors)
    .filter(([, v]) => v.type === type)
    .map(([id]) => id)
    .filter((id) => !currentIds.has(id))
    .sort();

  return { toEmbed, toUpdate, staleIds, unchanged, total: rows.length };
}

export function markVectorSynced(manifest, records, type, now = new Date().toISOString()) {
  const normalized = normalizeManifest(manifest);
  for (const row of records.map(withHashes)) {
    normalized.vectors[row.id] = {
      type,
      text_hash: row.text_hash,
      metadata_hash: row.metadata_hash,
      updated_at: now,
    };
  }
  normalized.updated_at = now;
  return normalized;
}

export function removeVectorIds(manifest, ids) {
  const normalized = normalizeManifest(manifest);
  for (const id of ids) delete normalized.vectors[id];
  return normalized;
}
