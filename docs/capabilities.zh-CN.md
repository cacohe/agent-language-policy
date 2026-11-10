# 核心能力与使用方式

Agent Language Policy 交付三项面向用户的核心能力，并通过一套 CLI 统一管理配置、安装、状态、校验和卸载。`plugin.json`、各宿主兼容清单和 `package.json` 负责安装与分发，本身不提供语言控制能力。

当前支持简体中文（`zh-CN`）、繁体中文（`zh-TW`）和韩文（`ko-KR`），支持 Codex、Claude Code、Cursor、Gemini CLI 和 GitHub Copilot。

## 可移植语言策略 Skill

核心文件：`skills/human-decision-language/SKILL.md`

该 Skill 规定：

- 设计方案、实施计划、审查结论、进度说明、风险和审批请求等人类决策内容使用目标语言。
- 代码、命令、路径、API、类型名、函数名、依赖名和原始错误保持英文或原文。
- README、代码注释、commit message、PR 等项目内容继续遵循项目约定。
- 用户对当前输出明确指定的语言优先于其他配置。

拥有仓库访问权限时，可通过社区 `skills` CLI 安装：

```bash
npx skills add cacohe/agent-language-policy --skill human-decision-language
```

安装后，兼容 Agent Skills 的 Agent 可以根据 Skill 的 `description` 自动加载，也可以在请求中明确指定：

```text
Use the human-decision-language skill for this development task.
```

该命令只安装 Skill，不安装项目 CLI，不写入 Agent 常驻指令，也不启用 Markdown 校验。Skill 是否自动加载由宿主 Agent 决定，因此不能保证每个开发任务都会自动应用。

## Agent 常驻语言指令

常驻指令将简短语言策略写入 Agent 的原生项目或用户指令文件。Agent 会把这些文件作为常规上下文读取，因此它比按需加载的 Skill 覆盖更稳定。

| Agent | 项目级文件 | 用户级文件 |
| --- | --- | --- |
| Codex | `AGENTS.md` | `~/.codex/AGENTS.md` |
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` |
| Cursor | `.cursor/rules/agent-language-policy.mdc` | 在 Cursor Settings 的 User Rules 中手动配置 |
| Gemini CLI | `GEMINI.md` | `~/.gemini/GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | `~/.copilot/copilot-instructions.md` |

npm 包尚未发布，目前需要从可信的源码检出版本运行 CLI：

```bash
git clone https://github.com/cacohe/agent-language-policy.git /path/to/agent-language-policy
cd /path/to/agent-language-policy
npm test
cd /path/to/your-project
```

先预览，再正式安装：

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-CN --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-CN
```

可选参数：

- `--agent`：`codex`、`claude-code`、`cursor`、`gemini-cli` 或 `github-copilot`。
- `--scope`：`project` 只影响当前项目，`user` 作为个人跨项目设置。
- `--language`：`zh-CN`、`zh-TW` 或 `ko-KR`。

安装器只管理带专用标记的区块，保留原有指令内容，修改已有文件前创建备份，重复安装时更新同一区块，卸载时只删除工具管理的内容。它不会授予工具或 shell 权限。

## Markdown 文档语言校验

校验器检查落盘的 Markdown 设计、计划、审查、决策和风险文档是否使用目标语言：

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs validate docs/plans/feature.md --language zh-CN
```

校验时会排除围栏代码块、行内代码、URL 和工具管理注释，因此允许中文说明与英文技术字面量组合：

```markdown
使用 `UserService.createUser()` 创建用户。

运行 `npm test` 验证实现。
```

校验成功时返回退出码 `0`；不符合目标语言时返回非零退出码，可以接入 CI。繁体中文还会执行启发式繁简体特征检查。

校验器不能判断方案内容是否正确，不能检查尚未写入文件的对话回复，也不能完全理解所有中英文混合语义。

## 配置和生命周期管理 CLI

CLI 是上述能力的控制入口，而不是新的语言策略层。入口文件是 `bin/agent-language-policy.mjs`。

查看支持范围：

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs doctor
```

保存项目默认语言：

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs configure --scope project --language zh-CN
```

项目配置写入 `.agent-language-policy.yaml`：

```yaml
version: 1
target_language: zh-CN
```

语言解析顺序为：命令行 `--language`、项目配置、用户配置、默认 `zh-CN`。

查看常驻指令状态：

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs status --agent codex --scope project
```

可能的状态包括 `present`、`absent` 和 `malformed`。

卸载前预览并确认：

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

`install` 只安装常驻指令，不安装 portable Skill；`npx skills add` 也只安装 Skill，不安装 CLI 或常驻指令。两条流程需要分别执行。

## 推荐使用组合

| 使用方式 | 组成 | 适用场景 |
| --- | --- | --- |
| 最轻量 | 只安装 portable Skill | 试用、偶尔使用或宿主能够可靠加载 Skill |
| 个人默认 | 用户级常驻指令 | 希望同一 Agent 下的所有项目默认使用目标语言 |
| 团队项目 | 项目级常驻指令和 `.agent-language-policy.yaml` | 将语言策略作为项目约定提交到仓库 |
| 完整模式 | portable Skill、常驻指令和 Markdown 校验 | 同时需要完整语义、稳定覆盖和落盘文档检查 |

完整模式中，Skill 提供内容分类和语言边界，常驻指令提高每次任务的覆盖率，校验器检查最终写入仓库的 Markdown 文档。
