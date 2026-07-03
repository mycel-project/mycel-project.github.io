# Error Handling

Mycel distinguishes five categories of errors.

- **Network errors** occur when the server cannot be reached at all: connection refused, timeout, DNS failure, and so on. These produce no HTTP response and no body. The recommended approach is to catch them at the transport layer and retry with backoff before surfacing anything to the user.
- **Authentication errors** (type: "auth") are returned by MycelCloud when a request cannot be authorized. These cover invalid or expired tokens, missing credentials, and subscription issues. They should be handled at the top level of your client, before any business logic runs, typically by notifying the user and prompting them to take action. See [auth error reference](../../manual/auth-errors.md).
- **Domain errors** (type: "domain") represent logically invalid operations like requesting a resource that does not exist, violating a business rule, ... These are expected errors that your services should catch and handle specifically. Each endpoint in the [API reference](../../reference/api.md) documents the domain errors it can produce.
- **Version errors** (type: "version") indicate that your implementation and the Mycel instance are not compatible. This can happen if Mycel is outdated compared to what your implementation requires, or if the major versions differ. The recommended approach is to block all further calls and display a clear message to the user. See [Versioning section](../../reference/versioning.md) for more details.
- **Internal errors** (type: "internal") are unexpected failures. They should not be caught silently. The recommended approach is to surface the raw error to the user and encourage them to report it.

All non-network errors share the same response format:

```
HTTP status code
{"detail": {"type": "...", "code": "...", "message": "..."}}
```

A basic pattern for handling these layers:

```Pseudocode
try:
    response = call_mycel(...)
except NetworkError:
    retry or notify user, server unreachable

if response.status != 200:
    error = response.body.detail
    if error.type == "auth":
        match error.code:
            "invalid_token"   -> notify user, offer to open settings
            "token_expired"   -> notify user, offer to open settings
            "missing_token"   -> notify user, offer to open settings
            "not_subscribed"  -> notify user, link to mycelcloud.com
            "service_unavailable" -> notify user
        return

    elif error.type == "version":
        block everything
        display error.message or custom message to user
        return

    elif error.type == "internal":
        log error
        notify user, suggest reporting the issue
        return

    # domain falls through
    elif error.type == "domain":
        pass
        let services handle the specific code

    # Fallback - unknown error type
    else:
        log error
        notify user, suggest reporting the issue
        return

handle response.data
```

And within a service:

```Pseudocode
try:
    handle_response(response)
except MycelError as e:
    if e.code == "NODE_NOT_FOUND":
        # handle specifically
    if e.code == "NOT_A_SPORE":
        # handle specifically
```

See the [Mycelium implementation](https://github.com/mycel-project/mycelium/tree/main/lib/data/network) as a concrete reference.
