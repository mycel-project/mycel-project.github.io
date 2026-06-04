This guide is a work in progress. For now, it may appear largely empty or incomplete as content is added over time.

## On configuration semantics

Mycel uses two distinct levels of configuration, each with a clear semantic scope:

**User configuration** holds global behavior settings that apply regardless of which collection is activen things like undo age, deletion policy, reconnection frequency, or navigation behavior. These are user preferences about how mycel/implementation works.

**Collection configuration** (`CollectionConf`, `AlgoConf`) holds settings scoped to a specific collection: the visual theme, the spaced repetition algorithm parameters, etc. These are intentionally per-collection because a user may want different retention targets or aesthetics across collections.

When adding a new setting, ask: does this apply to the user's entire experience, or only within a specific collection? That determines where it belongs.

## On resource ownership and safety

To verify whether a user has the right to access a specific resource (e.g., nodes, reviews), certain functions enforce authorization by querying the repository and filtering by user_id.

Every REST endpoint must route through at least one of these ownership-verification functions at the very beginning of any data access or modification lifecycle.

(Note: These functions are not explicitly listed here as they may change; please refer to the endpoint implementations for direct references.)
