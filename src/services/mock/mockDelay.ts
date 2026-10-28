import type { ServiceError, ServiceErrorCode } from "@/types/api";

const DEFAULT_DELAY_MS = 450;

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const MOCK_CONFIG = {
  delayMs: readNumber(process.env.NEXT_PUBLIC_MOCK_DELAY_MS, DEFAULT_DELAY_MS),
  failureRate: Math.min(1, readNumber(process.env.NEXT_PUBLIC_MOCK_FAILURE_RATE, 0)),
  failingServices: (process.env.NEXT_PUBLIC_MOCK_FAIL_SERVICES ?? "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean),
};

export class MockServiceError extends Error implements ServiceError {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.name = "MockServiceError";
    this.code = code;
  }
}

/** Converts any thrown value into the serializable error stored in Redux. */
export function toServiceError(error: unknown): ServiceError {
  if (error instanceof MockServiceError) return { code: error.code, message: error.message };
  if (error instanceof Error) return { code: "UNKNOWN", message: error.message };
  return { code: "UNKNOWN", message: "An unexpected error occurred." };
}

export interface MockRequestOptions {
  /** Service key used by `NEXT_PUBLIC_MOCK_FAIL_SERVICES`, e.g. "auth" or "users". */
  service: string;
  delayMs?: number;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The only place simulated latency and failures are produced. Resolvers receive no shared
 * references: results are deep-cloned so callers can never mutate the mock dataset.
 */
export async function mockRequest<T>(
  resolver: () => T,
  { service, delayMs = MOCK_CONFIG.delayMs }: MockRequestOptions,
): Promise<T> {
  await wait(delayMs);
  const forcedFailure = MOCK_CONFIG.failingServices.includes(service);
  if (forcedFailure || Math.random() < MOCK_CONFIG.failureRate) {
    throw new MockServiceError(
      "UNAVAILABLE",
      `The ${service} demo service is unavailable. Try again.`,
    );
  }
  return structuredClone(resolver());
}
