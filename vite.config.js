import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Build-time inlining of the default-horizon home view.
//
// The home page is a client-rendered SPA: without this, the briefing, the trend
// boards, the breakout hero, and the wire grid each arrive as separate /data
// fetches and insert above the fold as they resolve. That (a) shifts layout as
// each block lands (the desktop CLS) and (b) leaves the largest text block (the
// briefing) unpainted long enough on throttled mobile that Lighthouse records
// NO_LCP, and drags the Speed Index out as content trickles in.
//
// Inlining the small day-horizon artifacts into <head> as window.__HOME_DATA__
// lets useData seed its cache synchronously, so the first React commit paints the
// whole above-the-fold view at once: a real LCP element, no insertion shift, and a
// tight Speed Index. The artifacts are the committed worker output, so the inline
// snapshot always matches what /data serves on the same deploy. A missing artifact
// (a fresh clone before any worker run) silently falls back to the runtime fetch.
function inlineHomeData() {
  // The home page opens on this horizon. Read it from the registry (the single
  // source of truth) at build time so the inlined snapshot tracks the default view
  // instead of silently drifting to the wrong horizon if the default ever changes.
  let H = 'week';
  try {
    const reg = readFileSync(resolve('src/data/registry.js'), 'utf8');
    const m = reg.match(/DEFAULT_HORIZON\s*=\s*["']([^"']+)["']/);
    if (m) H = m[1];
  } catch {
    // Fall back to the known default if the registry cannot be read.
  }
  const paths = [
    `/data/digests/briefing_${H}.json`,
    `/data/digests/${H}.json`,
    `/data/attention/technique_${H}.json`,
    `/data/attention/tool_${H}.json`,
    `/data/attention/opinion_${H}.json`,
  ];
  function buildBlob() {
    const blob = {};
    for (const p of paths) {
      try {
        blob[p] = JSON.parse(readFileSync(resolve('public', p.slice(1)), 'utf8'));
      } catch {
        // Missing artifact: leave it to the runtime fetch path, never fail the build.
      }
    }
    // The full videos index is ~380KB, too heavy to inline. Slim it to the fields
    // the home rail renders for the first 30 tiles, so the Watch section paints at
    // its final size on the first commit (no late insertion) without the weight.
    // Read directly (not under a /data key) so the shared useData cache, which the
    // Watch page reuses for the full index, is never seeded with the trimmed list.
    try {
      const vids = JSON.parse(readFileSync(resolve('public/data/videos/index.json'), 'utf8'));
      blob.videos = (vids.videos || []).slice(0, 30).map((v) => ({
        id: v.id,
        title: v.title,
        channel: v.channel,
        summary: v.summary,
        recommended: v.recommended,
      }));
    } catch {
      // No videos index yet: the Watch section falls back to the runtime fetch.
    }
    return blob;
  }
  // Escape the characters that are legal in JSON strings but would break an inline
  // <script>: "<" (could close the tag) and the U+2028 / U+2029 line separators
  // (historically illegal in JS string literals). The pattern is built from a
  // double-backslash string so the source stays pure ASCII (a raw separator inside
  // a regex literal is itself a syntax error).
  const UNSAFE = new RegExp('[<\\u2028\\u2029]', 'g');
  const escapeForScript = (s) =>
    s.replace(UNSAFE, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  return {
    name: 'inline-home-data',
    transformIndexHtml() {
      const json = escapeForScript(JSON.stringify(buildBlob()));
      return [
        {
          tag: 'script',
          injectTo: 'head',
          // A classic inline script runs at parse time, before the deferred module
          // entry, so window.__HOME_DATA__ exists when useData.js initializes.
          children: `window.__HOME_DATA__=${json};`,
        },
      ];
    },
  };
}

// Static React + Vite site. The Fly.io worker writes precomputed JSON into
// public/data, which Vite copies to the deploy root and serves at /data/*.
export default defineConfig({
  plugins: [react(), inlineHomeData()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split the React runtime into a long-lived vendor chunk so app-code
        // changes do not bust the cached framework bundle on redeploys.
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
