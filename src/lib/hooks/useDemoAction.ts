"use client";

import { App } from "antd";
import { useCallback } from "react";
import { recordDemoAuditEvent } from "@/features/audit/auditSlice";
import type { AuditEventDraft } from "@/features/audit/auditTypes";
import { getErrorMessage } from "@/lib/errors";
import { useAppDispatch } from "@/store/hooks";

interface DemoActionOptions<T> {
  success: string;
  audit?: (result: T) => AuditEventDraft;
  after?: (result: T) => void;
}

/**
 * Runs a demo action: awaits it (rejections propagate, so dialogs stay open and show the
 * error), shows success feedback, records a demo audit event and runs follow-up work.
 */
export function useDemoAction() {
  const dispatch = useAppDispatch();
  const { message } = App.useApp();

  const run = useCallback(
    async <T>(action: Promise<T>, options: DemoActionOptions<T>): Promise<T> => {
      const result = await action;
      message.success(`${options.success} (demo only)`);
      if (options.audit) dispatch(recordDemoAuditEvent(options.audit(result)));
      options.after?.(result);
      return result;
    },
    [dispatch, message],
  );

  /** For actions without a dialog: failures are shown as an error message instead of thrown. */
  const runWithToast = useCallback(
    async <T>(action: Promise<T>, options: DemoActionOptions<T>): Promise<T | undefined> => {
      try {
        return await run(action, options);
      } catch (error) {
        message.error(getErrorMessage(error, "The action could not be completed."));
        return undefined;
      }
    },
    [run, message],
  );

  return { run, runWithToast };
}
