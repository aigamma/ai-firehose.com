import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import LoadError from "../components/LoadError.jsx";
import LiteYouTube from "../components/LiteYouTube.jsx";
import RichText from "../components/RichText.jsx";
import { getKind } from "../data/registry.js";

// A dedicated, on-site page for one video: the embedded player, transcript-grounded study
// notes (a write-up, the key points, and timestamped chapters that deep-link into the player
// without leaving the site), the concepts it covers, and a Similar rail of the nearest videos
// by cosine similarity. This is the embedding substrate applied to video discovery, and it
// keeps the substance on-site instead of bouncing to YouTube. Reads public/data/videos/<id>.json.
const fmtTime = (t) => {
  const s = Math.max(0, Math.floor(t || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
};

export default function VideoPage() {
  const { videoId } = useParams();
  const { data: v, loading, error } = useData(`/data/videos/${videoId}.json`);
  useDocumentTitle(v?.title || "Video");

  // Player control for chapter deep-links: bumping the token remounts the embed at the
  // chosen second (LiteYouTube keys its iframe on it), and the player scrolls back into view.
  const playerRef = useRef(null);
  const [seek, setSeek] = useState({ t: null, n: 0 });
  const jumpTo = (t) => {
    setSeek((s) => ({ t, n: s.n + 1 }));
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <div className="stack" style={{ paddingTop: 40 }}><h1>Loading…</h1></div>;
  if (error) {
    return (
      <div className="stack" style={{ paddingTop: 40 }}>
        <h1>Video</h1>
        <LoadError label="Video" />
        <p className="muted">Back to <Link to="/watch">Watch</Link>.</p>
      </div>
    );
  }
  if (!v) {
    return (
      <div className="stack" style={{ paddingTop: 40 }}>
        <h1>Unknown video</h1>
        <p className="muted">It may have aged out of the three-month window. Back to <Link to="/watch">Watch</Link>.</p>
      </div>
    );
  }

  const k = getKind(v.kind);
  return (
    <div className="stack hub-page video-page" style={{ paddingTop: 24 }}>
      <h1 className="hub-title">{v.title}</h1>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {v.channelUrl ? (
          <a href={v.channelUrl} target="_blank" rel="noreferrer" className="faint">{v.channel}</a>
        ) : (
          <span className="faint">{v.channel}</span>
        )}
        {v.recommended && <span className="badge badge-recommended" title="Most Focused: a carefully vetted inner-circle channel">★ Most Focused</span>}
        {k && <span className={`badge ${k.badgeClass}`}>{k.singular}</span>}
        {v.published && <span className="faint mono">{v.published.slice(0, 10)}</span>}
      </div>

      <div ref={playerRef}>
        <LiteYouTube videoId={v.id} title={v.title} startAt={seek.t} playToken={seek.n} />
      </div>

      {v.chapters?.length > 0 && (
        <section className="video-chapters" aria-label="Chapters">
          <span className="eyebrow">Chapters</span>
          <ol className="chapter-list">
            {v.chapters.map((c, i) => (
              <li key={i}>
                <button type="button" className="chapter-btn" onClick={() => jumpTo(c.t)} title={`Play from ${fmtTime(c.t)}`}>
                  <span className="chapter-time mono">{fmtTime(c.t)}</span>
                  <span className="chapter-title">{c.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {(v.writeup || v.summary) && (
        <div>
          <span className="eyebrow">The Write-Up</span>
          <RichText as="p" className="hub-def" text={v.writeup || v.summary} />
        </div>
      )}

      {v.key_points?.length > 0 && (
        <section className="video-keypoints" aria-label="Key points">
          <span className="eyebrow">Key Points</span>
          <ul className="keypoint-list">
            {v.key_points.map((p, i) => (
              <li key={i}><RichText as="span" text={p} /></li>
            ))}
          </ul>
        </section>
      )}

      {v.concepts?.length > 0 && (
        <div className="related-mesh">
          <span className="eyebrow">Covers</span>
          <div className="chips">
            {v.concepts.map((c) => (
              <Link key={c.slug} to={`/technique/${c.slug}`} className="chip">{c.label}</Link>
            ))}
          </div>
        </div>
      )}

      {v.similar?.length > 0 && (
        <section className="card">
          <div className="card-head">
            <h2>Similar Videos</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>nearest by meaning</span>
          </div>
          <div className="grid cols-3 video-cards">
            {v.similar.map((s) => (
              <Link key={s.id} to={`/watch/${s.id}`} className="card video-card video-card--mini" aria-label={s.title}>
                <div className="video-card-thumb">
                  <img src={`https://i.ytimg.com/vi/${s.id}/mqdefault.jpg`} alt="" loading="lazy" />
                </div>
                <div className="video-card-body">
                  <h3 className="video-card-title">{s.title}</h3>
                  <div className="faint mono video-card-channel">{s.channel}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p>
        <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer">Watch on YouTube ↗</a>
        {" · "}
        <Link to="/watch">← Watch</Link>
      </p>
    </div>
  );
}
