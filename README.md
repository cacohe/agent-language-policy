# Agent Language Policy

让编码 Agent 使用开发者能够真正审阅的语言说明设计、计划、风险和结论，同时保持代码、命令、路径、API、标识符、日志与原始错误不变。

当前 MVP 默认支持：

- 简体中文：`zh-CN`
- 韩文：`ko-KR`
- Codex、Claude Code、Cursor、Gemini CLI、GitHub Copilot
- 项目级和用户级配置

## 设计边界

- 人类决策内容使用目标语言。
- 技术字面量保持英文或原文。
- README、产品文档、UI 文案、代码注释、commit message、PR 内容和公共 API 文档遵循项目约定与目标受众。
- Cursor 项目规则可以自动安装；Cursor 用户规则需要复制到 `Cursor Settings > Rules > User Rules`。
- 自然语言指令不能提供数学意义上的百分之百保证，文档校验器用于补充检查写入仓库的方案文件。

## 使用

查看帮助：

```bash
node bin/agent-language-policy.mjs --help
```

预览 Codex 项目级中文规则：

```bash
node bin/agent-language-policy.mjs install \
  --agent codex \
  --scope project \
  --language zh-CN \
  --dry-run
```

实际安装时删除 `--dry-run`。韩文使用 `--language ko-KR`。

校验实施计划：

```bash
node bin/agent-language-policy.mjs validate docs/plans/feature.md --language zh-CN
```

卸载只删除本工具的托管区块：

```bash
node bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

## 开发

```bash
npm test
npm run verify
```

