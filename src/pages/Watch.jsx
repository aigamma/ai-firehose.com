import { memo } from "react";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import CreatorDirectory from "../components/CreatorDirectory.jsx";
import CreatorSpotlight from "../components/CreatorSpotlight.jsx";
import LiteYouTube from "../components/LiteYouTube.jsx";

// The Watch page consolidates two surfaces over the same favorite AI educators:
//  1. Browse and Subscribe: the full roster the worker ingests into the three-month RAG
//     (public/data/directory.json), each card with a one-click subscribe and the concepts
//     it covers. Drop a handle into sources/youtube_channels.json and it appears here.
//  2. Latest: the curated spotlight of newest videos (public/data/creators.json), each
//     joined to the corpus for a cited summary and concept-hub links, plus a pinned list.
//     Nothing is featured past the three-month retention window (built by build_creators).
// See docs/SOURCES.md (the two registries) and docs/ONBOARD_YOUTUBE_CHANNEL.md.
function Watch() {
  useDocumentTitle("Watch");
  const { data: dir } = useData("/data/directory.json");
  const { data, loading } = useData("/data/creators.json");
  const roster = dir?.roster || [];
  const creators = data?.creators || [];
  const pinned = data?.pinned || [];

  return (
    <div className="stack">
      <section className="hero">
        <h1>Watch</h1>
        <p className="lede">
          Favorite AI teachers, two ways: browse the roster and subscribe, then catch their latest, each video joined to the corpus for a cited summary and links into the concepts it covers.
        </p>
      </section>

      <section>
        <div className="card-head"><h2>Browse and Subscribe</h2></div>
        {dir?.generated && <div className="faint mono">current as of {dir.generated}</div>}
        {roster.length > 0 ? (
          <CreatorDirectory roster={roster} />
        ) : (
          <div className="empty">
            <strong>Educator directory</strong>
            Awaiting the first build.
          </div>
        )}
      </section>

      <section>
        <div className="card-head"><h2>Latest</h2></div>
        {!data ? (
          <div className="empty">
            <strong>Featured creators</strong>
            {loading ? "Loading…" : "Awaiting the first build."}
          </div>
        ) : (
          creators.map((c) => (
            <section key={c.channel_id} className="card">
              <CreatorSpotlight creator={c} />
            </section>
          ))
        )}
      </section>

      {pinned.length > 0 && (
        <section className="card">
          <div className="card-head"><h2>Pinned Playlist</h2></div>
          <div className="video-grid">
            {pinned.map((v) => (
              <article key={v.videoId} className="video-tile">
                <LiteYouTube videoId={v.videoId} title={v.title} thumbnail={v.thumbnail} />
                <div className="video-meta">
                  <a href={v.url} target="_blank" rel="noreferrer" className="video-title">{v.title || v.videoId}</a>
                </div>
                {v.note && <p className="pin-note faint">{v.note}</p>}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default memo(Watch);
