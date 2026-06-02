# Fly.io ingestion worker image. Bakes the tools; the worker code itself has zero
# npm runtime dependencies (Node built-ins plus global fetch). yt-dlp and ffmpeg
# are for YouTube transcript enrichment; git is for publishing rebuilt artifacts.
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 ffmpeg git ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp static binary (kept current at build time).
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

ENV ENABLE_TRANSCRIPTS=1
WORKDIR /app
COPY worker/publish.sh /usr/local/bin/publish.sh
RUN chmod a+rx /usr/local/bin/publish.sh

# The worker clones the repo fresh at runtime (see publish.sh), ingests, and
# pushes the rebuilt artifacts so Netlify redeploys. Run on a daily schedule.
CMD ["sh", "/usr/local/bin/publish.sh"]
