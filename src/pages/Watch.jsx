import { memo } from "react";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import CreatorDirectory from "../components/CreatorDirectory.jsx";
import WatchDigest from "../components/WatchDigest.jsx";
import VideoCard from "../components/VideoCard.jsx";
import LiteYouTube from "../components/LiteYouTube.jsx";

// The Watch page is video-first. A video is the unit: the Latest grid shows recent videos as
// tiles (thumbnail + a one-line "why it matters") that open a dedicated on-site page
// (/watch/<id>) with the embedded talk, an agentic write-up, and a Similar rail by cosine
// similarity (public/data/videos/*). The channel roster (directory.json) demotes to a
// secondary "Browse by educator" strip. See docs/SOURCES.md and docs/FEATURE_PLAYBOOK.md.
const LATEST_LIMIT = 24;

function Watch() {
  useDocumentTitle("Watch");
  const { data: vids, loading } = useData("/data/videos/index.json");
  const { data: dir } = useData("/data/directory.json");
  const { data: creators } = useData("/data/creators.json");
  const videos = (vids?.videos || []).slice(0, LATEST_LIMIT);
  const roster = dir?.roster || [];
  const pinned = creators?.pinned || [];

  return (
    <div className="stack">
      <section className="hero">
        <h1>Watch</h1>
        <p className="lede">
          The latest from favorite AI teachers. Each video opens its own page with the embedded talk, a short write-up of what it covers and why it matters, and the most similar videos by meaning.
        </p>
      </section>

      <WatchDigest />

      <section>
        <div className="card-head"><h2>Latest Videos</h2></div>
        {vids?.generated && <div className="faint mono">current as of {vids.generated}</div>}
        {videos.length > 0 ? (
          <div className="grid cols-3 video-cards">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        ) : (
          <div className="empty">
            <strong>Latest videos</strong>
            {loading ? "Loading…" : "Awaiting the first ingest."}
          </div>
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

      <section>
        <div className="card-head"><h2>Browse by Educator</h2></div>
        <p className="faint">The {roster.length || ""} channels in the three-month rotation. Subscribe to follow them at the source.</p>
        {roster.length > 0 ? (
          <CreatorDirectory roster={roster} />
        ) : (
          <div className="empty">
            <strong>Educator directory</strong>
            Awaiting the first build.
          </div>
        )}
      </section>
    </div>
  );
}

export default memo(Watch);
