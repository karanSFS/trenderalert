"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` only once `flag` has stayed `true` for `delayMs`. Used so skeletons do not
 * flash for responses that arrive almost immediately.
 */
export function useDelayedFlag(flag: boolean, delayMs = 150): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!flag) return;
    const timer = setTimeout(() => setElapsed(true), delayMs);
    return () => {
      clearTimeout(timer);
      setElapsed(false);
    };
  }, [flag, delayMs]);

  return flag && elapsed;
}
