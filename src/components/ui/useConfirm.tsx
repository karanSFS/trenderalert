"use client";

import { useCallback, useState, type ReactNode } from "react";
import { ConfirmDialog, type ReasonRequirement } from "./ConfirmDialog";

export interface ConfirmSpec {
  title: string;
  description?: ReactNode;
  consequences?: string[];
  confirmLabel?: string;
  danger?: boolean;
  requireReason?: boolean | ReasonRequirement;
  onConfirm: (reason: string | undefined) => Promise<unknown>;
}

/**
 * One confirmation dialog per screen. `confirm(spec)` opens it; the spec is kept during the
 * closing animation so content does not disappear mid-transition.
 */
export function useConfirm() {
  const [spec, setSpec] = useState<ConfirmSpec | null>(null);
  const [open, setOpen] = useState(false);

  const confirm = useCallback((next: ConfirmSpec) => {
    setSpec(next);
    setOpen(true);
  }, []);

  const dialog = spec ? (
    <ConfirmDialog
      open={open}
      title={spec.title}
      description={spec.description}
      consequences={spec.consequences}
      confirmLabel={spec.confirmLabel}
      danger={spec.danger}
      requireReason={spec.requireReason}
      onConfirm={async (reason) => {
        await spec.onConfirm(reason);
      }}
      onClose={() => setOpen(false)}
    />
  ) : null;

  return { confirm, dialog };
}
