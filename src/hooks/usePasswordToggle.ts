import { useState } from "react";

export function usePasswordToggle() {
  const [show, setShow] = useState(false);
  const toggle = () => setShow((v) => !v);
  return { show, toggle };
}
