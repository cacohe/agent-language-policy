# Agent Language Policy

[English](README.md) | 简体中文 | [繁體中文](README.zh-TW.md) | [한국어](README.ko-KR.md)

让编码 Agent 使用开发者能够真正审阅的语言说明设计、计划、风险和结论，同时保持代码、命令、路径、API、标识符、日志与原始错误不变。

## 支持范围

- 语言：简体中文（`zh-CN`）、繁体中文（`zh-TW`）和韩文（`ko-KR`），默认使用 `zh-CN`。
- Agent：Codex、Claude Code、Cursor、Gemini CLI 和 GitHub Copilot。
- 交付形式：可移植 Agent Skill、项目级或用户级常驻指令、CLI 和 Markdown 校验器。
- 运行环境：Node.js 20 或更高版本，无运行时依赖。

npm 包尚未发布，市场（marketplace）版本也尚未发布。正式发布前请从可信的仓库检出版本安装。

## 策略边界

- 设计、计划、审查、进度、风险和审批请求等人类决策内容使用目标语言。
- 技术字面量保持英文或原文。
- README、产品文档、UI 文案、代码注释、commit message、PR、changelog 和公共 API 文档遵循仓库与目标受众约定。
- 自然语言指令无法保证模型百分之百服从；校验器可补充检查写入仓库的 Markdown 方案文档。

## 从源码安装

```bash
git clone https://github.com/cacohe/agent-language-policy.git /path/to/agent-language-policy
cd /path/to/agent-language-policy
npm test
cd /path/to/your-project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs doctor
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-CN --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-CN
```

可将 `codex` 替换为 `claude-code`、`cursor`、`gemini-cli` 或 `github-copilot`；目标语言可改为 `zh-TW` 或 `ko-KR`。Cursor 用户级规则需按 CLI 输出手动设置。

可移植 Skill 位于 `skills/human-decision-language/`。可将该目录复制到兼容 Agent Skills 的可信 Skill 目录，或使用 Agent 提供的仓库安装能力。为覆盖每次开发任务，仍建议同时安装常驻指令。

## 查看、校验和卸载

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs status --agent codex --scope project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs validate docs/plans/feature.md --language zh-CN
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

卸载只删除工具管理的区块。安装器修改已有文件前会创建备份，且 Skill 不预授权工具或 shell 权限。五种 Agent 的文件映射均有自动化测试，但尚未通过公开市场上架验证。

项目政策与历史见 [CONTRIBUTING.md](CONTRIBUTING.md)、[SECURITY.md](SECURITY.md) 和 [CHANGELOG.md](CHANGELOG.md)。

## 开发

```bash
npm test
npm run verify
```
