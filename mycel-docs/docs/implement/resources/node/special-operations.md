# Special Operations

## Split Node

This operation is important for handling long nodes, which can become heavy and cause performance issues on some devices. It provides a way to quickly decompose a node while preserving all content and context: the node is split by heading level.

Implement a previewer so the user can see how the outline will be decomposed — not required, but a good idea. If you already have an outline view, it's straightforward: parse the outline with the level selected by the user (via a slider, text field, etc.) and send that level to Mycel when the user confirms. Note that an outline view is not strictly necessary for this feature, but makes for a convenient way to visualize the result.
