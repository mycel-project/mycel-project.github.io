# Fetch Node

This section assumes you've already set up a unified Node model as described in [Modeling Node](modeling.md) — the fetch pattern below relies on being able to check whether `NodeFields` is already populated.

## Cache pattern

To avoid fetching the entire node every time it is opened:

1. Check if `NodeFields` is already present (not null) in your local model.
2. If it is missing, trigger a fetch for the `NodeDetailView`.
3. If it is already present, safely reuse your cached data.

## Concrete example

- **Node tree** — fetch light `NodeView` objects. You don't need the heavy `NodeFields` to build a tree.
- **Opening a node** — if `NodeFields` is absent, fetch the `NodeDetailView`; otherwise, display from cache.
