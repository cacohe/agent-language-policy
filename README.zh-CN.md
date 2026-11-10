# Agent Language Policy

[English](README.md) | 简体中文 | [繁體中文](README.zh-TW.md) | [한국어](README.ko-KR.md)

让编码 Agent 使用开发者能够真正审阅的语言说明设计、计划、风险和结论，同时保持代码、命令、路径、API、标识符、日志与原始错误不变。

## 支持范围

- 语言：简体中文（`zh-CN`）、繁体中文（`zh-TW`）和韩文（`ko-KR`），默认使用 `zh-CN`。
- Agent：Codex、Claude Code、Cursor、Gemini CLI 和 GitHub Copilot。
- 交付形式：可移植 Agent Skill、项目级或用户级常驻指令、CLI 和 Markdown 校验器。
- 运行环境：Node.js 20 或更高版本，无运行时依赖。

npm 包尚未发布，市场（marketplace）版本也尚未发布。正式发布前请从可信的仓库检出版本安装。

## 安装 portable Skill

拥有仓库访问权限时，可以使用社区 `skills` CLI 把 `human-decision-language` 安装到支持的 Agent：

```bash
npx skills add cacohe/agent-language-policy --skill human-decision-language
```

该命令只安装 portable Skill，不安装常驻指令，不创建配置，也不提供 Markdown 校验器。如需这些能力，请按照下文说明从源码单独安装策略 CLI。

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

## 仓库目录

| 路径 | 职责 |
| --- | --- |
| `skills/` | 可移植 Agent Skills 及其自包含参考资料 |
| `policy/` | CLI 使用的规范语言数据 |
| `src/cli/` | 命令解析与编排 |
| `src/configuration/` | 配置解析、语言配置加载和策略生成 |
| `src/installation/` | Agent 适配器和托管区块生命周期 |
| `src/validation/` | Markdown 正文提取和语言校验 |
| `bin/` | 可执行入口 |
| `scripts/` | 静态校验和软件包发布校验 |
| `test/` | 单元测试、集成测试、结构测试和软件包测试 |
| `.github/workflows/` | 跨平台持续集成 |

## 查看、校验和卸载

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs status --agent codex --scope project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs validate docs/plans/feature.md --language zh-CN
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

卸载只删除工具管理的区块。安装器修改已有文件前会创建备份，且 Skill 不预授权工具或 shell 权限。五种 Agent 的文件映射均有自动化测试，但尚未通过公开市场上架验证。

设计、项目政策和历史见[架构说明](docs/architecture.zh-CN.md)、[SECURITY.md](SECURITY.md) 和 [CHANGELOG.md](CHANGELOG.md)。普通问题请提交到 [GitHub Issues](https://github.com/cacohe/agent-language-policy/issues)，安全漏洞请按 `SECURITY.md` 中的私密流程报告。

## 开发

```bash
npm test
npm run verify
```
