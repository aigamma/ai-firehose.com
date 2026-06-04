import { useEffect, useRef, useState } from "react";

// A cited, illustrative figure on a concept hub. The image is self-hosted under
// /images/glossary/ and chosen to teach the concept's defining insight, not to
// decorate. It sits on a white pad so transparent or dark-on-clear diagrams stay
// legible on the dark theme, carries a teaching caption, and credits its author,
// license, and source page (the citation, satisfying CC attribution). Click or use
// the keyboard to enlarge it in a lightbox; a missing file renders nothing rather
// than a broken image, so an unfilled entry simply has no figure.
export default function GlossaryFigure({ image }) {
  const [errored, setErrored] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;
    const t = window.setTimeout(() => closeRef.current?.focus?.(), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      trigger?.focus?.();
    };
  }, [open]);

  if (!image?.src || errored) return null;

  const { src, alt, caption, credit, license, license_url: licenseUrl, source, provider } = image;
  const label = alt || caption || "Concept illustration";

  const attribution = (
    <span className="fig-credit faint">
      {source ? (
        <a href={source} target="_blank" rel="noreferrer">{provider || "Source"}</a>
      ) : (
        provider || ""
      )}
      {credit && credit !== "Unknown" ? <>{" · "}{credit}</> : null}
      {license ? (
        <>
          {" · "}
          {licenseUrl ? (
            <a href={licenseUrl} target="_blank" rel="noreferrer">{license}</a>
          ) : (
            license
          )}
        </>
      ) : null}
    </span>
  );

  return (
    <>
      <figure className="hub-figure">
        <button
          type="button"
          className="hub-figure-trigger"
          ref={triggerRef}
          onClick={() => setOpen(true)}
          aria-label={`Enlarge figure: ${label}`}
          title="Click to enlarge"
        >
          <img src={src} alt={label} loading="lazy" decoding="async" onError={() => setErrored(true)} />
        </button>
        <figcaption>
          {caption ? <span className="fig-caption">{caption}</span> : null}
          {attribution}
        </figcaption>
      </figure>

      {open && (
        <div
          className="hub-figure-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <button type="button" className="hub-figure-lightbox-close" ref={closeRef} onClick={() => setOpen(false)} aria-label="Close enlarged figure">
            ×
          </button>
          <figure className="hub-figure-lightbox-figure">
            <img src={src} alt={label} />
            <figcaption>
              {caption ? <span className="fig-caption">{caption}</span> : null}
              {attribution}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
