# Scheduling algorithms
This section describe the fundamental logic behind the schedulding logic regarding every type of node.
Each version documents changes only. Omitted behavior is unchanged from the prior version.

If no additional explanation is provided for a specific component, it means the implementation and its docstring are considered sufficiently self-explanatory.

## [Mycel v0.1.0](https://github.com/mycel-project/mycel/releases/tag/v0.1.0)
This update introduces a dedicated scheduling logic for fragments to reduce review accumulation.

```python
def compute_fragment_next_interval(depth, rep_index, rep_mult=1.5, depth_midpoint=4.0) -> int:
    """
    Computes the interval in days before the next review of a fragment.

    Deeper fragments grow faster toward long intervals (exponential growth),
    while shallow fragments stay closer to a linear, regular review pace.
    The transition between linear and exponential behavior is controlled by depth_midpoint.

    depth: depth in the node tree (0 = root, 1 = first child, ...)
    rep_index: repetition index (0 = creation, 1 = first review, ...)
    rep_mult: how aggressively intervals grow for deep fragments
    depth_midpoint: nesting level at which growth is halfway between linear and exponential

    returns interval in days (capped at 365).
    """
    initial = min(1 + depth * 2, 14) # initial value at creation clamped to avoid too long intervals between creation and first review
    exp_weight = 1 - math.exp(-depth / depth_midpoint)
    interval = initial
    for _ in range(rep_index):
        additive_step = initial
        multiplicative_step = interval * (rep_mult - 1)
        step = additive_step * (1 - exp_weight) + multiplicative_step * exp_weight
        interval = int(min(interval + step, 365))
    return interval
```


## [Mycel v0.0.4](https://github.com/mycel-project/mycel/releases/tag/v0.0.4)

- When creating a node (whether by importing or extracting), the first review is scheduled for the next day.
- Fragments are scheduled on each encounter to the day matching their total repetition count (1st encounter → next day, 2nd encounter → 2 days, etc.). This is problematic as extracted fragments accumulate quickly and bloat review sessions.
- Spores strictly follow the unmodified FSRS algorithm.
- Priority only determines the order in which elements are presented within a review session.
