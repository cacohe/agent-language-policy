# Contributing

Thank you for helping improve Agent Language Policy.

## Before opening a change

- Search existing issues and keep each proposal focused.
- For a new language, use a BCP 47 locale and keep the profile, Skill reference, documentation, and tests synchronized.
- Do not translate source code, identifiers, commands, paths, APIs, logs, or original errors in policy text.
- Preserve user-owned content, backups, idempotent installation, and precise uninstall behavior.

## Development workflow

Use Node.js 20 or later. The project intentionally has no runtime dependencies.

```bash
npm test
npm run verify
```

Add or update tests before changing behavior. Use English commit messages and keep documentation for all supported languages structurally aligned. Do not include secrets, personal configuration, generated backups, or unpublished credentials.

By contributing, you agree that your contributions are licensed under Apache License 2.0.
