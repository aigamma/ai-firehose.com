// Verify the retrieval logic against the live index.
// Run: node --env-file=worker/.env.local worker/tools/search.mjs "your query"
import { requireKeys } from "../lib/env.mjs";
import { semanticSearch } from "../lib/retrieve.mjs";

requireKeys();
const q = process.argv.slice(2).join(" ") || "AI agents that write code";
const results = await semanticSearch(q);
console.log(`query: ${q}`);
for (const x of results) console.log(`  ${x.score}  [${x.kind}] ${x.title}  (${x.author_or_channel})`);
