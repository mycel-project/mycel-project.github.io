# Overview & Architecture

Here is some suggestions of architecture that you may want to implement.

## Caching 
When fetching resources like collections or nodes, cache them locally to avoid unnecessary network calls.

Use a **cache-aside** pattern with two kinds of functions:

- **`load*`** — always fetches from the API and (re)populates the cache. Use when you explicitly need fresh data (initial load, manual refresh).
- **`get*`** — reads from the cache if present, no freshness check; falls back to the API on a miss. Use everywhere else.

Freshness is thus an explicit choice by the caller, not something the cache manages on its own.

**Rules:**

1. **Single write path.** Only mutate the cache as a direct consequence of a confirmed API response, through one dedicated method (e.g. `updateCache`).
2. **Invalidate on mutation.** Every `create`/`update`/`delete`/`rename` must update or evict the corresponding entry right after a successful response.
3. **Invalidate on context change.** Clear the cache on user or collection switch.
4. **Assumes single-writer.** This works as long as the current client is the only one modifying a resource at a time. If concurrent edits (other devices, collaborators) become possible, `get*` can silently serve stale data — if this becomes a problem, consider more advanced options like TTLs, ETags, or push-based invalidation.
