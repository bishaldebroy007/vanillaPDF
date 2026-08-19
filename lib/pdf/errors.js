const PASSWORD_PATTERNS = [
  /password/i,
  /encrypted/i,
  /PasswordException/,
];

export function isPasswordProtectedError(err) {
  const message = err?.message || String(err);
  return PASSWORD_PATTERNS.some((pattern) => pattern.test(message));
}

export function wrapPdfError(err) {
  if (isPasswordProtectedError(err)) {
    return new Error("This PDF is password-protected. Please remove the password and try again.");
  }
  return err;
}

export function throwIfAborted(signal) {
  if (signal?.aborted) {
    const err = new Error("Processing was cancelled.");
    err.name = "AbortError";
    throw err;
  }
}
