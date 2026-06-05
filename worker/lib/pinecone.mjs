import { ENV } from "./env.mjs";

// Pinecone client (serverless REST). Control plane (api.pinecone.io) creates and
// describes the index; the data plane uses the index host. We resolve the
// ai-firehose host from the control plane rather than trusting a sibling's
// PINECONE_HOST, so we never touch the civil or worldthought indexes.
const CONTROL = "https://api.pinecone.io";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function headers() {
  return { "Api-Key": ENV.pineconeKey, "Content-Type": "application/json", "X-Pinecone-API-Version": "2024-10" };
}

export async function describeIndex(name = ENV.pineconeIndex) {
  const r = await fetch(`${CONTROL}/indexes/${name}`, { headers: headers(), signal: AbortSignal.timeout(30000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Pinecone describe ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

// Create the index if it does not exist, then wait until it has a host and is
// ready. Returns the data-plane host.
export async function ensureIndex({ name = ENV.pineconeIndex, dimension = 1024, metric = "cosine", cloud = "aws", region = "us-east-1" } = {}) {
  let info = await describeIndex(name);
  if (!info) {
    const r = await fetch(`${CONTROL}/indexes`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ name, dimension, metric, spec: { serverless: { cloud, region } } }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Pinecone create ${r.status}: ${(await r.text()).slice(0, 300)}`);
    info = await r.json();
  }
  for (let i = 0; i < 40 && (!info?.host || info?.status?.ready === false); i += 1) {
    await sleep(2000);
    info = await describeIndex(name);
  }
  if (!info?.host) throw new Error("Pinecone index host not ready after wait");
  if (info?.status?.ready === false) throw new Error("Pinecone index host present but not ready after wait");
  return info.host;
}

export async function upsert(host, vectors, namespace = "") {
  for (let i = 0; i < vectors.length; i += 100) {
    const r = await fetch(`https://${host}/vectors/upsert`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ vectors: vectors.slice(i, i + 100), namespace }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Pinecone upsert ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
}

export async function updateMetadata(host, updates, namespace = "") {
  for (const u of updates) {
    const r = await fetch(`https://${host}/vectors/update`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ id: u.id, setMetadata: u.metadata || {}, namespace }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Pinecone update ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
}

export async function query(host, vector, { topK = 20, filter, includeMetadata = true, includeValues = false, namespace = "" } = {}) {
  const r = await fetch(`https://${host}/query`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ vector, topK, filter, includeMetadata, includeValues, namespace }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`Pinecone query ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return (await r.json()).matches || [];
}

export async function deleteByIds(host, ids, namespace = "") {
  if (!ids.length) return;
  for (let i = 0; i < ids.length; i += 1000) {
    const r = await fetch(`https://${host}/vectors/delete`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ ids: ids.slice(i, i + 1000), namespace }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Pinecone delete ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
}

// Enumerate vector ids (serverless list endpoint, paginated). Keep this for
// one-time audits and reconciliation only. Routine retention prune is driven by
// worker/.cache/vector_manifest.json so scheduled runs do not spend read units.
export async function listIds(host, { prefix = "", namespace = "" } = {}) {
  const ids = [];
  let token;
  do {
    const params = new URLSearchParams({ limit: "100" });
    if (prefix) params.set("prefix", prefix);
    if (namespace) params.set("namespace", namespace);
    if (token) params.set("paginationToken", token);
    const r = await fetch(`https://${host}/vectors/list?${params}`, { headers: headers(), signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`Pinecone list ${r.status}`);
    const j = await r.json();
    (j.vectors || []).forEach((v) => ids.push(v.id));
    token = j.pagination?.next;
  } while (token);
  return ids;
}
