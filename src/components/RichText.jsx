import { memo } from "react";
import { Link } from "react-router-dom";
import useGlossary from "../lib/useGlossary.js";
import { parseInline } from "../lib/richtext.js";

/*
  Render prose with wiki-style auto-linking, the deep mesh that turns any glossary
  term mentioned in a body or briefing into a link to its hub (first occurrence only,
  never linking a term to its own page). Also renders inline bold, italic, code, and
  Markdown links, plus numbered [n] citation markers when a citeMap is supplied (the
  briefing uses this). Accepts either typed `blocks` (from build_glossary) or a single
  `text` string. The parsing engine is the pure module src/lib/richtext.js.
*/

function renderTokens(tokens, keyPrefix, citeMap) {
  return tokens.map((tk, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (tk.t) {
      case "text":
        return tk.v;
      case "wiki":
        return (
          <Link key={key} to={`/technique/${tk.slug}`} className={`wikilink wikilink-${tk.kind || "default"}`}>
            {tk.v}
          </Link>
        );
      case "strong":
        return <strong key={key}>{tk.v}</strong>;
      case "em":
        return <em key={key}>{tk.v}</em>;
      case "code":
        return <code key={key}>{tk.v}</code>;
      case "link":
        return (
          <a key={key} href={tk.href} target="_blank" rel="noreferrer">
            {tk.v}
          </a>
        );
      case "cite": {
        const ref = citeMap && citeMap.get(tk.n);
        if (!ref) return null;
        return (
          <sup key={key} className="cite">
            <a href={ref.url} target="_blank" rel="noreferrer" title={ref.title}>
              {ref.num}
            </a>
          </sup>
        );
      }
      default:
        return null;
    }
  });
}

function RichText({ blocks, text, currentSlug = null, citeMap = null, withCitations = false, as: As = "div", className, noWiki = false }) {
  // The wiki-link matcher loads asynchronously (the glossary index is ~800KB), so a
  // RichText that mounts before it resolves first paints plain and then re-renders
  // linked. For above-the-fold prose that is the Largest Contentful Paint block (the
  // home briefing), that second render shifts layout (CLS). `noWiki` opts such prose
  // out of auto-linking entirely so it renders once and never shifts; citations and
  // explicit Markdown links still render. The hook is still called unconditionally
  // (rules of hooks); its matcher is simply ignored when noWiki is set.
  const { matcher } = useGlossary();
  // A fresh set per render so each term links on its first occurrence across the
  // whole passage; parseInline mutates it as it walks the blocks in order.
  const linked = new Set();
  const opts = { matcher: noWiki ? null : matcher, currentSlug, linked, withCitations };

  if (text != null && blocks == null) {
    return <As className={className}>{renderTokens(parseInline(text, opts), "t", citeMap)}</As>;
  }

  const bl = Array.isArray(blocks) ? blocks : [];
  return (
    <As className={className}>
      {bl.map((b, i) => {
        if (b.type === "h") {
          return (
            <h3 key={i} className="rt-h">
              {renderTokens(parseInline(b.text, opts), `h${i}`, citeMap)}
            </h3>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="rt-ul">
              {(b.items || []).map((it, j) => (
                <li key={j}>{renderTokens(parseInline(it, opts), `l${i}-${j}`, citeMap)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote key={i} className="rt-quote">
              {renderTokens(parseInline(b.text, opts), `q${i}`, citeMap)}
            </blockquote>
          );
        }
        if (b.type === "code") {
          return (
            <pre key={i} className="rt-code">
              <code>{b.text}</code>
            </pre>
          );
        }
        return (
          <p key={i} className="rt-p">
            {renderTokens(parseInline(b.text, opts), `p${i}`, citeMap)}
          </p>
        );
      })}
    </As>
  );
}

export default memo(RichText);
