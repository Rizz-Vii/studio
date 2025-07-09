"use client";

import { useState, useEffect } from "react";

/**
 * A custom hook that returns `true` once the component has been hydrated on the client.
 * This is useful to prevent hydration mismatches by delaying the rendering of
 * client-side-only components until after the initial server render.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // This effect only runs on the client, after the initial render.
    setHydrated(true);
  }, []);

  return hydrated;
}
