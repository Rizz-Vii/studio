import { useRef } from "react";

export function useRateLimiter(limitMs: number = 60000) {
  const lastRequestRef = useRef<number>(0);

  function canProceed() {
    const now = Date.now();
    if (now - lastRequestRef.current < limitMs) {
      return false;
    }
    lastRequestRef.current = now;
    return true;
  }

  return { canProceed };
}
