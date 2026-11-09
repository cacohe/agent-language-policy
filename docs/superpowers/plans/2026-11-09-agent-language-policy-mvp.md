# Agent Language Policy MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个支持简体中文和韩文的跨编码 Agent 语言策略 MVP，包含标准 Skill、常驻指令安装器和 Markdown 文档校验器。

**Architecture:** 以统一配置和语言配置文件为事实来源，核心 Skill 提供可移植语义，Node.js CLI 将生成的托管规则写入各 Agent 原生指令文件。校验器只分析 Markdown 的人类说明正文，并排除代码与技术字面量。

**Tech Stack:** Node.js 20+ ESM、`node:test`、`node:util.parseArgs`、Agent Skills、Agent Plugins。

**Spec:** `docs/superpowers/specs/2026-11-09-agent-language-policy-design.md`

## Global Constraints

- 默认语言仅为 `zh-CN` 和 `ko-KR`，但语言注册表必须可扩展。
- 运行时代码首版不使用第三方依赖。
- 所有文件修改使用可识别托管区块，必须幂等且可安全卸载。
- 不翻译代码、命令、路径、API、标识符、日志和原始错误。
- 项目拥有的内容继承用户、项目和受众约定。
- 人类可审阅的设计与实施说明使用简体中文。

## Review Focus

- 已存在同名托管区块但内容损坏时必须安全报错，不得覆盖文件。
- Windows 和 POSIX 换行符不得导致重复安装或卸载失败。
- Markdown 中的大量英文代码、路径和 API 不得造成中文或韩文文档误判。
- 项目级配置必须覆盖用户级配置，但当前命令行语言参数优先级最高。
- Agent 指令文件不存在、为空或已有用户内容时，安装和卸载都必须保持内容完整。

---

### Task 1: 仓库与标准 Skill 基础

**Files:** `package.json`, `plugin.json`, `skills/human-decision-language/**`, `policy/profiles/*.json`, `test/standards.test.mjs`

**Interfaces:** 产出可由安装器读取的语言配置，以及可独立安装的标准 Agent Skill。

- [x] 编写标准结构与语言配置失败测试并确认失败。
- [x] 创建最小 Skill、插件清单和中韩语言配置。
- [x] 运行测试并确认通过。

### Task 2: 配置解析和语言策略生成

**Files:** `src/config.mjs`, `src/profiles.mjs`, `src/policy-renderer.mjs`, `test/config.test.mjs`, `test/policy-renderer.test.mjs`

**Interfaces:** 产出 `resolveConfiguration(options)`、`loadLanguageProfile(locale)`、`renderManagedPolicy(profile)`。

- [x] 编写配置优先级和中韩规则渲染失败测试并确认失败。
- [x] 实现最小配置解析和策略渲染。
- [x] 运行测试并确认通过。

### Task 3: 幂等托管区块编辑器

**Files:** `src/managed-block.mjs`, `test/managed-block.test.mjs`

**Interfaces:** 产出 `upsertManagedBlock(text, block)`、`removeManagedBlock(text)`、`inspectManagedBlock(text)`。

- [x] 编写新增、更新、重复安装、损坏区块和卸载失败测试并确认失败。
- [x] 实现严格且幂等的托管区块编辑器。
- [x] 运行完整测试并确认通过。

### Task 4: Agent 适配器和安装服务

**Files:** `src/adapters.mjs`, `src/installer.mjs`, `test/adapters.test.mjs`, `test/installer.test.mjs`

**Interfaces:** 产出 `getInstructionTargets(agent, scope, environment)`、`planInstallation(request)`、`applyInstallation(plan)`、`removeInstallation(plan)`。

- [x] 编写五个 Agent 路径、预览、备份、安装和卸载失败测试并确认失败。
- [x] 实现项目级和用户级适配器及文件操作服务。
- [x] 运行完整测试并确认通过。

### Task 5: Markdown 语言校验器

**Files:** `src/markdown-prose.mjs`, `src/language-validator.mjs`, `test/markdown-prose.test.mjs`, `test/language-validator.test.mjs`, `test/fixtures/*.md`

**Interfaces:** 产出 `extractHumanProse(markdown)`、`validateDocumentLanguage(markdown, locale)`。

- [x] 编写代码块排除、中韩正文通过和英文正文失败测试并确认失败。
- [x] 实现 Markdown 说明文本提取和语言特征校验。
- [x] 运行完整测试并确认通过。

### Task 6: CLI、诊断与用户文档

**Files:** `bin/agent-language-policy.mjs`, `src/cli.mjs`, `test/cli.test.mjs`, `README.md`, `LICENSE`

**Interfaces:** 产出 `install`、`configure`、`status`、`doctor`、`validate`、`uninstall` 命令。

- [x] 编写 CLI 帮助、预览和错误码失败测试并确认失败。
- [x] 实现最小 CLI 和中文使用说明。
- [x] 运行完整测试并确认通过。

### Task 7: 完整验证和打包检查

**Files:** `scripts/verify.mjs`, `test/integration.test.mjs`

**Interfaces:** 产出可重复执行的 `npm test` 和 `npm run verify`。

- [ ] 编写临时目录安装、更新、切换语言和卸载集成测试并确认失败。
- [ ] 补齐最小集成逻辑和打包检查。
- [ ] 运行 `npm test`、`npm run verify` 和 CLI 冒烟测试。
