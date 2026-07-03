# Error Handling

## Types of Errors

Mycel distinguishes five categories of errors.

| Type | Description | Recommended handling |
|------|-------------|----------------------|
| **Network errors** | Occur when the server cannot be reached at all (connection refused, timeout, DNS failure, etc.). These produce no HTTP response and no body. | Catch at the transport layer and retry with backoff before surfacing anything to the user. |
| **Version errors** (`type: "version"`) | Indicate that your implementation and the Mycel instance are not compatible (outdated instance or major version mismatch). | Block all further calls and display a clear message to the user. See the [Versioning section](../../reference/versioning.md). |
| **Authentication errors** (`type: "auth"`) | Returned when a request cannot be authorized (invalid/expired token, missing credentials, subscription issues). | Handle at the top level before business logic runs; notify the user and prompt corrective action. See [auth error reference](../../manual/auth-errors.md). |
| **Domain errors** (`type: "domain"`) | Logically invalid operations (missing resources, business rule violations, etc.). These are expected errors. | Handle specifically in services. Each endpoint documents its possible domain errors in the [API reference](../../reference/api.md). |
| **Internal errors** (`type: "internal"`) | Unexpected server failures. | Do not swallow silently. Surface the error and encourage reporting. |

Network errors are raised by the transport layer and are not part of the Mycel response format. Their format varies depending on the HTTP request system you use.

All non-network errors share the same response format:

```
HTTP status code
{"detail": {"type": "...", "code": "...", "message": "..."}}
```

## Handle Errors
**Highly Recommended**{: .badge .badge-required}

A common pattern is to wrap every API call through a shared handler that checks the response status and reacts accordingly:

```Pseudocode
# Called automatically on every request 
handle_response(response):
    if response.status == 200:
        return Success(response.data)

    error = response.body.detail

    if error.type == "version":
        block everything
        display error.message or custom message to user

    elif error.type == "auth":
		display error.message

    elif error.type == "internal":
        log error
        notify user, suggest reporting the issue

    elif error.type == "domain":
        pass  # not handled here — passed down to the service layer

    else:
        log error
        notify user, suggest reporting the issue

    # Regardless of the branch above, the error always flows back to the caller
    return Error(error)
	
# Top-level call wrapper
request_api(request):
    try:
        response = send(request)
    except NetworkError:
        retry or notify user, server unreachable
        return Error(type: "network") # handled here directly — no HTTP response to parse

    return handle_response(response)
```

See the [Mycelium implementation](https://github.com/mycel-project/mycelium/tree/main/lib/data/network) as a concrete reference.

!!! example "Handle domain errors once they are propagated to the service layer"
	```Pseudocode
	# Within a service — only domain errors need explicit handling here,
	# since everything else was already handled generically above
	
	result = request_api(...)
	
	if result is Error and result.type == "domain":
		match result.code:
			"NODE_NOT_FOUND" -> handle specifically
			"NOT_A_SPORE"    -> handle specifically
	```
	
	See the [API reference](../../reference/api.md) to see the domain errors you may encounter for each endpoint. You don’t need to handle all of them — you may simply display the error information to the user, although this is less user-friendly and effective. When implementing an endpoint, consider which errors are worth handling for your specific use case.

### Initial Errors

When the user configures their [API Base URL](../setup/#api-base-url) 
or [MycelCloud token](../setup/#mycelcloud-token), you may want to 
send a simple `GET /health` request to confirm everything is set up correctly.

If an error occurs, display `error.message` near fields to guide the user — 
showing it persistently (rather than as a brief toast) makes it 
clearer for them, since they're actively watching for feedback on this 
specific action. For **Network Errors** specifically, avoid retrying 
silently as you might elsewhere — inform the user directly instead, 
e.g. "Can't reach Mycel at $API_BASE_URL".
