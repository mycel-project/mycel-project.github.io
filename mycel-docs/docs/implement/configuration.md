# User Configuration

Mycel exposes its user settings schema dynamically via 
`GET /schemas/user-settings`. This means your client never needs to 
hardcode specific field names or values — the schema is the source of truth.

<!-- !!! note "TODO Explain diff between user/collection config" -->


!!! info "No custom settings — yet"
    Mycel does not currently support client-specific settings. If you 
    need custom settings, handle them directly in your environment for 
    now — and feel free to open a discussion, as it may well be worth 
    adding.

## Fetching the configuration

To access a user's current configuration, fetch the user via 
`GET /users/{user_id}`. The response includes the user config object 
with all current values, ready to use in your client.

## Rendering the schema

Each field in the schema includes metadata that your client can use to 
render the appropriate UI:

| Property | Purpose |
|---|---|
| `type` | Field type (`integer`, `boolean`, `string`...) — determines whether to render a slider, checkbox, or text field |
| `description` | Human-readable explanation to display to the user |
| `default` | Default value — use it to offer a per-field reset button |
| `minimum` / `maximum` / `step` | Bounds and increment for numeric fields, e.g. to configure a slider |
| `category` | Logical grouping (e.g. `review`, `network`) — use it to group fields into sections |
| `unit` | Display unit (e.g. `min`, `d`, `s`) |
| `warning` | Optional message to display when the user modifies that field — flags potentially destructive or disruptive behavior |

Your client should parse the schema at runtime and render each field 
based on its type and metadata, without branching on specific field names.

When iterating over the schema, note that not every field will be 
directly useful to expose in your UI. Some are primarily intended for 
Mycel's internal behavior (e.g. `delete_max_age`, `wait_for_due_time`), 
while others are more likely to be relevant to your users, such as 
`add_extract_to_nav` or `ping_frequency`. 

!!! example "Two ways to implement this"
    One approach is to iterate over every field in the schema and 
    render each one generically based on its `type` (a slider for 
    `integer`, a checkbox for `boolean`, and so on) — this requires no 
    maintenance as new fields are added.
    
    Alternatively, you can cherry-pick specific fields by name and 
    build a custom UI for each one. This gives you more control over 
    presentation, but means your client won't automatically support 
    new fields until you explicitly add them.
	
## Updating the config

To update the user config, send a `PATCH /users/{user_id}` request 
with the fields you want to change. Only include the fields you're 
modifying — omitted fields remain unchanged.

The expected shape of the config object is documented in the 
[API reference](../reference/api.md).

!!! tip "Partial updates only"
    You don't need to send the entire config object back — just the 
    fields the user actually changed. This avoids accidentally 
    overwriting other settings with stale values.

## Handling schema versioning `optional`

Each field carries a `version` property indicating when it was 
introduced (e.g. `"1.0"`, `"1.2"`).

Your client may declare the Mycel config it explicitly 
supports. Fields introduced after that version should still be 
displayed, but with a warning indicating that they may behave 
unexpectedly, since your client wasn't built with them in mind. This 
approach ensures:

- Clients stay functional as new fields are added
- Users are warned when a setting could be unstable in their client
- No client becomes fully outdated just because a single field was added

In practice, this means iterating over every field returned by the 
schema and comparing its `version` against the version your client 
supports:

```pseudocode
MYCEL_SUPPORTED_VERSION = "1.1"

for field in schema.fields:
    render(field)
    if field.version > CLIENT_SUPPORTED_VERSION:
        show_warning(field, "This setting may behave unexpectedly")
```
