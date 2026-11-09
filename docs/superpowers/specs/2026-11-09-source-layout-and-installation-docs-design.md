# Source Layout and Installation Documentation Design

## Intent

Make the repository structure express the product's functional boundaries, remove public-contribution guidance that the project does not currently need, document the four-layer architecture, and distinguish portable Skill installation from the policy CLI.

## Goals

- Split the flat `src/` directory into `cli/`, `configuration/`, `installation/`, and `validation/` without changing runtime behavior or exported interfaces.
- Delete `CONTRIBUTING.md`, remove it from package contents and public documentation, and direct ordinary problem reports to GitHub Issues.
- Add `docs/architecture.md` with the four conceptual layers, their directory mapping, data flow, and the difference between `npx skills add` and the project CLI.
- Add synchronized `npx skills add` instructions to all four READMEs and state that this command installs only `human-decision-language`.
- Ship `docs/architecture.md` in the npm package so README links remain valid in the tarball.

## Non-goals

- Do not change CLI commands, configuration precedence, language validation, managed-block behavior, manifests, or supported agents and locales.
- Do not publish npm packages, make the repository public, or submit to a marketplace.
- Do not add automatic Skill installation to `agent-language-policy install` in this change.

## Chosen structure

```text
src/
├── cli/
│   └── cli.mjs
├── configuration/
│   ├── config.mjs
│   ├── policy-renderer.mjs
│   └── profiles.mjs
├── installation/
│   ├── adapters.mjs
│   ├── installer.mjs
│   └── managed-block.mjs
└── validation/
    ├── language-validator.mjs
    └── markdown-prose.mjs
```

The portable Skill and language profiles remain in `skills/` and `policy/profiles/` because those are public package assets rather than Node.js implementation modules. The CLI directory orchestrates the other three functional groups; it is not an additional policy layer.

## Four-layer mapping

1. Portable Skill: `skills/human-decision-language/` defines the human-facing policy and can be installed independently.
2. Language profiles: `policy/profiles/` are canonical machine-readable language data, loaded by `src/configuration/`.
3. Persistent instruction deployment: `src/installation/` safely renders, installs, updates, and removes managed instruction blocks.
4. Document validation: `src/validation/` checks Markdown explanatory prose after excluding technical literals.

`src/cli/` connects these layers for configuration, diagnostics, status, validation, installation, and removal.

## Installation documentation

The README installation section will show:

```bash
npx skills add cacohe/agent-language-policy --skill human-decision-language
```

It must explicitly say that this third-party cross-agent command installs only the portable Skill and does not install persistent instructions, configuration, or the Markdown validator. Source-based CLI instructions remain available separately. Because the repository is private and no package is published, the documentation must not imply that anonymous users or npm users can already install it.

## Verification

- A structural test asserts that no runtime modules remain directly under `src/`, every expected functional directory exists, and imports use the new paths.
- Existing unit and integration tests prove that all exports and behavior survive the move.
- Documentation tests assert that all four READMEs contain the Skill-only install command, link to `docs/architecture.md`, omit `CONTRIBUTING.md`, and direct problems to GitHub Issues.
- Package verification requires `docs/architecture.md` and rejects `CONTRIBUTING.md` from the tarball.
