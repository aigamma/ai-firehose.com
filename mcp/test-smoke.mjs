/*
  Local smoke test for ai-firehose-mcp. Not published (see package.json "files").
  Spawns the server over stdio, performs the MCP handshake, lists tools, and calls
  each one against the live API. Run from anywhere: node mcp/test-smoke.mjs
  Override the target with AI_FIREHOSE_BASE_URL (defaults to the netlify.app URL,
  which is always reachable even while the apex domain's DNS is propagating).
*/
import { spawn } from "node:child_process";

const here = import.meta.dirname;
const child = spawn(process.execPath, ["index.mjs"], {
  cwd: here,
  env: { ...process.env, AI_FIREHOSE_BASE_URL: process.env.AI_FIREHOSE_BASE_URL || "https://ai-firehose.netlify.app" },
  stdio: ["pipe", "pipe", "inherit"],
});

let buffer = "";
const pending = new Map();
child.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id != null && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

let nextId = 0;
function request(method, params) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), 30000);
    pending.set(id, (m) => { clearTimeout(timer); resolve(m); });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
function notify(method, params) {
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
}
function preview(res) {
  const t = res?.result?.content?.[0]?.text || JSON.stringify(res?.error || res?.result || res);
  return String(t).slice(0, 220).replace(/\s+/g, " ");
}

let failures = 0;
try {
  const init = await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "smoke", version: "0" },
  });
  console.log("initialize ->", init.result?.serverInfo?.name, "proto", init.result?.protocolVersion);
  notify("notifications/initialized", {});

  const list = await request("tools/list", {});
  const names = (list.result?.tools || []).map((t) => t.name);
  console.log("tools/list ->", names.join(", "));
  if (names.length !== 4) { failures++; console.log("  FAIL: expected 4 tools, got", names.length); }

  const cases = [
    ["stats", {}],
    ["search_ai", { query: "retrieval augmented generation" }],
    ["search_ai", { query: "agents", kind: "tool" }],
    ["whats_new", { horizon: "week" }],
    ["define", { concept: "ai agents" }],
    ["define", { concept: "RAG" }],
  ];
  for (const [name, args] of cases) {
    const res = await request("tools/call", { name, arguments: args });
    const ok = res.result && !res.result.isError;
    if (!ok) failures++;
    console.log(`tools/call ${name} ${JSON.stringify(args)} -> ${ok ? "OK" : "FAIL"} :: ${preview(res)}`);
  }
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  child.kill();
  console.log(failures ? `\nSMOKE FAILED (${failures} failure(s))` : "\nSMOKE PASSED");
  process.exit(failures ? 1 : 0);
}
