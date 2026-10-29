import "server-only";
import { NextResponse } from "next/server";
import type { ServiceError, ServiceErrorCode } from "@/types/api";
import { BackendError } from "./backendAuth";

export function errorResponse(code: ServiceErrorCode, message: string, status: number) {
  return NextResponse.json<{ error: ServiceError }>({ error: { code, message } }, { status });
}

/** Converts any failure into the `{ error }` body the client auth service expects. */
export function toErrorResponse(error: unknown) {
  if (error instanceof BackendError) return errorResponse(error.code, error.message, error.status);
  return errorResponse("UNKNOWN", "Something went wrong while signing in. Try again.", 500);
}
