/*
  Deterministically renders the static brand raster assets the HTML and the web
  manifest reference: the social share card (Open Graph / Twitter) and the PNG app
  icons (Apple touch icon and the maskable PWA icons). The site is otherwise SVG-only
  (favicon.svg), but social scrapers (X, Slack, LinkedIn, Discord, Facebook) do not
  render SVG og:image, and iOS ignores an SVG apple-touch-icon, so those two surfaces
  need real PNGs. Authored as SVG here and rasterized with @resvg/resvg-js so the
  assets are reproducible from source, never hand-edited binaries.

  Run: node scripts/build_social_images.mjs
  Outputs (committed): public/og.png, public/apple-touch-icon.png,
  public/icon-192.png, public/icon-512.png

  Brand: ground #0d0f13, accent bolt #4a9eff, matching public/favicon.svg and the
  --bg / --accent theme tokens. No em dashes in any rendered copy (project writing rule).
*/
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const BG = "#0d0f13";
const ACCENT = "#4a9eff";
const TEXT = "#eef2f7";
const MUTED = "#8b97a8";
const FAINT = "#5b6675";
const LINE = "#222a35";

// The lightning bolt from public/favicon.svg, in its native 64x64 coordinate space.
const BOLT = "M37 6 16 36h12l-5 22 23-32H33l4-20z";

// The social card: 1200x630, the Open Graph standard. Editorial and dark, leading with
// the mark and wordmark, a tagline, a one-line descriptor, and the domain. Text is set
// in system fonts resvg resolves on the host (Georgia for the serif wordmark, Arial for
// the sans supporting copy), the same serif/sans split the site uses.
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="80%" cy="18%" r="62%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="${ACCENT}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="6" fill="${ACCENT}"/>

  <g transform="translate(80,82)">
    <rect width="92" height="92" rx="22" fill="#11151b" stroke="${LINE}" stroke-width="1.5"/>
    <g transform="translate(14,14) scale(1.0)">
      <path d="${BOLT}" fill="${ACCENT}"/>
    </g>
  </g>

  <text x="80" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="104" font-weight="700" fill="${TEXT}" letter-spacing="-2">AI Firehose</text>
  <text x="82" y="372" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="600" fill="${ACCENT}">The Bleeding Edge, Organized</text>

  <line x1="82" y1="430" x2="1120" y2="430" stroke="${LINE}" stroke-width="2"/>

  <text x="82" y="492" font-family="Arial, Helvetica, sans-serif" font-size="31" fill="${MUTED}">A daily outlier hunt across the AI industry. Day, Week, Month, Quarter.</text>

  <text x="82" y="568" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" fill="${FAINT}">ai-firehose.com</text>
</svg>`;

// The app icon: full-bleed dark ground with the centered bolt, no rounded corners, so
// iOS (apple-touch) and Android adaptive masks round it themselves without a dark seam.
// Authored at 512 and rasterized down. The bolt path is the 64-space favicon bolt scaled
// 8x and centered.
const ICON_BOLT = "M296 48 128 288h96l-40 176 184-256H264l32-160z";
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}"/>
  <path d="${ICON_BOLT}" fill="${ACCENT}"/>
</svg>`;

function renderPng(svg, width, out) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(PUBLIC, out), png);
  console.log(`wrote public/${out} (${width}px wide, ${png.length} bytes)`);
}

renderPng(ogSvg, 1200, "og.png");
renderPng(iconSvg, 180, "apple-touch-icon.png");
renderPng(iconSvg, 192, "icon-192.png");
renderPng(iconSvg, 512, "icon-512.png");
console.log("done");
