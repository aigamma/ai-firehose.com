import { memo } from "react";
import { Link } from "react-router-dom";
import { getKind } from "../data/registry.js";

// The browse-and-subscribe roster on the Watch page. Every active educator the worker
// ingests into the three-month RAG, rendered as a grid of cards with a one-click
// Subscribe, the concepts they cover (links into the glossary hubs), their kind lean,
// and how active they are. Reads public/data/directory.json, built deterministically by
// scripts/build_directory.mjs from the ingestion registry (sources/youtube_channels.json)
// joined to the corpus. A freshly added channel with no corpus items yet still shows,
// marked as newly added, so the directory is useful the moment a handle is dropped.
function CreatorDirectory({ roster = [] }) {
  if (!roster.length) return null;
  return (
    <div className="grid cols-3 creator-directory">
      {roster.map((c) => {
        const kind = getKind(c.kindLean);
        return (
          <article
            key={c.channel_id}
            className="card creator-card"
            style={kind ? { "--tile-accent": `var(${kind.accentVar})` } : undefined}
          >
            <div className="creator-card-head">
              <h3 className="creator-card-name">
                <a href={c.channelUrl} target="_blank" rel="noreferrer">{c.name}</a>
              </h3>
              {kind && <span className={`badge ${kind.badgeClass}`}>{kind.singular}</span>}
            </div>
            {c.handle && <div className="faint mono creator-card-handle">{c.handle}</div>}

            <a className="btn subscribe-btn" href={c.subscribeUrl} target="_blank" rel="noreferrer">
              Subscribe on YouTube
            </a>

            {c.concepts?.length > 0 && (
              <div className="creator-card-covers">
                <span className="faint creator-card-label">Covers</span>
                <div className="chips">
                  {c.concepts.map((x) => (
                    <Link key={x.slug} to={`/technique/${x.slug}`} className="chip">{x.label}</Link>
                  ))}
                </div>
              </div>
            )}

            <div className="creator-card-activity faint">
              {c.videoCount > 0
                ? `${c.videoCount} video${c.videoCount === 1 ? "" : "s"} in the window`
                : "Newly added, awaiting first ingest"}
              {c.latest?.published && <> &middot; latest {c.latest.published.slice(0, 10)}</>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default memo(CreatorDirectory);
