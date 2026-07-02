# API Communication

## Error handling

[See Mycelium example](https://github.com/mycel-project/mycelium/tree/main/lib/data/network)

Mycel distinguishes five categories of errors.

- **Network errors** occur when the server cannot be reached at all: connection refused, timeout, DNS failure, and so on. These produce no HTTP response and no body. The recommended approach is to catch them at the transport layer and retry with backoff before surfacing anything to the user.
- **Authentication errors** (type: "auth") are returned by MycelCloud when a request cannot be authorized. These cover invalid or expired tokens, missing credentials, and subscription issues. They should be handled at the top level of your client, before any business logic runs, typically by notifying the user and prompting them to take action. See [auth error reference](../manual/auth-errors.md).
- **Domain errors** (type: "domain") represent logically invalid operations like requesting a resource that does not exist, violating a business rule, ... These are expected errors that your services should catch and handle specifically. Each endpoint in api reference documents the domain errors it can produce.
- **Version errors** (type: "version") indicate that your implementation and the Mycel instance are not compatible. This can happen if Mycel is outdated compared to what your implementation requires, or if the major versions differ. The recommended approach is to block all further calls and display a clear message to the user. See [Versioning section](#versioning) for more details.
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

    // domain falls through
	elif error.type == "domain":
		pass 
		let services handle the specific code

	// Fallback - unknown error type
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
except MyclError as e:
    if e.code == "NODE_NOT_FOUND":
        // handle specifically
    if e.code == "NOT_A_SPORE":
        // handle specifically
```

## Idempotency

Mycel implements server-side idempotency for non-idempotent endpoints. These are marked in the API reference.

To benefit from this protection, include an `Idempotency-Key` header with a unique UUID per user action:

```http
POST /collections/{col_id}/reviews/undo
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

If the same key is sent again within 1 hour, Mycel returns the original response without re-executing the operation.

This header is optional but strongly recommended for non-idempotent endpoints: omitting it exposes your implementation to instability caused by network retries or accidental double calls. A basic level of protection can be achieved by wrapping all your calls with this idempotency key. However, a better approach is to generate the key at the action level and reuse the exact same key when retrying that action.

In a more general sense, when dealing with user-triggered asynchronous actions, you can prevent spam by temporarily disabling the action's availability or behavior until the operation completes or timeout.

## Versioning

Mycel uses semantic versioning (MAJOR.minor.patch). Compatibility across versions is something actively maintained, but errors or inconsistencies may slip through and will be corrected as they are reported.

### Compatibility rules

The rules are simple: the major version must match exactly, and the minor version of the instance must be greater than or equal to the one declared by the implementation. The patch version follows the same logic as the minor. If your implementation declares `2.3.0` and the Mycel instance runs `2.5.1`, the request goes through. If the instance runs `2.1.0`, Mycel returns a version error inviting the user to update their instance. If the major versions differ, Mycel refuses the request entirely, there is no compatibility guarantee across majors.

### Compatibility check

Mycel verifies version compatibility on every request that includes the X-Mycel-Version header. The header should contain the minimum Mycel version the implementation is compatible with, typically the version it was originally built against. If the header is present, Mycel checks that the declared version is compatible with the running instance and returns a version error if not. This is the recommended way for implementations to protect their users against accidental incompatibilities.

When using MycelCloud, the header is required: requests are automatically routed to the Mycel instance matching the declared major version, as MycelCloud runs multiple major versions in parallel to support implementations that have not yet migrated.

If you need custom version handling logic, the current Mycel version is available at GET /version and can be used to implement your own compatibility check.

### Breaking changes within a major

When a behavioral change is introduced within a major, the old behavior is kept as the default for core features and the new behavior is opt-in via a parameter. This means updating Mycel without updating your implementation will never silently change how the core of the app works. Minor fixes and non-breaking improvements may however be applied transparently. At the next major version, compatibility parameters accumulated during the previous major are removed and the new behaviors become the defaults.

### Migration across majors

Each major release is accompanied by migration tooling and documentation to help transition data and configurations. Where possible, migrations are automated via Alembic.
