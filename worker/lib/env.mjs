/*
  Environment access for the worker. Keys are pulled from sibling repo .env files
  at setup and written to worker/.env.local (gitignored). Run the worker with:
    node --env-file=worker/.env.local worker/pipeline/run.mjs

  PINECONE_HOST from a sibling points at that sibling's index; we ignore it and
  resolve the ai-firehose index host from the control plane (see pinecone.mjs).
*/
export const ENV = {
  get pineconeKey() { return process.env.PINECONE_API_KEY; },
  get pineconeIndex() { return process.env.PINECONE_INDEX || "ai-firehose"; },
  get voyageKey() { return process.env.VOYAGE_API_KEY; },
  get anthropicKey() { return process.env.ANTHROPIC_API_KEY; },
  get openaiKey() { return process.env.OPENAI_API_KEY || ""; },
};

export function requireKeys(keys = ["PINECONE_API_KEY", "VOYAGE_API_KEY", "ANTHROPIC_API_KEY"]) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing env keys: ${missing.join(", ")}. Create worker/.env.local (see worker/setup-env.mjs) and run with --env-file=worker/.env.local`
    );
  }
}
