#!/usr/bin/env sh
# Scheduled ingestion + publish, run by the Fly worker.
# Required env (set as Fly secrets): PINECONE_API_KEY, VOYAGE_API_KEY,
#   ANTHROPIC_API_KEY, OPENAI_API_KEY (optional), REPO_URL (https URL without
#   token), GH_TOKEN (a fine-grained PAT with contents:write).
set -e

WORKDIR=/repo
# The Docker image bakes only this script (no worker/ tree at /app), so the
# pipeline can only run from a fresh clone. Both env vars are required.
if [ -z "$REPO_URL" ] || [ -z "$GH_TOKEN" ]; then
  echo "REPO_URL and GH_TOKEN are required (the image has no worker/ tree to run in place)" >&2
  exit 1
fi
AUTH_URL=$(printf '%s' "$REPO_URL" | sed "s#https://#https://x-access-token:$GH_TOKEN@#")
rm -rf "$WORKDIR"
git clone --depth 1 "$AUTH_URL" "$WORKDIR"
cd "$WORKDIR"

node worker/pipeline/run.mjs

git config user.email "worker@ai-firehose.com"
git config user.name "ai-firehose worker"
# Commit the rebuilt artifacts, the accumulating corpus, and the vector manifest
# so rolling-quarter retention and hash-gated embeddings survive clone-fresh runs.
git add public/data public/sitemap.xml public/feed.xml worker/.cache/items.json worker/.cache/vector_manifest.json sources/featured.json
if git diff --cached --quiet; then
  echo "no artifact changes"
else
  git commit -m "data: scheduled ingestion"
  git push origin HEAD:main
fi
