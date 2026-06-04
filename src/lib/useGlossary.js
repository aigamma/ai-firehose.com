import { useEffect, useState } from "react";
import { buildMatcher } from "./richtext.js";

/*
  Fetch the glossary index ONCE for the whole app and compile the wiki-link matcher
  from it. The result is memoized at module scope, so the Briefing on Home, every
  concept hub, and the Glossary page share a single fetch and a single compiled
  matcher (one regex over every concept label and alias), no matter how many
  RichText instances render. Fail-open: on a fetch error the matcher is empty, so
  prose still renders, just without auto-links.
*/

const EMPTY = { concepts: [], matcher: { re: null, map: new Map() } };
let cache = null;
let inflight = null;

export default function useGlossary() {
  const [state, setState] = useState(cache);
  useEffect(() => {
    let alive = true;
    if (cache) {
      setState(cache);
      return () => {};
    }
    if (!inflight) {
      inflight = fetch("/data/glossary/index.json")
        .then((r) => {
          // A missing artifact can return 200 via the Netlify SPA fallback, serving
          // index.html instead of JSON, which would throw on .json(). Guard like
          // useData.js: require r.ok and a JSON content type, then fall back to the
          // empty matcher (prose still renders, just without auto-links).
          if (!r.ok) return null;
          const ct = r.headers.get("content-type") || "";
          if (!ct.includes("application/json")) return null;
          return r.text().then((body) => {
            try {
              return JSON.parse(body);
            } catch {
              return null;
            }
          });
        })
        .then((d) => {
          cache = d ? { concepts: d.concepts || [], matcher: buildMatcher(d.concepts || []) } : EMPTY;
          return cache;
        })
        .catch(() => {
          cache = EMPTY;
          return cache;
        });
    }
    inflight.then((c) => {
      if (alive) setState(c);
    });
    return () => {
      alive = false;
    };
  }, []);
  return state || EMPTY;
}
