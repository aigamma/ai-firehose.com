import { useEffect } from "react";
import { SITE } from "../data/registry.js";

// Set the document title per route (for tabs, history, and SEO), restoring the
// site name on unmount. Pass a falsy title to use the bare site name.
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.name}` : SITE.name;
    return () => {
      document.title = SITE.name;
    };
  }, [title]);
}
