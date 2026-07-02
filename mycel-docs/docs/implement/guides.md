# Implementation Guides

## Node Titles and Content Preview

Every node includes a contentPreview field. This field typically captures the beginning of the node's first NodeField, allowing the frontend to display a quick preview without fetching the entire content payload. For instance, this is particularly useful in the priority slider to quickly inspect the text surrounding a specific priority value.

When rendering a node, you may also want to use the title field from NodeData if it is available. Whenever possible, this title is automatically populated. For example, when creating a node from a web article, Mycel extracts the article's name. However, because the title can remain unset, contentPreview should always serve as the fallback, for instance if you use it in the NodeTree or the priority selector.

The contentPreview is generated dynamically on the server. Therefore, it should not be directly updated by the user, as any manual changes would be overwritten during the next node fetch. But feel free to tweak the preview formatting, or share your thoughts on how we could fine-tune the preview building logic!

## Priority Display

Priority values are computed and rounded by Mycel depending on the number of items in the collection, so implementations do not need to handle rounding themselves. The value can be treated as a plain float, or converted to an integer when the decimal part is set to 0: both approaches are valid. Treating all values as floats is the simplest option and works correctly in all cases.

## Outline

## Rescheduling

- After rescheduling, check whether the rescheduled node is the one currently being reviewed. If so, clear its review state.

## Handle Timezones

To ensure your implementation is robust to timezone changes, pass the user's current local timezone offset in minutes with every request that involves time or scheduling.
