import { memo } from "react";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import CreatorSpotlight from "../components/CreatorSpotlight.jsx";
import LiteYouTube from "../components/LiteYouTube.jsx";

// The Watch page: a spotlight of favorite AI teachers (their latest videos, each
// joined to the corpus for a cited summary and concept-hub links) plus a hand-pinned
// playlist. Reads the resolved artifact public/data/creators.json, built by
// scripts/build_creators.mjs. Curated through this terminal: see docs/SOURCES.md.
function Watch() {
  useDocumentTitle("Watch");
  const { data, loading } = useData("/data/creators.json");
  const creators = data?.creators || [];
  const pinned = data?.pinned || [];

  return (
    <div className="stack">
      <section className="hero">
        <h1>Watch</h1>
        <p className="lede">
          The latest from favorite AI teachers, joined to the corpus so each video carries a cited summary and links into the concepts it covers.
        </p>
      </section>

      {data?.generated && <div className="faint mono">updated {data.generated}</div>}

      {!data ? (
        <div className="empty">
          <strong>Featured creators</strong>
          {loading ? "Loading…" : "Awaiting the first build."}
        </div>
      ) : (
        <>
          {creators.map((c) => (
            <section key={c.channel_id} className="card">
              <CreatorSpotlight creator={c} />
            </section>
          ))}

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
        </>
      )}
    </div>
  );
}

export default memo(Watch);
