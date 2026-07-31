/**
 * Shared detection of "request interrupted" errors.
 *
 * A request is interrupted when the browser aborts an in-flight request because
 * another navigation/fuzzing/UI operation ran before it could complete (page
 * unload, route switch, tab switch, ...). These are benign: they are NOT
 * application bugs, and WebKit/Safari is the engine most likely to surface them
 * (e.g. `TypeError: Load failed`, `AbortError: Fetch is aborted` or an
 * `NSURLErrorDomain` cancelled error).
 *
 * This module is shared by the API layer (`getData`) and the global error
 * logger (`ErrorLogger`) so both always classify the same set of errors.
 */

const INTERRUPTED_ERROR_PATTERNS = [
  'load failed',
  'fetch is aborted',
  'the operation couldn',
  'networkerror when',
  'network request failed',
  'failed to fetch',
  'aborted',
  'cancelled',
  'canceled',
]

/** True when the message text looks like a request interruption. */
export function isRequestInterruptedMessage(message: unknown): boolean {
  const low = String(message ?? '').toLowerCase()
  return INTERRUPTED_ERROR_PATTERNS.some((pattern) => low.includes(pattern))
}

/** Detect whether an error/rejection was caused by a request interruption. */
export function isRequestInterruptedError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (error instanceof Error) return isRequestInterruptedMessage(error.message)
  return isRequestInterruptedMessage(error)
}
