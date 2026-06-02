import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Reset scroll to the top on route change (SPA navigation otherwise keeps the
// previous page's scroll position).
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
