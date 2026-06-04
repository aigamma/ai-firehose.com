import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/*
  Glossary image toolchain: source, download, validate, and finalize the cited
  visuals that illustrate the durable knowledge layer.

  The visuals are SELF-HOSTED under public/images/glossary/ (the worldthought.com
  pattern), not hotlinked, so the project is free to source from a wide variety of
  open providers (Wikimedia Commons searched deeply, scikit-learn, Our World in Data,
  public-domain and government archives, CC-licensed papers) rather than only the
  Wikipedia article lead image, and so an image can never break from a host's hotlink
  protection or link rot. Every file is validated to be real image bytes on download:
  this script is the non-LLM oracle behind the figures (a row in images.json is a
  claim; a 200 with image magic bytes on disk is the evidence).

  Licensing discipline: only redistributable licenses (public domain, CC0, CC BY,
  CC BY-SA) are accepted, and every image records its author, license, license URL,
  and source page so the figcaption can render a correct attribution (the citation).

  Subcommands:
    search <query> [--limit N] [--width W]
        Query Wikimedia Commons (File namespace) and print ranked, license-filtered
        candidates as JSON, each with a direct download_url, license, author, and the
        descriptionurl (the citation page). Used by the curation subagents and humans.

    finalize [--keep-stage]
        Merge content/glossary/images.json with every content/glossary/_img_stage/*.json
        staging file, download each chosen image into public/images/glossary/, validate
        it is real image bytes of a sane size, and rewrite content/glossary/images.json
        with `file` pointers plus full attribution. Idempotent: an already-downloaded,
        still-valid file is not re-fetched. Drops (and logs) any row that fails to
        download or validate, so a broken candidate never ships.

  The build (scripts/build_glossary.mjs) reads only the finalized content/glossary/images.json
  and resolves each row to a served src (/images/glossary/<file>), so the site never
  depends on this script at build time; this runs at curation time.
*/

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CONTENT = resolve(ROOT, "content/glossary");
const IMAGES_JSON = resolve(CONTENT, "images.json");
const STAGE_DIR = resolve(CONTENT, "_img_stage");
const OUT_DIR = resolve(ROOT, "public/images/glossary");
const UA = "ai-firehose.com glossary image curation (https://ai-firehose.com; eric@aigamma.com)";

// ---- pure helpers (unit-tested in glossary_images.test.mjs) ----

// Only redistributable licenses are allowed: public domain, CC0, and the attribution
// CC licenses. Non-commercial (NC), no-derivatives (ND), and non-free are rejected.
export function licenseOk(shortName) {
  const s = String(shortName || "").toLowerCase();
  if (!s) return false;
  if (/\bnc\b|noncommercial|non-commercial|\bnd\b|noderiv|fair use|non-free|nonfree|all rights/.test(s)) return false;
  return /public domain|\bpd\b|cc0|cc-?0|cc[ -]?by|creative commons|attribution/.test(s);
}

// Map a license short name to its canonical deed URL, for the attribution link.
export function licenseUrl(shortName) {
  const s = String(shortName || "").toLowerCase();
  if (/cc0|cc-?0/.test(s)) return "https://creativecommons.org/publicdomain/zero/1.0/";
  if (/public domain|\bpd\b/.test(s)) return "https://en.wikipedia.org/wiki/Public_domain";
  const m = s.match(/cc[ -]?by(?:[ -]?(sa|nc|nd))*[ -]?(\d(?:\.\d)?)/);
  if (m) {
    const flavor = s.includes("sa") ? "by-sa" : "by";
    const ver = m[2] || "4.0";
    return `https://creativecommons.org/licenses/${flavor}/${ver}/`;
  }
  return "https://creativecommons.org/licenses/";
}

// External author names enter images.json from provider metadata, not from an author,
// so an em dash in one must not trip the project's no-em-dash gate. Replace it with a
// space. Authored captions and alt are deliberately NOT sanitized here: the gate should
// catch em dashes in prose so they are fixed to the right punctuation, not masked.
export function cleanCredit(s) {
  return String(s || "")
    .replace(new RegExp(String.fromCharCode(0x2014), "g"), " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Strip the HTML Commons returns in the Artist/Credit extmetadata down to a name.
export function cleanArtist(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

// The original Commons File title from an upload.wikimedia.org URL (thumb or original),
// used to resolve license/author for legacy hotlinked rows. Returns null if not a
// Commons upload URL.
export function commonsFileFromUploadUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== "upload.wikimedia.org") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const ti = parts.indexOf("thumb");
    // .../commons/a/ad/Name.gif  OR  .../commons/thumb/a/ad/Name.png/720px-Name.png
    const name = ti >= 0 ? parts[ti + 3] : parts[parts.length - 1];
    return name ? decodeURIComponent(name) : null;
  } catch {
    return null;
  }
}

// A safe file extension from a content-type or URL. Defaults to png.
export function extFor(contentType, url) {
  const ct = String(contentType || "").toLowerCase();
  if (ct.includes("svg")) return "svg";
  if (ct.includes("png")) return "png";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  const m = String(url || "").toLowerCase().match(/\.(png|gif|webp|jpe?g|svg)(?:\?|$)/);
  if (m) return m[1].replace("jpeg", "jpg");
  return "png";
}

// Validate image magic bytes so a 404 HTML page or truncated download never ships as a
// figure. Returns the detected type or null.
export function sniffImage(buf) {
  if (!buf || buf.length < 16) return null;
  const b = buf;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "gif";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  const head = b.subarray(0, 512).toString("utf8").toLowerCase();
  if (head.includes("<svg") || (head.includes("<?xml") && head.includes("svg"))) return "svg";
  return null;
}

// ---- network ----

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch with retry/backoff on transient failures (429, 5xx, network errors). Many
// curation subagents query Commons in parallel, so respecting its rate limit with a
// backoff (rather than hammering) is the difference between a clean run and a flood of
// dropped images.
async function fetchRetry(url, { timeout = 25000, tries = 4 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i += 1) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(timeout) });
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      return r;
    } catch (err) {
      lastErr = err;
      if (i < tries - 1) await sleep(600 * 2 ** i + Math.floor(i * 250));
    }
  }
  throw lastErr;
}

async function commonsApi(params) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetchRetry(u, { timeout: 25000 });
  if (!r.ok) throw new Error(`Commons API ${r.status}`);
  return r.json();
}

function recordFromImageinfo(page, width) {
  const ii = page.imageinfo?.[0];
  if (!ii) return null;
  const em = ii.extmetadata || {};
  const license = (em.LicenseShortName?.value || "").trim();
  return {
    title: page.title,
    download_url: ii.thumburl || ii.url,
    width: ii.thumbwidth || ii.width,
    height: ii.thumbheight || ii.height,
    mime: ii.mime,
    license,
    license_ok: licenseOk(license),
    license_url: em.LicenseUrl?.value || licenseUrl(license),
    credit: cleanArtist(em.Artist?.value) || "Unknown",
    source: ii.descriptionurl,
    provider: "Wikimedia Commons",
    _requested_width: width,
  };
}

async function search(query, { limit = 10, width = 800 } = {}) {
  const j = await commonsApi({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${query} -sound -audio`,
    gsrnamespace: "6",
    gsrlimit: String(Math.max(limit, 12)),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: String(width),
  });
  const pages = Object.values(j?.query?.pages || {});
  return pages
    .map((p) => recordFromImageinfo(p, width))
    .filter((r) => r && r.download_url && r.license_ok)
    .filter((r) => /image\/(png|jpeg|gif|webp|svg)/.test(r.mime || ""))
    .slice(0, limit);
}

// Resolve license/author/thumb for a specific Commons File title (used to enrich legacy
// hotlinked rows during finalize).
async function resolveCommonsFile(title, width = 800) {
  const t = title.startsWith("File:") ? title : `File:${title}`;
  const j = await commonsApi({
    action: "query",
    format: "json",
    titles: t,
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: String(width),
  });
  const page = Object.values(j?.query?.pages || {})[0];
  return page ? recordFromImageinfo(page, width) : null;
}

async function download(url) {
  const r = await fetchRetry(url, { timeout: 40000 });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return { buf, contentType: r.headers.get("content-type") };
}

// ---- staging + finalize ----

const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};

function loadStaging() {
  const merged = {};
  if (existsSync(STAGE_DIR)) {
    for (const f of readdirSync(STAGE_DIR)) {
      if (!f.endsWith(".json")) continue;
      const rows = readJson(join(STAGE_DIR, f), {});
      for (const [slug, row] of Object.entries(rows)) merged[slug] = { ...(merged[slug] || {}), ...row };
    }
  }
  return merged;
}

const MIN_BYTES = 1200;
const MAX_BYTES = 4_500_000;

async function finalize({ keepStage = false } = {}) {
  mkdirSync(OUT_DIR, { recursive: true });
  const existing = readJson(IMAGES_JSON, {});
  const staging = loadStaging();
  // Deep-merge per slug: a staging row's fields override the existing row's, but a
  // partial staging row (e.g. a caption-only enrichment) keeps the rest of the row.
  const rows = {};
  for (const slug of new Set([...Object.keys(existing), ...Object.keys(staging)])) {
    rows[slug] = { ...(existing[slug] || {}), ...(staging[slug] || {}) };
  }
  const slugs = Object.keys(rows).sort();

  const final = {};
  const kept = [];
  const dropped = [];
  for (const slug of slugs) {
    const row = { ...rows[slug] };
    try {
      // Keep the on-disk file when there is no fresh image source to download (no
      // download_url and no legacy url). This covers two cases: a plain re-run
      // (idempotency, so only new or changed images are fetched) and a metadata-only
      // staging update (e.g. just a new caption) on an already-finalized row. Only a
      // staging row that supplies a new download_url/url triggers a re-download.
      const hasFreshSource = !!(row.download_url || row.url);
      if (!hasFreshSource && row.file) {
        const p = join(OUT_DIR, row.file);
        if (existsSync(p) && sniffImage(readFileSync(p))) {
          if (!licenseOk(row.license)) throw new Error(`missing/forbidden license: ${row.license || "(none)"}`);
          if (!row.alt) throw new Error("missing alt text");
          final[slug] = {
            file: row.file,
            alt: row.alt,
            caption: row.caption || "",
            credit: cleanCredit(row.credit) || "Unknown",
            license: row.license,
            license_url: row.license_url || licenseUrl(row.license),
            source: row.source || "",
            provider: row.provider || "Wikimedia Commons",
          };
          kept.push(`${slug}${staging[slug] ? " (updated)" : " (cached)"}`);
          continue;
        }
        throw new Error("file missing or invalid on disk, and no download_url to refetch");
      }

      let downloadUrl = row.download_url || row.url || null;

      // Enrich a legacy upload.wikimedia.org row that lacks license/author.
      if ((!row.license || !row.credit || row.credit === "Wikimedia Commons") && downloadUrl) {
        const file = commonsFileFromUploadUrl(downloadUrl);
        if (file) {
          const meta = await resolveCommonsFile(file);
          if (meta) {
            row.license = row.license || meta.license;
            row.license_url = row.license_url || meta.license_url;
            row.credit = meta.credit;
            row.provider = row.provider || "Wikimedia Commons";
            row.source = row.source && !/upload\.wikimedia/.test(row.source) ? row.source : meta.source;
            downloadUrl = meta.download_url || downloadUrl; // prefer the API thumb at target width
            if (!licenseOk(row.license)) throw new Error(`license not redistributable: ${row.license}`);
          }
        }
      }

      if (!downloadUrl) throw new Error("no download_url");
      if (!row.license || !licenseOk(row.license)) throw new Error(`missing/forbidden license: ${row.license || "(none)"}`);
      if (!row.alt) throw new Error("missing alt text");

      const { buf, contentType } = await download(downloadUrl);
      const kind = sniffImage(buf);
      if (!kind) throw new Error("not a valid image (magic-byte sniff failed)");
      if (buf.length < MIN_BYTES) throw new Error(`too small (${buf.length}b)`);
      if (buf.length > MAX_BYTES) throw new Error(`too large (${buf.length}b)`);

      const ext = kind === "svg" ? "svg" : extFor(contentType, downloadUrl);
      const file = `${slug}.${ext}`;
      writeFileSync(join(OUT_DIR, file), buf);

      final[slug] = {
        file,
        alt: row.alt,
        caption: row.caption || "",
        credit: cleanCredit(row.credit) || "Unknown",
        license: row.license,
        license_url: row.license_url || licenseUrl(row.license),
        source: row.source || "",
        provider: row.provider || "Wikimedia Commons",
      };
      kept.push(`${slug} (${ext}, ${(buf.length / 1024).toFixed(0)}kb, ${final[slug].provider})`);
    } catch (err) {
      dropped.push(`${slug}: ${err.message}`);
    }
  }

  // Deterministic, sorted output.
  const ordered = {};
  for (const slug of Object.keys(final).sort()) ordered[slug] = final[slug];
  writeFileSync(IMAGES_JSON, `${JSON.stringify(ordered, null, 2)}\n`);

  if (!keepStage && existsSync(STAGE_DIR)) rmSync(STAGE_DIR, { recursive: true, force: true });

  console.log(`finalize: kept ${kept.length}, dropped ${dropped.length}`);
  for (const k of kept) console.log(`  + ${k}`);
  for (const d of dropped) console.log(`  - ${d}`);
  const byProvider = {};
  for (const r of Object.values(ordered)) byProvider[r.provider] = (byProvider[r.provider] || 0) + 1;
  console.log("provider mix:", JSON.stringify(byProvider));
  return { kept: kept.length, dropped: dropped.length, byProvider };
}

// ---- CLI ----

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  // Parse `--name value` flags out, leaving only positional args, so a flag value can
  // never leak into the search query or the file title.
  const flags = {};
  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i].startsWith("--")) {
      const name = rest[i].slice(2);
      const next = rest[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[name] = next;
        i += 1;
      } else {
        flags[name] = true;
      }
    } else {
      positional.push(rest[i]);
    }
  }
  const flag = (name, def) => (flags[name] !== undefined ? flags[name] : def);
  if (cmd === "search") {
    const query = positional.join(" ").trim();
    const out = await search(query, { limit: Number(flag("limit", 10)), width: Number(flag("width", 800)) });
    console.log(JSON.stringify(out, null, 2));
  } else if (cmd === "fetch") {
    const [url, out] = positional;
    if (!url || !out) {
      console.error("usage: fetch <url> <outpath>");
      process.exitCode = 1;
      return;
    }
    const { buf } = await download(url);
    const kind = sniffImage(buf);
    if (!kind) {
      console.error(`fetch: not a valid image (${buf.length}b)`);
      process.exitCode = 1;
      return;
    }
    // Force the correct extension from the sniffed bytes so a viewer renders it
    // (the provided extension may be wrong, e.g. an SVG that renders as PNG).
    const base = resolve(out).replace(/\.[a-z0-9]+$/i, "");
    const finalPath = `${base}.${kind}`;
    mkdirSync(dirname(finalPath), { recursive: true });
    writeFileSync(finalPath, buf);
    console.log(`fetch: ${kind}, ${(buf.length / 1024).toFixed(0)}kb -> ${finalPath}`);
  } else if (cmd === "resolve") {
    const out = await resolveCommonsFile(positional.join(" "), Number(flag("width", 800)));
    console.log(JSON.stringify(out, null, 2));
  } else if (cmd === "finalize") {
    await finalize({ keepStage: flag("keep-stage", false) === true });
  } else {
    console.log("usage: glossary_images.mjs <search|resolve|finalize> [...]");
    process.exitCode = 1;
  }
}

export { search, resolveCommonsFile, finalize };

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((e) => {
    console.error("glossary_images failed:", e.message);
    process.exitCode = 1;
  });
}
