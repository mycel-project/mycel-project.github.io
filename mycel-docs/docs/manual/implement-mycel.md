## **This page is in active building and is not complete at the moment.**

# Implement Mycel

This page describes how to create a Mycel implementation in existing tools and applications such as PKM tools, text editors, services, ... (even video games, where utility meets enjoyment!)

**Please note that the Mycel API is not stable at the moment and that things can evolve quickly, introducing frequent breaking changes. If you want to start an implementation now, please keep in mind that it may require significant maintenance effort.**

**The API contract is considered stable starting from Mycel 1.0.0. Prior to that, breaking changes may occur at any time.**

## Before you start

- From now on, the term **environment** refers to the tool of your choice in which you want to bring Mycel to life.

- We strongly recommend being familiar with your environment, both as a regular user (to understand what makes a good tool) and as a developer, as language-specific details are out of scope here.

- Prior experience with Mycelium (or another complete Mycel implementation) is highly beneficial for understanding the expected implementation patterns and the core principles of Spaced Repetition.

- Try to stick as much as possible to classical and standard ways of integrating your implementation with Mycel features. The more standard it is, the easier it will be to handle updates and breaking changes (and especially to avoid requiring changes unless Mycel explicitly introduces a breaking change).

- You can check whether a Mycel implementation already exists in your language of choice on the [Awesome Mycel repository](https://github.com/mycel-project/awesome-mycel) repository. It could be a source of inspiration or a place to reuse code from.

- While it is possible to develop your implementation using MycelCloud, it is highly recommended to use a [self-hosted](https://mycel-project.com/mycel#self-hosting) instance of Mycel to have full control over the infrastructure and access complete logs.

- Feel free to check the [Mycelium](https://github.com/mycel-project/mycelium) repository to see how certain things are implemented. Some sections in this document will point directly to this repo, but please note that these are just suggestions. There are often other, or even better, ways to handle this depending on your skill level and programming language.

For any question or suggestion, feel free to ask (on Mycel repository, on project's reddit, ...)!

## Prerequisites

First, some conditions must be checked by your environment to allow implementing.

### Required

- A way to communicate with external REST APIs.

### Recommended

- A Markdown viewer/editor as Mycel is, at the moment, Markdown-only. (If you see value in extending beyond it, don’t hesitate to bring it up. This behavior could be changed without modifying everything, so it’s open for discussion.)
- A text/file caching system.

## Implementation guide
### I. API communication
#### 1. Error handling
[See Mycelium example](https://github.com/mycel-project/mycelium/tree/main/lib/data/network)

Mycel distinguishes five categories of errors. 

- **Network errors** occur when the server cannot be reached at all: connection refused, timeout, DNS failure, and so on. These produce no HTTP response and no body. The recommended approach is to catch them at the transport layer and retry with backoff before surfacing anything to the user.
- **Authentication errors** (type: "auth") are returned by MycelCloud when a request cannot be authorized. These cover invalid or expired tokens, missing credentials, and subscription issues. They should be handled at the top level of your client, before any business logic runs, typically by notifying the user and prompting them to take action. See [auth error reference](./auth-errors.md).
- **Domain errors** (type: "domain") represent logically invalid operations like requesting a resource that does not exist, violating a business rule, ... These are expected errors that your services should catch and handle specifically. Each endpoint in api reference documents the domain errors it can produce.
- **Version errors** (type: "version") indicate that your implementation and the Mycel instance are not compatible. This can happen if Mycel is outdated compared to what your implementation requires, or if the major versions differ. The recommended approach is to block all further calls and display a clear message to the user. See [Versioning section](#3-versioning) for more details.
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

#### 2. Idempotency

Mycel implements server-side idempotency for non-idempotent endpoints. These are marked in the API reference.

To benefit from this protection, include an `Idempotency-Key` header with a unique UUID per user action:

```http
POST /collections/{col_id}/reviews/undo
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

If the same key is sent again within 1 hour, Mycel returns the original response without re-executing the operation.

This header is optional but strongly recommended for non-idempotent endpoints: omitting it exposes your implementation to instability caused by network retries or accidental double calls. A basic level of protection can be achieved by wrapping all your calls with this idempotency key. However, a better approach is to generate the key at the action level and reuse the exact same key when retrying that action.

In a more general sense, when dealing with user-triggered asynchronous actions, you can prevent spam by temporarily disabling the action's availability or behavior until the operation completes or timeout.

#### 3. Versioning
Mycel uses semantic versioning (MAJOR.minor.patch). Compatibility across versions is something actively maintained, but errors or inconsistencies may slip through and will be corrected as they are reported.

##### Compatibility rules

The rules are simple: the major version must match exactly, and the minor version of the instance must be greater than or equal to the one declared by the implementation. The patch version follows the same logic as the minor. If your implementation declares `2.3.0` and the Mycel instance runs `2.5.1`, the request goes through. If the instance runs `2.1.0`, Mycel returns a version error inviting the user to update their instance. If the major versions differ, Mycel refuses the request entirely, there is no compatibility guarantee across majors.

##### Compatibility check

Mycel verifies version compatibility on every request that includes the X-Mycel-Version header. The header should contain the minimum Mycel version the implementation is compatible with, typically the version it was originally built against. If the header is present, Mycel checks that the declared version is compatible with the running instance and returns a version error if not. This is the recommended way for implementations to protect their users against accidental incompatibilities.

When using MycelCloud, the header is required: requests are automatically routed to the Mycel instance matching the declared major version, as MycelCloud runs multiple major versions in parallel to support implementations that have not yet migrated.

If you need custom version handling logic, the current Mycel version is available at GET /version and can be used to implement your own compatibility check.

##### Breaking changes within a major

When a behavioral change is introduced within a major, the old behavior is kept as the default for core features and the new behavior is opt-in via a parameter. This means updating Mycel without updating your implementation will never silently change how the core of the app works. Minor fixes and non-breaking improvements may however be applied transparently. At the next major version, compatibility parameters accumulated during the previous major are removed and the new behaviors become the defaults.

##### Migration across majors

Each major release is accompanied by migration tooling and documentation to help transition data and configurations. Where possible, migrations are automated via Alembic.

### II. Model structuration
#### 1. General
##### Update disclaimer

When implementing update logic (for users, nodes or collections), be aware that all fields explicitly provided in the payload, including fields set to `null`, will overwrite the existing values. Setting a field to `null` will raise a validation error if the underlying model does not accept `None`.

> **To leave a field unchanged, omit it entirely from the payload.** This behavior applies recursively to nested models.

See the API reference for Update User, Update Node and Update Collection for details.

**Example:**

*Initial state*

```json
{
  "status": "active",
  "data": {
    "title": "Old Title",
    "source": {
      "url": "https://mycel-project.com"
    }
  }
}
```

*Example A*

Updates **only** the title. Since `status` and `source` are omitted from the payload, they remain unchanged.

Payload: 

```json
{
  "data": {
    "title": "New Title"
  }
}
```

Result:

```json
{
  "status": "active",
  "data": {
    "title": "New Title",
    "source": {
      "url": "https://mycel-project.com"
    }
  }
}
```

*Example B*

Updates the title but also explicitly sets `source` to `null`. Because `source` is included in the payload, its previous value is overwritten.

Payload: 

```json
{
  "data": {
    "title": "New Title",
    "source": null
  }
}
```

Result:

```json
{
  "status": "active",
  "data": {
    "title": "New Title",
    "source": null
  }
}
```

If `source` does not accept `null`, this update will fail with a validation error.

#### 2. User
#### Configuration
Mycel exposes its user settings schema dynamically via `GET /schemas/user-settings`. This means implementations never need to hardcode specific field names or values: the schema is the source of truth.

##### How it works
Each field in the schema includes metadata that implementations can use to render the appropriate UI:
- `type`: the field type (`integer`, `boolean`, `string`, etc.) - render as slider, checkbox, or text field accordingly
- `description`: human-readable explanation of the setting - display it to the user
- `default`: the default value - use it to offer a per-field reset button
- `minimum` / `maximum` / `step`: bounds and increment for numeric fields - use these to configure sliders
- `category`: logical grouping for display (e.g. `review`, `network`) — use it to group fields into sections
- `unit`: display unit (e.g. `min`, `d`, `s`)
- `warning`: optional message to display whenever the user modifies that field - used to flag potentially destructive or disruptive behavior

Implementations should parse the schema at runtime and render each field based on its type and metadata, without branching on specific field names.

Some fields are primarily intended for Mycel's internal behavior and are not necessarily relevant to expose in your UI (e.g. `delete_max_age`, `wait_for_due_time`). Others may be directly useful, such as `add_extract_to_nav` or `ping_frequency`.

Mycel does not currently support implementation-specific settings. If you need custom settings, handle them directly in your environment, and feel free to open a discussion, it may well be worth adding.

##### Versioning
Each field carries a `version` property indicating when it was introduced (e.g. `"1.0"`, `"1.2"`).

Implementations declare the config version they explicitly support. Fields introduced after that version should still be displayed, but with a warning indicating that the behavior has not been explicitly implemented. This ensures:
- Implementations stay functional as new fields are added
- Users are informed when a setting is not fully supported by their client
- No implementation becomes fully outdated just because a single field was added

##### Using configuration values
To access a user's current configuration, fetch the user via `GET /users/{user_id}`. The response includes the user config object with all current values, ready to use in your implementation.
#### 3. Collection

#### 4. Node 
[See Mycelium example](https://github.com/mycel-project/mycelium/blob/main/lib/data/models/node.dart) | [Full NodeDetailView model](https://api.mycelcloud.com/scalar#models/NodeDetailView)

It is recommended to implement a node-related model structure that includes:

- A Node model based on the [NodeDetailView Model](https://github.com/mycel-project/mycel/blob/main/src/schemas/node_detail_view.py) and his superclass [NodeView](https://github.com/mycel-project/mycel/blob/main/src/schemas/node_view.py). Instead of creating two distinct models, combine them into a single model, making all fields required except for those that are optional in NodeView and all fields from NodeDetailView. That way, whether mycel sends a NodeView or a NodeDetailView, your Node model will be ready to handle it, and the cache will be centralized.

- A [LearningUnitView](https://github.com/mycel-project/mycel/blob/main/src/schemas/learning_unit_view.py) model that combines the FragmentView and SporeView models. Note that SporeView inherits from [Spore](https://github.com/mycel-project/mycel/blob/main/src/models/spore.py) and FragmentView inherits from [Fragment](https://github.com/mycel-project/mycel/blob/main/src/models/fragment.py). Both the Spore and Fragment models inherit from the [BaseLearningUnit](https://github.com/mycel-project/mycel/blob/main/src/models/base_learning_unit.py) model. Some fields are added or removed when building views (for instance, position and priority). All fields that are not optional or nullable in Mycel's code can be set as required in your models.

- If you have implemented learning units models, you will probably need to add deserialization for the received JSON based on their types (see the "switch" pattern in the Mycelium example).

- You can also create models for NodeType, NodeData, NodeFields, etc., but it is less necessary.

- Regarding other Node API endpoints, you can create models for endpoints that return formatted data rather than full nodes—such as the "Get Priorities" or "Create Node Extract" endpoint. But for instance, in Mycelium, the "Get Priorities" response is parsed directly and saved into NodeCache without passing through an additional model.

##### Spore edition
Unlike fragments, spores require special error handling. When sending updated content to Mycel to be saved, the backend validates that spore content contains at least one cloze field. If not, it returns a NO_CLOZE_FIELD_ERROR and rejects the update. The previously saved state is preserved.
This prevents users from accidentally deleting all cloze patterns while editing.
Recommended behavior:

- On first NO_CLOZE_FIELD_ERROR, toast the user once to inform them that at least one cloze field is required
- Show a persistent visual indicator (e.g. red background on the text field) until the error is resolved
- No changes needed to autosave logic: the backend will keep rejecting invalid content, simply ignore repeated errors after the first toast
- Remove the visual indicator when the backend returns a successful save response

If your implementation has a "discard changes" flow when leaving a node with unsaved content, it should cover this case naturally since the content remains dirty until a valid save goes through.

##### Fragment edition
###### Split node
This option is important for handling long nodes, which can become heavy and cause performance issues on some devices. It provides a way to quickly decompose a node while preserving all content and context: the node is split by heading level.

Implement a previewer so the user can see how the outline will be decomposed is not required but a good idea. If you already have an outline view, it's straightforward: parse the outline with the level selected by the user (via a slider, text field, etc.) and send that level to Mycel when the user confirms. Note that an outline view is not strictly necessary for this feature, but makes for a convenient way to visualize the result.

#### Multi-spore support

Mycel optionally supports multiple spores per node. This means a single node can contain several questions based on the same content, for example, a cloze note like {{c1::Capital of France}} {{c2::Paris}} can generate two separate review cards from one piece of content.

If your implementation does not support multi-spore, each node will simply contain one question. Fragments always have exactly one learning unit, so this only applies to spore nodes.

When multiple spores exist on a node, they are identified by a slot parameter on relevant routes such as reschedule or reprioritise. If slot is not provided, it defaults to 0, so implementations that ignore multi-spore will work correctly without any changes.

### Outline

### Rescheduling

- After rescheduling, check whether the rescheduled node is the one currently being reviewed. If so, clear its review state. 

### Handle Timezones

To ensure your implementation is robust to timezone changes, pass the user's current local timezone offset in minutes with every request that involves time or scheduling.

## Test your implementation

As mentioned, the best way to test your code during development is to work with a self-hosted Mycel instance. If you want to implement automated testing (which is highly recommended!), you can simulate Mycel's API using [mycel-openapi](https://github.com/mycel-project/mycel-openapi).

## Share your implementation

If you consider your implementation viable for others to use (even in an unstable state), feel free to showcase it. You can submit a pull request to the [Awesome Mycel repository](https://github.com/mycel-project/awesome-mycel) (using the provided template).

When updating the state or specification of your implementation, please open a new pull request to keep it up to date.

## Keep up to date

To stay informed about the latest updates and ensure your implementation remains compatible, follow the Mycel repository on github : https://github.com/mycel-project/mycel
