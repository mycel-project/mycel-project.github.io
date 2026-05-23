# Scheduling algorithms
This section describe the fundamental logic behind the schedulding logic regarding every type of node.
Each version documents changes only. Omitted behavior is unchanged from the prior version.

## Mycel v0.1.0 (Coming-soon)
This update aims to handle fragments with a better logic to avoid accumulation.



## [Mycel v0.0.4](https://github.com/mycel-project/mycel/releases/tag/v0.0.4)

- When creating a node (whether by importing or extracting), the first review is scheduled for the next day.
- Fragments are scheduled on each encounter to the day matching their total repetition count (1st encounter → next day, 2nd encounter → 2 days, etc.). This is problematic as extracted fragments accumulate quickly and bloat review sessions.
- Spores strictly follow the unmodified FSRS algorithm.
- Priority only determines the order in which elements are presented within a review session.
