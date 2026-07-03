# Idempotency

Mycel implements server-side idempotency for non-idempotent endpoints,
marked as such in the API reference. Using this protection is optional
but recommended.

To benefit from this protection, include an `Idempotency-Key` header
with a unique UUID per user action:

```http
POST /collections/{col_id}/reviews/undo
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

If the same key is sent again within 1 hour, Mycel returns the
original response without re-executing the operation.

This header is optional but strongly recommended for non-idempotent
endpoints — omitting it exposes your client to instability from
network retries or accidental double calls. For best results, generate
the key at the action level and reuse it on retries, rather than
generating a new key per call.

!!! tip "Bonus: preventing spam client-side"
    Beyond idempotency keys, you can also prevent spam by temporarily
    disabling a user-triggered action until it completes or times out.
