import { Link } from "react-router-dom";
import LiteYouTube from "./LiteYouTube.jsx";
import { getKind } from "../data/registry.js";

// One creator's spotlight: a header (name links to the channel, the handle, and a
// blurb) and a grid of their latest videos. Each tile is the lite-YouTube facade
// plus the video's corpus-derived title, cited summary ("why it matters"), and
// concept-hub chips (the RAG join, see scripts/build_creators.mjs and the Citation
// Contract). In `compact` mode (Home) the blurb and the per-video summary and chips
// are dropped and only the first couple of videos show.
export default function CreatorSpotlight({ creator, compact = false, limit }) {
  if (!creator) return null;
  const all = creator.videos || [];
  const videos = all.slice(0, limit || (compact ? 2 : all.length));
  if (!videos.length) return null;

  return (
    <div className="creator">
      <div className="creator-head">
        <a href={creator.channelUrl} target="_blank" rel="noreferrer" className="creator-name">{creator.name}</a>
        {creator.handle && <span className="faint mono">{creator.handle}</span>}
        {!compact && creator.blurb && <span className="muted creator-blurb">{creator.blurb}</span>}
      </div>
      <div className="video-grid">
        {videos.map((v) => {
          const kind = getKind(v.kind);
          return (
            <article key={v.videoId} className="video-tile">
              <LiteYouTube videoId={v.videoId} title={v.title} thumbnail={v.thumbnail} />
              <div className="video-meta">
                {kind && <span className={`badge ${kind.badgeClass}`}>{kind.singular}</span>}
                <a href={v.url} target="_blank" rel="noreferrer" className="video-title">{v.title || v.videoId}</a>
              </div>
              {!compact && v.summary && <p className="gloss-def faint summary-clamp">{v.summary}</p>}
              {!compact && v.concepts?.length > 0 && (
                <div className="chips">
                  {v.concepts.slice(0, 5).map((c) => (
                    <Link key={c.slug} to={`/technique/${c.slug}`} className="chip">{c.label}</Link>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
