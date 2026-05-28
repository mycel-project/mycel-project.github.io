# Implement Mycel

This page describes how to create a Mycel implementation in existing tools and applications such as PKM tools, text editors, services, ... (even video games, where utility meets enjoyment!)

**Please note that the Mycel API is not stable at the moment and that things can evolve quickly, introducing frequent breaking changes. If you want to start an implementation now, please keep in mind that it may require significant maintenance effort.**

## Before you start

- From now on, the term **environment** refers to the tool of your choice in which you want to bring Mycel to life.

- We strongly recommend being familiar with your environment, both as a regular user (to understand what makes a good tool) and as a developer, as language-specific details are out of scope here.

- Prior experience with Mycelium (or another complete Mycel implementation) is highly beneficial for understanding the expected implementation patterns and the core principles of Spaced Repetition.

- Try to stick as much as possible to classical and standard ways of integrating your implementation with Mycel features. The more standard it is, the easier it will be to handle updates and breaking changes (and especially to avoid requiring changes unless Mycel explicitly introduces a breaking change).

- You can check whether a Mycel implementation already exists in your language of choice on the [Awesome Mycel repository](https://github.com/mycel-project/awesome-mycel) repository. It could be a source of inspiration or a place to reuse code from.

For any question or suggestion, feel free to ask (on Mycel repository, on project's reddit, ...)!

## Prerequisites

First, some conditions must be checked by your environment to allow implementing.

### Required

- A way to communicate with external REST APIs.

### Recommended

- A Markdown viewer/editor as Mycel is, at the moment, Markdown-only. (If you see value in extending beyond it, don’t hesitate to bring it up. This behavior could be changed without modifying everything, so it’s open for discussion.)
- A text/file caching system.

## Implementation guide
### Node edition
#### Spore dition
Unlike fragments, spores require special error handling. When sending updated content to Mycel to be saved, the backend validates that spore content contains at least one cloze field. If not, it returns a NO_CLOZE_FIELD_ERROR and rejects the update. The previously saved state is preserved.
This prevents users from accidentally deleting all cloze patterns while editing.
Recommended behavior:

- On first NO_CLOZE_FIELD_ERROR, toast the user once to inform them that at least one cloze field is required
- Show a persistent visual indicator (e.g. red background on the text field) until the error is resolved
- No changes needed to autosave logic: the backend will keep rejecting invalid content, simply ignore repeated errors after the first toast
- Remove the visual indicator when the backend returns a successful save response

If your implementation has a "discard changes" flow when leaving a node with unsaved content, it should cover this case naturally since the content remains dirty until a valid save goes through.

### Rescheduling
- After rescheduling, check whether the rescheduled node is the one currently being reviewed. If so, clear its review state. 

### Handle settings
Mycel handles user settings dynamically by exposing a /schema route that returns the full settings structure. Parse the returned JSON (see user_conf.py for the detailed structure) by handling 3 field types:

- int/float — typically rendered as a slider
- bool — rendered as a checkbox
- string — rendered as a text field

The schema provides the following metadata for each field:

- default — use it to offer a per-field reset button
- description — display it to the user
- min/max/step — use these to configure sliders
- category — use it to group fields into sections

Some fields also include a warning message to display whenever the user modifies that field. This is used to flag potentially destructive or disruptive behavior.

**Note: you do not need to hardcode each settings field individually, the schema is intentionally standardized so your UI can be built dynamically from it.**

You can then use these settings fields in your environment : they are attached to the User object. Some are primarily intended for Mycel's internal behavior and are not necessarily relevant to expose in your UI (e.g. delete_max_age, wait_for_due_time). Others may be directly useful, such as add_extract_to_nav or ping_frequency.

Mycel does not currently support implementation-specific settings. If you need custom settings, you can handle them directly in your environment, and feel free to open a discussion, it may well be worth adding.

### Handle Timezones

To ensure your implementation is robust to timezone changes, pass the user's current local timezone offset in minutes with every request that involves time or scheduling.

## Share your implementation

If you consider your implementation viable for others to use (even in an unstable state), feel free to showcase it. You can submit a pull request to the [Awesome Mycel repository](https://github.com/mycel-project/awesome-mycel) (using the provided template).

When updating the state or specification of your implementation, please open a new pull request to keep it up to date.

## Keep up to date

To stay informed about the latest updates and ensure your implementation remains compatible, follow the Mycel repository: https://github.com/mycel-project/mycel

Mycel follows classical Semantic Versioning (MAJOR.MINOR.PATCH), where versions are interpreted as BREAKING.FEATURE.PATCH once 1.0.0 is reached. Before 1.0.0, the API should be considered unstable and breaking changes may occur in minor or even patch releases.

We recommend keeping your implementation aligned with the latest MINOR version whenever possible, and only updating in response to explicit BREAKING changes when necessary, or critical patches.
