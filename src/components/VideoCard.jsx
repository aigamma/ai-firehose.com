import { memo } from "react";
import { Link } from "react-router-dom";

// A video tile for the video-first Watch grid: thumbnail (the preview) + title + channel +
// a one-line "why it matters", linking to the on-site /watch/<id> page rather than off to
// YouTube. Substance over tags: the summary leads; concept chips live on the detail page.
function VideoCard({ video }) {
  if (!video?.id) return null;
  return (
    <Link to={`/watch/${video.id}`} className="card video-card">
      <div className="video-card-thumb">
        <img
          src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          width="320"
          height="180"
          onError={(e) => {
            if (!e.currentTarget.dataset.fb) {
              e.currentTarget.dataset.fb = "1";
              e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
            }
          }}
        />
        {video.recommended && <span className="badge badge-recommended video-card-rec" title="Most Focused inner circle">★</span>}
      </div>
      <div className="video-card-body">
        <h3 className="video-card-title">{video.title}</h3>
        <div className="faint mono video-card-channel">{video.channel}</div>
        {video.summary && <p className="video-card-sum">{video.summary}</p>}
      </div>
    </Link>
  );
}

export default memo(VideoCard);
