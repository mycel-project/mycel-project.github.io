# Versioning

Mycel uses semantic versioning (MAJOR.minor.patch). Compatibility across versions is something actively maintained, but errors or inconsistencies may slip through and will be corrected as they are reported.

### Compatibility rules

The rules are simple: the major version must match exactly, and the minor version of the instance must be greater than or equal to the one declared by the implementation. The patch version follows the same logic as the minor. If your implementation declares `2.3.0` and the Mycel instance runs `2.5.1`, the request goes through. If the instance runs `2.1.0`, Mycel returns a version error inviting the user to update their instance. If the major versions differ, Mycel refuses the request entirely, there is no compatibility guarantee across majors.

### Compatibility check

Mycel verifies version compatibility on every request that includes the X-Mycel-Version header. The header should contain the minimum Mycel version the implementation is compatible with, typically the version it was originally built against. If the header is present, Mycel checks that the declared version is compatible with the running instance and returns a version error if not. This is the recommended way for implementations to protect their users against accidental incompatibilities.

When using MycelCloud, the header is required: requests are automatically routed to the Mycel instance matching the declared major version, as MycelCloud runs multiple major versions in parallel to support implementations that have not yet migrated.

If you need custom version handling logic, the current Mycel version is available at GET /version and can be used to implement your own compatibility check.

### Breaking changes within a major

When a behavioral change is introduced within a major, the old behavior is kept as the default for core features and the new behavior is opt-in via a parameter. This means updating Mycel without updating your implementation will never silently change how the core of the app works. Minor fixes and non-breaking improvements may however be applied transparently. At the next major version, compatibility parameters accumulated during the previous major are removed and the new behaviors become the defaults.

### Migration across majors

Each major release is accompanied by migration tooling and documentation to help transition data and configurations. Where possible, migrations are automated via Alembic.
