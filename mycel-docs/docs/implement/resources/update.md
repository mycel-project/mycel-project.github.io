# Update resources

When implementing update logic (for users, nodes or collections), be aware that all fields explicitly provided in the payload, including fields set to `null`, will overwrite the existing values. Setting a field to `null` will raise a validation error if the underlying model does not accept `None`.

> **To leave a field unchanged, omit it entirely from the payload.** This behavior applies recursively to nested models.

See the API reference for Update User, Update Node and Update Collection for details.

**Example:**

*Initial state*

```json
{
  "status": "active",
  "data": {
    "title": "Old Title",
    "source": {
      "url": "https://mycel-project.com"
    }
  }
}
```

*Example A*

Updates **only** the title. Since `status` and `source` are omitted from the payload, they remain unchanged.

Payload:

```json
{
  "data": {
    "title": "New Title"
  }
}
```

Result:

```json
{
  "status": "active",
  "data": {
    "title": "New Title",
    "source": {
      "url": "https://mycel-project.com"
    }
  }
}
```

*Example B*

Updates the title but also explicitly sets `source` to `null`. Because `source` is included in the payload, its previous value is overwritten.

Payload:

```json
{
  "data": {
    "title": "New Title",
    "source": null
  }
}
```

Result:

```json
{
  "status": "active",
  "data": {
    "title": "New Title",
    "source": null
  }
}
```

If `source` does not accept `null`, this update will fail with a validation error.


