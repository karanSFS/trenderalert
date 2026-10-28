/** Extracts a user-facing message from a rejected thunk payload, ServiceError or Error. */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Try again.",
): string {
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
