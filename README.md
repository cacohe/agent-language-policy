# Agent Language Policy

English | [简体中文](README.zh-CN.md) | [한국어](README.ko-KR.md)

Help coding agents explain designs, plans, risks, and conclusions in a language developers can genuinely review, while preserving code, commands, paths, APIs, identifiers, logs, and original errors.

The current MVP supports:

- Simplified Chinese: `zh-CN`
- Korean: `ko-KR`
- Codex, Claude Code, Cursor, Gemini CLI, and GitHub Copilot
- Project-level and user-level configuration

## Policy boundaries

- Human decision content uses the configured target language.
- Technical literals stay in English or their original language.
- README files, product documentation, UI copy, code comments, commit messages, pull request content, and public API documentation follow project conventions and the intended audience.
- Cursor project rules can be installed automatically; Cursor user rules must be copied into `Cursor Settings > Rules > User Rules`.
- Natural-language instructions cannot provide a mathematical 100% guarantee. The document validator supplements them by checking plans and design documents written to the repository.

## Usage

Show help:

```bash
node bin/agent-language-policy.mjs --help
```

Preview a project-level Simplified Chinese policy for Codex:

```bash
node bin/agent-language-policy.mjs install \
  --agent codex \
  --scope project \
  --language zh-CN \
  --dry-run
```

Remove `--dry-run` to install the policy. Use `--language ko-KR` for Korean.

Validate an implementation plan:

```bash
node bin/agent-language-policy.mjs validate docs/plans/feature.md --language zh-CN
```

Uninstalling removes only the block managed by this tool:

```bash
node bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

## Development

```bash
npm test
npm run verify
```
