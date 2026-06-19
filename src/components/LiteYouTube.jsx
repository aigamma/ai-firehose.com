import { useState } from "react";

// A lightweight YouTube facade: render the thumbnail with a play button and inject
// the iframe only on click, so the page ships zero YouTube JS or cookies until the
// user opts in. Fixed 16:9 box means no layout shift on the swap. The iframe uses
// the youtube-nocookie host for privacy. No embed library. CSP must allow
// img-src i.ytimg.com and frame-src youtube-nocookie.com (see netlify.toml).
//
// Chapter deep-linking (on-site, no bounce to YouTube): a parent can drive playback by
// passing startAt (seconds) and bumping playToken on each chapter click. The iframe is
// keyed on playToken, so a new click remounts it at the chosen timestamp and seeks there.
// Both props are optional, so the plain thumbnail-to-play call sites are unchanged.
export default function LiteYouTube({ videoId, title = "", thumbnail, startAt = null, playToken = 0 }) {
  const [clicked, setClicked] = useState(false);
  if (!videoId) return null;

  // The thumbnail alt is intentionally "" (decorative), so the interactive control
  // must carry the accessible name. Fall back to the video title, and when that is
  // empty name the specific video by id rather than a generic "Play video" shared by
  // every control on the page.
  const named = title || `Video ${videoId}`;
  const on = clicked || playToken > 0;

  if (on) {
    const start = startAt != null && startAt > 0 ? `&start=${Math.floor(startAt)}` : "";
    return (
      <div className="lite-yt lite-yt--on">
        <iframe
          key={playToken}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${start}`}
          title={named}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  const play = () => setClicked(true);
  const src = thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return (
    <div
      className="lite-yt"
      role="button"
      tabIndex={0}
      aria-label={`Play: ${named}`}
      onClick={play}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          play();
        }
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={(e) => {
          if (!e.currentTarget.dataset.fb) {
            e.currentTarget.dataset.fb = "1";
            e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
          }
        }}
      />
      <span className="lite-yt__play" aria-hidden="true">
        <svg width="20" height="24" viewBox="0 0 22 26"><path d="M21 13 0 26V0z" fill="currentColor" /></svg>
      </span>
    </div>
  );
}
