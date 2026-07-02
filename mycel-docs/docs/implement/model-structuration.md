# Model Structuration

## General

### Update disclaimer

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

## User Configuration

Mycel exposes its user settings schema dynamically via `GET /schemas/user-settings`. This means implementations never need to hardcode specific field names or values: the schema is the source of truth.

### How it works

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

### Versioning

Each field carries a `version` property indicating when it was introduced (e.g. `"1.0"`, `"1.2"`).

Implementations declare the config version they explicitly support. Fields introduced after that version should still be displayed, but with a warning indicating that the behavior has not been explicitly implemented. This ensures:
- Implementations stay functional as new fields are added
- Users are informed when a setting is not fully supported by their client
- No implementation becomes fully outdated just because a single field was added

### Using configuration values

To access a user's current configuration, fetch the user via `GET /users/{user_id}`. The response includes the user config object with all current values, ready to use in your implementation.

## Collection

## Node

[See Mycelium example](https://github.com/mycel-project/mycelium/blob/main/lib/data/models/node.dart) | [Full NodeDetailView model](https://api.mycelcloud.com/scalar#models/NodeDetailView)

It is recommended to implement a node-related model structure that includes:

- A Node model based on the [NodeDetailView Model](https://github.com/mycel-project/mycel/blob/main/src/schemas/node_detail_view.py) and his superclass [NodeView](https://github.com/mycel-project/mycel/blob/main/src/schemas/node_view.py). Instead of creating two distinct models, combine them into a single model, making all fields required except for those that are optional in NodeView and all fields from NodeDetailView. That way, whether mycel sends a NodeView or a NodeDetailView, your Node model will be ready to handle it, and the cache will be centralized.

- A [LearningUnitView](https://github.com/mycel-project/mycel/blob/main/src/schemas/learning_unit_view.py) model that combines the FragmentView and SporeView models. Note that SporeView inherits from [Spore](https://github.com/mycel-project/mycel/blob/main/src/models/spore.py) and FragmentView inherits from [Fragment](https://github.com/mycel-project/mycel/blob/main/src/models/fragment.py). Both the Spore and Fragment models inherit from the [BaseLearningUnit](https://github.com/mycel-project/mycel/blob/main/src/models/base_learning_unit.py) model. Some fields are added or removed when building views (for instance, position and priority). All fields that are not optional or nullable in Mycel's code can be set as required in your models.

- If you have implemented learning units models, you will probably need to add deserialization for the received JSON based on their types (see the "switch" pattern in the Mycelium example).

- You can also create models for NodeType, NodeData, NodeFields, etc., but it is less necessary.

- Regarding other Node API endpoints, you can create models for endpoints that return formatted data rather than full nodes—such as the "Get Priorities" or "Create Node Extract" endpoint. But for instance, in Mycelium, the "Get Priorities" response is parsed directly and saved into NodeCache without passing through an additional model.

### How to Retrieve NodeFields

Some endpoints return only NodeView models, which do not include the full content of the node (NodeFields). This allows for the fast retrieval of multiple nodes at once. On the other hand, endpoints like GetNode return NodeDetailView models, which include the complete NodeFields payload.

For example, when building a node tree, you don't need these heavy fields. However, as soon as a user opens a specific node, you will need to fetch its NodeDetailView to display the full content.

To avoid fetching the entire node every time it is opened, simply check if NodeFields is already present (not null) in your local model. If it is missing, trigger a fetch for the NodeDetailView; otherwise, safely reuse your cached data.

### Spore edition

Unlike fragments, spores require special error handling. When sending updated content to Mycel to be saved, the backend validates that spore content contains at least one cloze field. If not, it returns a NO_CLOZE_FIELD_ERROR and rejects the update. The previously saved state is preserved.
This prevents users from accidentally deleting all cloze patterns while editing.
Recommended behavior:

- On first NO_CLOZE_FIELD_ERROR, toast the user once to inform them that at least one cloze field is required
- Show a persistent visual indicator (e.g. red background on the text field) until the error is resolved
- No changes needed to autosave logic: the backend will keep rejecting invalid content, simply ignore repeated errors after the first toast
- Remove the visual indicator when the backend returns a successful save response

If your implementation has a "discard changes" flow when leaving a node with unsaved content, it should cover this case naturally since the content remains dirty until a valid save goes through.

### Fragment edition

#### Split node

This option is important for handling long nodes, which can become heavy and cause performance issues on some devices. It provides a way to quickly decompose a node while preserving all content and context: the node is split by heading level.

Implement a previewer so the user can see how the outline will be decomposed is not required but a good idea. If you already have an outline view, it's straightforward: parse the outline with the level selected by the user (via a slider, text field, etc.) and send that level to Mycel when the user confirms. Note that an outline view is not strictly necessary for this feature, but makes for a convenient way to visualize the result.

## Multi-spore support

Mycel optionally supports multiple spores per node. This means a single node can contain several questions based on the same content, for example, a cloze note like {{c1::Capital of France}} {{c2::Paris}} can generate two separate review cards from one piece of content.

If your implementation does not support multi-spore, each node will simply contain one question. Fragments always have exactly one learning unit, so this only applies to spore nodes.

When multiple spores exist on a node, they are identified by a slot parameter on relevant routes such as reschedule or reprioritise. If slot is not provided, it defaults to 0, so implementations that ignore multi-spore will work correctly without any changes.
