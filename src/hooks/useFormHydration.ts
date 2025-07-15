"use client";

import { useEffect, useState } from "react";

export function useFormHydration() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return {
    isReady,
    isDisabled: !isReady,
    className: isReady ? undefined : "opacity-0",
  };
}
