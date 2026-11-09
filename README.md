# Agent Language Policy

English | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko-KR.md)

Keep the explanations that developers must review in a chosen language while preserving code, commands, paths, APIs, identifiers, logs, and original errors.

## Support

- Languages: Simplified Chinese (`zh-CN`), Traditional Chinese (`zh-TW`), and Korean (`ko-KR`). The default is `zh-CN`.
- Agents: Codex, Claude Code, Cursor, Gemini CLI, and GitHub Copilot.
- Delivery: a portable Agent Skill, persistent project or user instructions, a CLI, and a Markdown validator.
- Runtime: Node.js 20 or later, with no runtime dependencies.

The npm package is not yet published. The marketplace package is not yet published either. Install from a trusted checkout until a release is announced.

## Install the portable Skill

With repository access, the community `skills` CLI can install `human-decision-language` into a supported Agent:

```bash
npx skills add cacohe/agent-language-policy --skill human-decision-language
```

This command installs only the portable Skill. It does not install persistent instructions, create configuration, or provide the Markdown validator. Install the policy CLI separately when you need those capabilities. See [Architecture](docs/architecture.md) for how the two installation paths differ.

## Policy boundaries

- Human decision content—such as designs, plans, reviews, progress updates, risks, and approval requests—uses the configured language.
- Technical literals retain English or their original language.
- Project-owned README files, product documentation, UI copy, code comments, commit messages, pull requests, changelogs, and public API documentation follow repository and audience conventions.
- Natural-language instructions cannot guarantee perfect model compliance. The validator provides an additional check for Markdown artifacts written to the repository.

## Install from source

Clone this repository, verify it, then run the CLI directly:

```bash
git clone https://github.com/cacohe/agent-language-policy.git /path/to/agent-language-policy
cd /path/to/agent-language-policy
npm test
cd /path/to/your-project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs doctor
```

Preview and install a persistent project rule:

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-CN --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-CN
```

Replace `codex` with `claude-code`, `cursor`, `gemini-cli`, or `github-copilot`. Replace `zh-CN` with `zh-TW` or `ko-KR` as needed. Cursor user-level rules require the manual step printed by the CLI.

The portable Skill is in `skills/human-decision-language/`. Copy that directory into an Agent Skills-compatible host's trusted skills directory, or install the repository when the host supports repository-based Skill installation. Persistent instructions remain the recommended coverage mechanism for every development task.

## Operate and remove

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs status --agent codex --scope project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs validate docs/plans/feature.md --language zh-CN
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

Uninstalling removes only the managed block.

## Trust and compatibility

Review the Skill and generated instruction block before installation. The installer creates a backup before changing an existing file and never grants tools or shell permissions. The file mappings for all five Agents are covered by automated tests; marketplace packaging has not yet been verified through a public listing.

See [Architecture](docs/architecture.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md) for design, project policies, and release history. Report ordinary problems through [GitHub Issues](https://github.com/cacohe/agent-language-policy/issues); report vulnerabilities through the private process in `SECURITY.md`.

## Development

```bash
npm test
npm run verify
```
