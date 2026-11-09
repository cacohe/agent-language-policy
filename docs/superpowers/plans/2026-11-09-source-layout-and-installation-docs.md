# Source Layout and Installation Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split runtime modules by function, remove public contribution guidance, document the four-layer architecture, and document portable Skill-only installation.

**Architecture:** Preserve all public exports and runtime behavior while moving flat Node.js modules into four functional directories. Keep the portable Skill and canonical language profiles in their standard package locations; update public documentation and release verification so the architecture document ships with the package while `CONTRIBUTING.md` does not.

**Tech Stack:** Node.js 20+ ESM, `node:test`, Agent Skills, Markdown, npm packaging.

**Spec:** `docs/superpowers/specs/2026-11-09-source-layout-and-installation-docs-design.md`

## Global Constraints

- Do not change CLI commands, configuration precedence, language validation, managed-block behavior, manifests, supported agents, or supported locales.
- Preserve every existing named export; only module paths may change.
- Keep the project free of third-party runtime dependencies.
- Keep all four READMEs synchronized and keep unpublished distribution claims accurate.
- Use English commit messages.

## Review Focus

- The executable and every test must import the new module paths; no stale direct `src/*.mjs` import may remain (Task 1).
- Cross-directory imports from installation to configuration and from CLI to every functional group must resolve on Windows and POSIX (Task 1).
- `npx skills add` documentation must say it installs only the portable Skill, not the persistent policy or validator (Task 2).
- Deleting `CONTRIBUTING.md` must remove every README, package allowlist, and tarball-verifier reference (Task 2).
- `docs/architecture.md` must be present in the npm tarball so relative README links are not broken after packaging (Task 2).

---

### Task 1: Split runtime modules by function

**Files:**
- Move: `src/cli.mjs` to `src/cli/cli.mjs`
- Move: `src/config.mjs`, `src/profiles.mjs`, `src/policy-renderer.mjs` to `src/configuration/`
- Move: `src/adapters.mjs`, `src/installer.mjs`, `src/managed-block.mjs` to `src/installation/`
- Move: `src/markdown-prose.mjs`, `src/language-validator.mjs` to `src/validation/`
- Modify: `bin/agent-language-policy.mjs`
- Modify: all `test/*.test.mjs` files importing runtime modules
- Modify: `test/standards.test.mjs`

**Interfaces:**
- Consumes: all existing named exports and their behavior.
- Produces: the same named exports at functional module paths under `src/cli/`, `src/configuration/`, `src/installation/`, and `src/validation/`.

- [ ] Add a structural standards test asserting the exact functional directories, expected files, no direct `src/*.mjs` files, and no stale direct imports.
- [ ] Run `node --test test/standards.test.mjs` and confirm it fails against the flat layout.
- [ ] Move modules with patch-based file moves and update internal, executable, and test imports without altering bodies.
- [ ] Run `npm test` and confirm all tests pass.
- [ ] Run `git diff --check` and commit with `refactor: organize runtime modules by function`.

### Task 2: Document architecture and Skill-only installation

**Files:**
- Create: `docs/architecture.md`
- Delete: `CONTRIBUTING.md`
- Modify: `README.md`, `README.zh-CN.md`, `README.zh-TW.md`, `README.ko-KR.md`
- Modify: `package.json`
- Modify: `scripts/verify-package.mjs`
- Modify: `test/standards.test.mjs`
- Modify: `test/package-verification.test.mjs`

**Interfaces:**
- Consumes: the functional layout produced by Task 1 and the existing package file allowlist.
- Produces: public architecture documentation, synchronized Skill-only install instructions, Issue reporting guidance, and a tarball containing `docs/architecture.md` but not `CONTRIBUTING.md`.

- [ ] Extend documentation and package tests to require the architecture link, `npx skills add cacohe/agent-language-policy --skill human-decision-language`, an explicit Skill-only limitation, GitHub Issues guidance, absence of `CONTRIBUTING.md`, and inclusion of `docs/architecture.md`.
- [ ] Run `node --test test/standards.test.mjs test/package-verification.test.mjs` and confirm failures for the missing documentation and obsolete contribution file.
- [ ] Add `docs/architecture.md` with the four layers, directory mapping, data flow, and the distinction between the community `skills` CLI and this project's policy CLI.
- [ ] Update all four READMEs, delete `CONTRIBUTING.md`, and synchronize the package and tarball allowlists.
- [ ] Run `npm test`, `npm run verify:release`, and `git diff --check`.
- [ ] Commit with `docs: explain architecture and skill installation`.

## Self-review

- Spec coverage: both functional restructuring and all requested documentation/deletion changes are assigned to a task.
- Interface consistency: module exports remain unchanged; only import paths move.
- Review focus: each listed failure mode has an assertion in the owning task.
- Proportion: two tasks match the two independently reviewable deliverables; no extra packaging system or runtime behavior is introduced.
