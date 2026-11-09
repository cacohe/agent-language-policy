# Public Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Agent Language Policy for public installation with Apache-2.0 licensing, Traditional Chinese support, portable Agent Skill packaging, release metadata, documentation, and CI while keeping the repository private and unpublished.

**Architecture:** Keep the existing hybrid architecture: a portable Agent Skill defines semantics, the CLI installs persistent agent-native instructions, and the validator checks repository documents. Add release manifests around the existing root package, extend the shared locale registry with `zh-TW`, and keep runtime dependencies at zero.

**Tech Stack:** Node.js 20+ ESM, `node:test`, npm package metadata, Agent Skills, Agent Plugins, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-11-09-public-release-readiness-design.md`

## Global Constraints

- The GitHub repository remains private and no npm or marketplace publication occurs in this plan.
- The default locale remains `zh-CN`; supported locales are exactly `zh-CN`, `zh-TW`, and `ko-KR`.
- Runtime code uses only Node.js built-in modules.
- License identity is `Apache-2.0` with `Copyright 2026 cacohe and contributors`.
- Current documentation must not describe the product as an MVP.
- Root `plugin.json` uses portable fixed-path discovery; compatibility manifests may declare their skill path when their host format requires it.
- All commits use English messages and are pushed to `origin/main` only after verification.

## Review Focus

- A `zh-TW` document dominated by simplified-only characters must fail, while a short shared-Han document must pass without a false variant failure (Task 3).
- Release verification must not recurse through `prepack -> npm pack -> prepack` (Task 6).
- Portable and host-specific plugin manifests must not contradict each other about identity, version, license, or skill location (Task 1).
- Localized READMEs must not advertise an unpublished registry or marketplace package as already available (Task 5).
- Existing install, backup, idempotency, and uninstall behavior must remain unchanged for all five agents (Task 7).

---

### Task 1: Release identity, license, and host manifests

**Files:**
- Modify: `test/standards.test.mjs`
- Modify: `package.json`
- Modify: `plugin.json`
- Replace: `LICENSE`
- Create: `NOTICE`
- Create: `.codex-plugin/plugin.json`
- Create: `.claude-plugin/plugin.json`
- Create: `gemini-extension.json`

**Interfaces:**
- Consumes: existing package identity `agent-language-policy` and skill path `skills/human-decision-language/`.
- Produces: consistent release identity version `0.1.0`, license `Apache-2.0`, repository URL, and three host compatibility manifests.

- [ ] **Step 1: Write failing metadata and manifest tests**

Extend `test/standards.test.mjs` with assertions that `package.json`, `plugin.json`, `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and `gemini-extension.json` agree on name/version/description; package metadata includes `license`, `repository`, `homepage`, `bugs`, `keywords`, and `publishConfig.access`; root `plugin.json` uses fixed root-directory discovery without a `skills` property; the Codex compatibility manifest references `./skills/`; the Claude and Gemini manifests rely on their documented root `skills/` discovery; `LICENSE` starts with `Apache License`; and `NOTICE` contains the approved copyright line.

- [ ] **Step 2: Run the targeted test and verify it fails**

Run: `node --test test/standards.test.mjs`

Expected: FAIL because Apache-2.0 metadata and compatibility manifests do not exist.

- [ ] **Step 3: Implement release identity files**

Use the official Apache License 2.0 text, create `NOTICE`, remove `private`, keep version `0.1.0`, add complete npm metadata, enrich the portable root manifest, and create minimal host manifests. Do not add tools, hooks, MCP servers, or permissions.

- [ ] **Step 4: Run the targeted test and verify it passes**

Run: `node --test test/standards.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add LICENSE NOTICE package.json plugin.json .codex-plugin/plugin.json .claude-plugin/plugin.json gemini-extension.json test/standards.test.mjs
git commit -m "chore: prepare release metadata and licensing"
```

### Task 2: Traditional Chinese profile and policy rendering

**Files:**
- Create: `policy/profiles/zh-TW.json`
- Modify: `src/profiles.mjs`
- Modify: `src/cli.mjs`
- Modify: `test/config.test.mjs`
- Modify: `test/policy-renderer.test.mjs`
- Modify: `test/standards.test.mjs`

**Interfaces:**
- Consumes: `loadLanguageProfile(locale)` and `resolveConfiguration(options)`.
- Produces: `SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'ko-KR']` and a `zh-TW` profile with the same policy fields as the existing profiles.

- [ ] **Step 1: Write failing profile, configuration, and rendering tests**

Add tests asserting `resolveConfiguration({ cliLocale: 'zh-TW' })` succeeds; `loadLanguageProfile('zh-TW')` returns `languageName: '繁體中文'`; `renderManagedPolicy(profile)` contains `人類決策語言`, `繁體中文`, and unchanged technical examples; and all three profiles expose identical required fields.

- [ ] **Step 2: Run targeted tests and verify they fail**

Run: `node --test test/config.test.mjs test/policy-renderer.test.mjs test/standards.test.mjs`

Expected: FAIL with `Unsupported target language: zh-TW` or missing profile.

- [ ] **Step 3: Add the `zh-TW` profile and locale registration**

Create the Traditional Chinese rules using Taiwan terminology, add `zh-TW` to `SUPPORTED_LOCALES`, and update CLI help and doctor output to list all three locales.

- [ ] **Step 4: Run targeted tests and verify they pass**

Run: `node --test test/config.test.mjs test/policy-renderer.test.mjs test/standards.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add policy/profiles/zh-TW.json src/profiles.mjs src/cli.mjs test/config.test.mjs test/policy-renderer.test.mjs test/standards.test.mjs
git commit -m "feat: add Traditional Chinese policy profile"
```

### Task 3: Traditional Chinese variant validation

**Files:**
- Modify: `src/language-validator.mjs`
- Modify: `src/cli.mjs`
- Modify: `test/language-validator.test.mjs`
- Modify: `test/cli.test.mjs`
- Create: `test/fixtures/zh-TW-valid.md`
- Create: `test/fixtures/zh-TW-simplified.md`
- Create: `test/fixtures/zh-TW-warning.md`

**Interfaces:**
- Consumes: `extractHumanProse(markdown)`.
- Produces: `validateDocumentLanguage(markdown, locale)` with backward-compatible fields plus `failureReason`, `warnings`, and `variantEvidence: { simplifiedCharacters, traditionalCharacters }`.

- [ ] **Step 1: Write failing Traditional Chinese validation tests**

Add tests for four cases: Traditional prose passes without warnings; simplified-dominant prose returns `valid: false` and `failureReason: 'variant-mismatch'`; one suspicious simplified-only character returns `valid: true` with a warning; and shared-Han prose with at least four Han characters passes without a variant failure. Add a CLI test that warning output uses exit code `0` and failure output uses exit code `1`.

- [ ] **Step 2: Run targeted tests and verify they fail**

Run: `node --test test/language-validator.test.mjs test/cli.test.mjs`

Expected: FAIL because `zh-TW` has no validator rule or variant result fields.

- [ ] **Step 3: Implement deterministic variant evidence**

Use explicit, documented sets of common simplified-only and traditional-only characters. A simplified count of at least four that is more than twice the traditional count is a variant mismatch; a smaller nonzero simplified count produces a warning; no variant-specific evidence leaves the Han-script result unchanged. Keep the existing minimum Han and target-ratio rules.

- [ ] **Step 4: Surface warnings and failure reasons in the CLI**

On a valid result with warnings, write a warning to `stderr` and return `0`. On a variant mismatch, include `variant-mismatch` in the error and return `1`.

- [ ] **Step 5: Run targeted tests and verify they pass**

Run: `node --test test/language-validator.test.mjs test/cli.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/language-validator.mjs src/cli.mjs test/language-validator.test.mjs test/cli.test.mjs test/fixtures/zh-TW-valid.md test/fixtures/zh-TW-simplified.md test/fixtures/zh-TW-warning.md
git commit -m "feat: validate Traditional Chinese document variants"
```

### Task 4: Self-contained portable Skill

**Files:**
- Modify: `skills/human-decision-language/SKILL.md`
- Modify: `skills/human-decision-language/references/content-classification.md`
- Modify: `skills/human-decision-language/references/precedence.md`
- Create: `skills/human-decision-language/references/languages/zh-CN.md`
- Create: `skills/human-decision-language/references/languages/zh-TW.md`
- Create: `skills/human-decision-language/references/languages/ko-KR.md`
- Modify: `test/standards.test.mjs`

**Interfaces:**
- Consumes: the three root policy profiles.
- Produces: a standalone Skill that resolves target language deterministically and can load a matching bundled language reference without accessing files outside the skill root.

- [ ] **Step 1: Write failing Skill structure and synchronization tests**

Assert valid frontmatter types and limits, name/directory equality, no `allowed-tools`, all relative links exist, all three language references exist, and each reference contains the corresponding profile's `decisionRule`, `technicalRule`, `projectRule`, and `approvalRule`.

- [ ] **Step 2: Run the targeted test and verify it fails**

Run: `node --test test/standards.test.mjs`

Expected: FAIL because language references and configuration resolution instructions are absent.

- [ ] **Step 3: Rewrite the Skill around observable configuration resolution**

Describe the exact precedence from the design, require loading the selected language reference, state the output contract, preserve technical literals, and define behavior when configuration is missing. Keep the main file concise and use only one-level relative references.

- [ ] **Step 4: Add synchronized language reference files**

Each reference contains its locale, display name, four policy rules, and a short approval checklist. Do not add executable scripts or pre-approved tools.

- [ ] **Step 5: Run the targeted test and verify it passes**

Run: `node --test test/standards.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add skills/human-decision-language test/standards.test.mjs
git commit -m "feat: make the language policy skill self-contained"
```

### Task 5: Public-installation documentation

**Files:**
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Create: `README.zh-TW.md`
- Modify: `README.ko-KR.md`
- Modify: `package.json`
- Create: `CHANGELOG.md`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Rename: `docs/superpowers/plans/2026-11-09-agent-language-policy-mvp.md` to `docs/superpowers/plans/2026-11-09-agent-language-policy-initial-release.md`
- Modify: `docs/superpowers/specs/2026-11-09-agent-language-policy-design.md`
- Modify: `test/standards.test.mjs`

**Interfaces:**
- Consumes: final CLI commands, supported locales, compatibility manifests, and Apache identity.
- Produces: one English default README, three synchronized localized alternatives, contributor/security guidance, and current documentation free of MVP positioning.

- [ ] **Step 1: Write failing documentation completeness tests**

Assert all four READMEs link to each other, list exactly three locales and five agents, include local-source installation plus status/validate/uninstall examples, mark npm and marketplace distribution as not yet published, and appear in `package.json.files`. Assert current Markdown files outside historical changelog context contain no case-insensitive standalone `MVP` token.

- [ ] **Step 2: Run the targeted test and verify it fails**

Run: `node --test test/standards.test.mjs`

Expected: FAIL because `README.zh-TW.md` and release documents do not exist and current documents contain MVP wording.

- [ ] **Step 3: Rewrite and synchronize the four READMEs**

Use the same section order: purpose, policy boundary, support matrix, install from source, configure, install persistent policy, validate, status/uninstall, Skill installation locations, limitations, development, license. Do not present npm or marketplace commands as available releases.

- [ ] **Step 4: Add project governance documents**

Create Keep-a-Changelog-style `CHANGELOG.md`, contribution setup and English-commit rules in `CONTRIBUTING.md`, and GitHub Private Vulnerability Reporting instructions in `SECURITY.md`. Do not add a public email or behavior code.

- [ ] **Step 5: Rename and revise current planning documents**

Rename the old plan file, update its title and product wording, and revise the original design document without rewriting Git history.

- [ ] **Step 6: Run the targeted test and verify it passes**

Run: `node --test test/standards.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add README.md README.zh-CN.md README.zh-TW.md README.ko-KR.md CHANGELOG.md CONTRIBUTING.md SECURITY.md package.json docs/superpowers test/standards.test.mjs
git commit -m "docs: prepare public installation guidance"
```

### Task 6: Release verification and CI

**Files:**
- Modify: `package.json`
- Modify: `scripts/verify.mjs`
- Create: `scripts/verify-package.mjs`
- Modify: `test/verify-script.test.mjs`
- Create: `test/package-verification.test.mjs`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: release metadata, manifests, Skill resources, language profiles, and package file allowlist.
- Produces: `npm run verify`, `npm run verify:package`, and `npm run verify:release`; `prepack` invokes only non-recursive `npm run verify`.

- [ ] **Step 1: Write failing verification tests**

Assert the verification script checks all manifests and all three profiles; package verification runs `npm pack --dry-run --json --ignore-scripts`, rejects undeclared or missing required files, and never invokes itself through `prepack`; CI contains Windows, macOS, Linux and Node.js 20/22 entries.

- [ ] **Step 2: Run targeted tests and verify they fail**

Run: `node --test test/verify-script.test.mjs test/package-verification.test.mjs`

Expected: FAIL because package verification and CI do not exist.

- [ ] **Step 3: Implement deterministic release verification**

Keep `verify.mjs` responsible for static structure plus tests. Put tarball inspection in `verify-package.mjs`. Define `verify:release` as sequential static and package verification, and set `prepack` to static verification only.

- [ ] **Step 4: Add the cross-platform CI matrix**

Use `actions/checkout` and `actions/setup-node`, run `npm install` without adding dependencies, then run `npm run verify:release`. Do not add publish permissions or release triggers.

- [ ] **Step 5: Run targeted tests and release verification**

Run: `node --test test/verify-script.test.mjs test/package-verification.test.mjs`

Run: `npm run verify:release`

Expected: all tests pass and the tarball contains only approved files.

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/verify.mjs scripts/verify-package.mjs test/verify-script.test.mjs test/package-verification.test.mjs .github/workflows/ci.yml
git commit -m "ci: add release verification workflow"
```

### Task 7: End-to-end release candidate verification

**Files:**
- Modify: `test/integration.test.mjs`
- Modify: `test/cli.test.mjs`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: all release candidate behavior from Tasks 1-6.
- Produces: a tested three-locale lifecycle and a verified private release candidate on `origin/main`.

- [ ] **Step 1: Add the failing three-locale lifecycle test**

Extend integration coverage to configure `zh-TW`, install it for a file-based agent, assert Traditional policy text, switch to `ko-KR`, validate a Traditional fixture explicitly with `--language zh-TW`, and uninstall without changing pre-existing content.

- [ ] **Step 2: Run the integration test and verify it fails if coverage is incomplete**

Run: `node --test test/integration.test.mjs test/cli.test.mjs`

Expected: FAIL until all new output and lifecycle expectations are implemented.

- [ ] **Step 3: Complete only the behavior exposed by the integration test**

Update CLI output or fixture handling as needed without changing the approved installation architecture. Record the release candidate changes under `0.1.0` in `CHANGELOG.md`.

- [ ] **Step 4: Run all verification gates**

Run: `npm test`

Run: `npm run verify:release`

Run: `git diff --check`

Expected: all tests pass, package verification passes, and no whitespace errors remain.

- [ ] **Step 5: Commit final integration coverage**

```bash
git add test/integration.test.mjs test/cli.test.mjs CHANGELOG.md
git commit -m "test: verify the public release candidate"
```

- [ ] **Step 6: Review and push**

Run a whole-branch code review, resolve findings with tests, confirm `git status --short` is empty, and push `main` to `origin/main`. Do not publish the package or change repository visibility.
