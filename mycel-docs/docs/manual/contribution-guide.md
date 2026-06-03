This guide is a work in progress. For now, it may appear largely empty or incomplete as content is added over time.

## On resource ownership and safety

To verify whether a user has the right to access a specific resource (e.g., nodes, reviews), certain functions enforce authorization by querying the repository and filtering by user_id.

Every REST endpoint must route through at least one of these ownership-verification functions at the very beginning of any data access or modification lifecycle.

(Note: These functions are not explicitly listed here as they may change; please refer to the endpoint implementations for direct references.)
