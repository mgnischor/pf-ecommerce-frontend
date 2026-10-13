/**
 * Generates one Idempotency-Key per unsafe retried request (checkout, payment,
 * refund, cancellation). The key travels in the Idempotency-Key header; replays
 * return the original result server-side. Keys are UUIDs, never reused across
 * distinct payloads (backend ai/API_CONTRACTS.md section 11.2).
 */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
