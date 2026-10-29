"use client";

import { App } from "antd";
import { useCallback } from "react";
import { getErrorMessage } from "@/lib/errors";

interface ApiActionOptions<T> {
  success: string;
  after?: (result: T) => void;
}

/**
 * Runs an action against the real backend. The backend writes its own audit record, so no demo
 * audit event is recorded here. `run` rethrows (dialogs keep showing the error); `runWithToast`
 * reports failures as a message instead.
 */
export function useApiAction() {
  const { message } = App.useApp();

  const run = useCallback(
    async <T>(action: Promise<T>, options: ApiActionOptions<T>): Promise<T> => {
      const result = await action;
      message.success(options.success);
      options.after?.(result);
      return result;
    },
    [message],
  );

  const runWithToast = useCallback(
    async <T>(action: Promise<T>, options: ApiActionOptions<T>): Promise<T | undefined> => {
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
