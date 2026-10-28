"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Keeps the id of the record shown in a detail drawer in the `?open=` URL parameter, so
 * drawers can be deep-linked from other modules and survive a refresh.
 * Components using this must render inside a Suspense boundary.
 */
export function useOpenParam(): [string | null, (id: string | null) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openId = searchParams.get("open");

  const setOpenId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("open", id);
      else params.delete("open");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return [openId, setOpenId];
}
