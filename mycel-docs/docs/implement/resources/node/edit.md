# Edit Node

## Spore edition

Unlike fragments, spores require special error handling. When sending updated content to Mycel to be saved, the backend validates that spore content contains at least one cloze field. If not, it returns a `NO_CLOZE_FIELD_ERROR` and rejects the update. The previously saved state is preserved.

This prevents users from accidentally deleting all cloze patterns while editing.

Recommended behavior:

- On first `NO_CLOZE_FIELD_ERROR`, toast the user once to inform them that at least one cloze field is required.
- Show a persistent visual indicator (e.g. red background on the text field) until the error is resolved.
- No changes needed to autosave logic: the backend will keep rejecting invalid content; simply ignore repeated errors after the first toast.
- Remove the visual indicator when the backend returns a successful save response.

If your implementation has a "discard changes" flow when leaving a node with unsaved content, it should cover this case naturally since the content remains dirty until a valid save goes through.

## Fragment edition

Fragments do not require cloze validation. Saving a fragment follows the standard update flow — send the updated content, and the backend applies it directly.
