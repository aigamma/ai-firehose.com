import { createHash } from "node:crypto";

// Idempotency primitives, ported in spirit from C:\civil\rag\ingest.mjs.
export const hash16 = (text) => createHash("sha256").update(String(text)).digest("hex").slice(0, 16);

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

// Deterministic vector id: <kind>::<source>::<slug>::<hash16>. Same content
// yields the same id, so re-ingest is a no-op upsert.
export const itemId = (kind, source, sourceSlug, contentHash) =>
  `${kind}::${source}::${slugify(sourceSlug)}::${contentHash}`;
