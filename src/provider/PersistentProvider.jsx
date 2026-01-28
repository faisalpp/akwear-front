import { useEffect, useRef } from "react";

const STORAGE_KEY = "__APP_SNAPSHOT__";

const PersistentProvider = ({ children }) => {
  const hasHydrated = useRef(false);

  // Restore state BEFORE app loads
  if (!hasHydrated.current) {
    const snapshot = localStorage.getItem(STORAGE_KEY);
    if (snapshot) {
      try {
        window.__APP_STATE__ = JSON.parse(snapshot);
      } catch {}
    }
    hasHydrated.current = true;
  }

  // Save app snapshot periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(window.__APP_STATE__ || {})
        );
      } catch {}
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return children;
};

export default PersistentProvider;
