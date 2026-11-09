# Architecture

Agent Language Policy combines a portable Skill with persistent instructions and document validation. These mechanisms solve different reliability problems and can be used independently.

## Four layers

### 1. Portable Skill

Location: `skills/human-decision-language/`

The Skill defines which human-facing software-development content uses the selected language, which technical literals remain unchanged, and how conflicting language instructions are resolved. Agent Skills-compatible hosts load it when relevant or when explicitly invoked.

The Skill is self-contained: its language references and content-classification rules stay inside the Skill directory. Installing it does not install the policy CLI, write persistent Agent instructions, create configuration, or enable Markdown validation.

### 2. Language profiles

Locations: `policy/profiles/` and `src/configuration/`

The JSON profiles are the canonical machine-readable rules for `zh-CN`, `zh-TW`, and `ko-KR`. The configuration modules resolve command-line, project, user, and default settings, load a profile, and render its persistent instruction text.

Automated tests keep each profile synchronized with the matching language reference shipped inside the portable Skill.

### 3. Persistent instruction deployment

Location: `src/installation/`

The installation modules map each supported Agent to its native instruction file, manage an isolated marked block, create backups before changing existing files, and remove only tool-owned content. Persistent instructions provide broader coverage than an on-demand Skill because the Agent reads them with its normal project or user context.

### 4. Document validation

Location: `src/validation/`

The validator extracts explanatory Markdown prose while excluding code blocks, inline literals, URLs, and managed comments. It checks the configured target language and applies additional heuristic variant checks for Traditional Chinese.

Validation supplements natural-language instructions; it cannot guarantee that every conversational response follows the policy.

## Orchestration

Location: `src/cli/`

The CLI connects configuration, installation, and validation. It provides `configure`, `install`, `status`, `doctor`, `validate`, and `uninstall`. The executable entry point is `bin/agent-language-policy.mjs`.

The CLI is orchestration rather than a fifth policy layer: it does not define another copy of the language rules.

## Data flow

```text
policy/profiles/<locale>.json
        |
        v
src/configuration/  --->  src/installation/  --->  Agent instruction file
        |                         |
        |                         v
        +----------------->  src/cli/
                                  |
                                  v
                           src/validation/

skills/human-decision-language/ is independently installable and carries
the same human-facing policy for Agent Skills-compatible hosts.
```

## Two installation paths

`npx skills add` is a third-party cross-Agent installer for portable Skills. For this repository it copies only `skills/human-decision-language/` into the selected Agent's Skill location:

```bash
npx skills add cacohe/agent-language-policy --skill human-decision-language
```

The project CLI manages persistent instructions, configuration, status, validation, and removal. After a future npm publication it can be run as `npx agent-language-policy`; until then, run `bin/agent-language-policy.mjs` from a trusted checkout.

Installing one path does not silently install the other. Users who want both portable discovery and persistent coverage must install both components.

## Repository map

| Path | Responsibility |
| --- | --- |
| `skills/` | Portable Agent Skills and their self-contained references |
| `policy/` | Canonical language data shipped with the CLI |
| `src/cli/` | Command parsing and orchestration |
| `src/configuration/` | Configuration resolution, profile loading, policy rendering |
| `src/installation/` | Agent adapters and safe managed-block lifecycle |
| `src/validation/` | Markdown prose extraction and language validation |
| `bin/` | Executable entry point |
| `scripts/` | Static and package-release verification |
| `test/` | Unit, integration, structure, and package tests |
| `.github/workflows/` | Cross-platform continuous integration |

Host-specific manifests remain at their required conventional locations: `plugin.json`, `.codex-plugin/`, `.claude-plugin/`, and `gemini-extension.json`.
