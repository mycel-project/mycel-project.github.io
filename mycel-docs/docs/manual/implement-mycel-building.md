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

For any question or suggestion, feel free to ask (on Mycel repository, on project's reddit, ...)!

## Prerequisites

First, some conditions must be checked by your environment to allow implementing.

### Required

- A way to communicate with external REST APIs.

### Recommended

- A Markdown viewer/editor as Mycel is, at the moment, Markdown-only. (If you see value in extending beyond it, don’t hesitate to bring it up. This behavior could be changed without modifying everything, so it’s open for discussion.)
- A text/file caching system.

## Implementation guide
## Update disclaimer

When implementing update logic (for users, nodes or collections), be aware that all fields explicitly passed in `UserUpdate`, `NodeUpdate` or `CollectionUpdate`, including fields set to `null`, will overwrite the existing value. Note that setting a field to `null` may raise a validation error if the underlying model (User, Node, Collection) does not accept `None` for that field. **Omit a field entirely to leave it unchanged.**

See the API reference for Update User, Update Node and Update Collection for details.

### Base
Hardcode nodeTypes: 

### User
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

### Node 

#### Update node
Renvoyer vers [Update disclaimer](#update-disclaimer) sur les updates partagé avec collection notamment

#### Spore edition
Unlike fragments, spores require special error handling. When sending updated content to Mycel to be saved, the backend validates that spore content contains at least one cloze field. If not, it returns a NO_CLOZE_FIELD_ERROR and rejects the update. The previously saved state is preserved.
This prevents users from accidentally deleting all cloze patterns while editing.
Recommended behavior:

- On first NO_CLOZE_FIELD_ERROR, toast the user once to inform them that at least one cloze field is required
- Show a persistent visual indicator (e.g. red background on the text field) until the error is resolved
- No changes needed to autosave logic: the backend will keep rejecting invalid content, simply ignore repeated errors after the first toast
- Remove the visual indicator when the backend returns a successful save response

If your implementation has a "discard changes" flow when leaving a node with unsaved content, it should cover this case naturally since the content remains dirty until a valid save goes through.

#### Fragment edition
##### Split node
This option is important for handling long nodes, which can become heavy and cause performance issues on some devices. It provides a way to quickly decompose a node while preserving all content and context: the node is split by heading level.

Implement a previewer so the user can see how the outline will be decomposed is not required but a good idea. If you already have an outline view, it's straightforward: parse the outline with the level selected by the user (via a slider, text field, etc.) and send that level to Mycel when the user confirms. Note that an outline view is not strictly necessary for this feature, but makes for a convenient way to visualize the result.

### Outline

### Rescheduling

- After rescheduling, check whether the rescheduled node is the one currently being reviewed. If so, clear its review state. 

### Handle Timezones

To ensure your implementation is robust to timezone changes, pass the user's current local timezone offset in minutes with every request that involves time or scheduling.

## Share your implementation

If you consider your implementation viable for others to use (even in an unstable state), feel free to showcase it. You can submit a pull request to the [Awesome Mycel repository](https://github.com/mycel-project/awesome-mycel) (using the provided template).

When updating the state or specification of your implementation, please open a new pull request to keep it up to date.

## Keep up to date

To stay informed about the latest updates and ensure your implementation remains compatible, follow the Mycel repository: https://github.com/mycel-project/mycel

Mycel follows classical Semantic Versioning (MAJOR.MINOR.PATCH), where versions are interpreted as BREAKING.FEATURE.PATCH once 1.0.0 is reached. Before 1.0.0, the API should be considered unstable and breaking changes may occur in minor or even patch releases.

We recommend keeping your implementation aligned with the latest MINOR version whenever possible, and only updating in response to explicit BREAKING changes when necessary, or critical patches.
