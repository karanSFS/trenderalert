"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, Promise<unknown>>();

/**
 * Loads a small reference list (for example filter options) once per page load and shares
 * it between components. Returns null until loaded; on failure the next mount retries.
 */
export function useLookup<T>(key: string, load: () => Promise<T>): T | null {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    let active = true;
    let request = cache.get(key) as Promise<T> | undefined;
    if (!request) {
      request = load();
      cache.set(key, request);
    }
    request.then(
      (result) => {
        if (active) setValue(result);
      },
      () => cache.delete(key),
    );
    return () => {
      active = false;
    };
    // `load` is expected to be stable for a given key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return value;
}
