# Modeling Node

This page covers how to represent nodes in your client-side code.

Both extend from `BaseLearningUnit` in Mycel's data model. Spore inherits from `Spore` → `BaseLearningUnit`, and Fragment inherits from `Fragment` → `BaseLearningUnit`.

On the wire, the API returns views of these models: `FragmentView` and `SporeView`. Some fields are added or removed compared to the base models (for instance, `position` and `priority` are stripped from the views).

The type distinction matters in three places:

1. **Modeling** — your `LearningUnitView` model needs to handle both types, with deserialization based on the received JSON type.
2. **Editing** — spores require special validation (at least one cloze field), while fragments do not.
3. **Multi-spore** — only spore nodes can have multiple learning units; fragments always have exactly one.

- **Node** — the container: fields, template, metadata. The API exposes it as `NodeView` (lightweight, no fields content) or `NodeDetailView` (full with `fields`).

## Unified Node model

Instead of creating two distinct models for `NodeView` and `NodeDetailView`, combine them into a single Node model:

- Make all fields **required** except for those that are optional in `NodeView`.
- Add all fields from `NodeDetailView` (which includes the full `NodeFields` payload).

That way, whether mycel sends a lightweight `NodeView` or a complete `NodeDetailView`, your Node model handles it — and the cache is centralized.

References: [NodeView](https://github.com/mycel-project/mycel/blob/main/src/schemas/node_view.py) | [NodeDetailView](https://github.com/mycel-project/mycel/blob/main/src/schemas/node_detail_view.py)

## LearningUnitView

The `LearningUnitView` model combines `FragmentView` and `SporeView`. Note the inheritance chain:

- `SporeView` inherits from `Spore` → `BaseLearningUnit`
- `FragmentView` inherits from `Fragment` → `BaseLearningUnit`

Some fields are added or removed when building views (for instance, `position` and `priority`). All fields that are not optional or nullable in Mycel's code can be set as required in your models.

Reference: [LearningUnitView](https://github.com/mycel-project/mycel/blob/main/src/schemas/learning_unit_view.py)

## Deserialization by type

Since the API returns either a `FragmentView` or a `SporeView` under the same `LearningUnitView` umbrella, you need to deserialize based on a type discriminator in the JSON. See the "switch" pattern in the [Mycelium example](https://github.com/mycel-project/mycelium/blob/main/lib/data/models/node.dart).

## Secondary models

You can also create models for `NodeType`, `NodeData`, `NodeFields`, etc., but it is less necessary — the unified Node model already covers the main use cases.

For endpoints that return formatted data rather than full nodes (such as "Get Priorities" or "Create Node Extract"), you may create dedicated models. In Mycelium, the "Get Priorities" response is parsed directly and saved into `NodeCache` without passing through an additional model.

---

> **Next:** the fetch pattern below relies on this unified model. See [Fetch Node](fetch.md).
