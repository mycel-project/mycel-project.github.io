# Multi-spore Support

Mycel optionally supports multiple spores per node. This means a single node can contain several questions based on the same content — for example, a cloze note like `{{c1::Capital of France}} {{c2::Paris}}` can generate two separate review cards from one piece of content.

If your implementation does not support multi-spore, each node will simply contain one question. Fragments always have exactly one learning unit, so this only applies to spore nodes.

When multiple spores exist on a node, they are identified by a `slot` parameter on relevant routes such as reschedule or reprioritise. If `slot` is not provided, it defaults to `0`, so implementations that ignore multi-spore will work correctly without any changes.
