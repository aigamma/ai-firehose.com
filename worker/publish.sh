#!/usr/bin/env sh
# Scheduled ingestion + publish, run by the Fly worker.
# Required env (set as Fly secrets): PINECONE_API_KEY, VOYAGE_API_KEY,
#   ANTHROPIC_API_KEY, OPENAI_API_KEY (optional), REPO_URL (https URL without
#   token), GH_TOKEN (a fine-grained PAT with contents:write).
set -e

WORKDIR=/repo
if [ -n "$REPO_URL" ] && [ -n "$GH_TOKEN" ]; then
  AUTH_URL=$(printf '%s' "$REPO_URL" | sed "s#https://#https://x-access-token:$GH_TOKEN@#")
  rm -rf "$WORKDIR"
  git clone --depth 1 "$AUTH_URL" "$WORKDIR"
  cd "$WORKDIR"
else
  echo "REPO_URL/GH_TOKEN not set; running in place without publish"
  cd /app
fi

node worker/pipeline/run.mjs

if [ -n "$REPO_URL" ] && [ -n "$GH_TOKEN" ]; then
  git config user.email "worker@ai-firehose.com"
  git config user.name "ai-firehose worker"
  git add public/data public/sitemap.xml
  if git diff --cached --quiet; then
    echo "no artifact changes"
  else
    git commit -m "data: scheduled ingestion"
    git push origin HEAD:main
  fi
fi
