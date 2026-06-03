import { useCallback, useEffect, useState } from "react";

const KEY = "aifh-theme";

// The active surface background per theme, mirroring --bg in src/styles/theme.css.
// The mobile browser-chrome color (theme-color meta) is kept in sync with these,
// so light-mode users do not get dark chrome.
const BG = { dark: "#0d0f13", light: "#f6f8fb" };

function currentTheme() {
  if (typeof document !== "undefined") {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
  }
  return "dark";
}

// Dark is the default. The pre-paint script in index.html sets the attribute
// before React mounts; this hook keeps it in sync and persists the choice.
export default function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", BG[theme] || BG.dark);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* private mode, ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return { theme, toggle };
}
