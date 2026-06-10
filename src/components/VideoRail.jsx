import { useRef } from "react";
import VideoCard from "./VideoCard.jsx";

// A horizontal, scroll-snapping rail of recent videos: the firehose you can slide through
// without leaving the page. Native overflow scroll carries touch and trackpad; prev/next
// arrows (desktop, pointer only) nudge it a screen at a time. Each tile is a VideoCard that
// opens its on-site /watch/<id> page. Reused anywhere a "slide through the latest" strip fits.
export default function VideoRail({ videos = [] }) {
  const ref = useRef(null);
  if (!videos.length) return null;

  const nudge = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <div className="video-rail-wrap">
      <button type="button" className="rail-arrow rail-arrow-prev" aria-label="Scroll back" onClick={() => nudge(-1)}>
        &lsaquo;
      </button>
      <div className="video-rail" ref={ref} tabIndex={0} role="group" aria-label="Recent videos, scroll to explore">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      <button type="button" className="rail-arrow rail-arrow-next" aria-label="Scroll forward" onClick={() => nudge(1)}>
        &rsaquo;
      </button>
    </div>
  );
}
