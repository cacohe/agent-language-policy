# Agent Language Policy 公开发布准备设计

## 意图

把当前已验证核心能力的仓库整理为可供陌生开发者安装、评估、升级和卸载的开源项目，同时继续保持 GitHub 仓库私有，暂不发布 npm 包。项目采用 Apache License 2.0，新增繁体中文（`zh-TW`），并从当前文档中移除阶段性产品定位措辞。

## 目标

- 以 `cacohe/agent-language-policy` 作为唯一上游仓库，默认分支为 `main`。
- 使用 Apache-2.0，版权声明为 `Copyright 2026 cacohe and contributors`。
- 支持 `zh-CN`、`zh-TW`、`ko-KR`，默认语言仍为 `zh-CN`。
- 保持“标准 Agent Skill + Agent 常驻指令 + CLI + 文档验证器”的混合架构。
- 让 npm 包、标准 Skill 和插件包具备公开发布所需的元数据、文件结构、验证命令和安装文档。
- 为 Codex、Claude Code、GitHub Copilot、Gemini CLI 和 Cursor 提供明确的安装与兼容边界。
- 建立持续集成、变更记录、贡献指南、安全政策和发布检查。
- 所有新提交使用英文提交信息。

## 非目标

- 本阶段不把 GitHub 仓库改为公开。
- 本阶段不向 npm 或 Agent 市场实际发布。
- 不承诺自然语言指令在模型层面百分之百服从。
- 不自动翻译已有代码、README、产品文案或公共 API 文档。
- 不加入遥测、远程服务或账户系统。
- 不重写既有 Git 历史；只保证当前文件和后续文档不再使用阶段性产品定位措辞。

## 已选方案

继续采用混合架构，而不是只依赖 Skill 自动触发，也不为每个 Agent 维护完全独立的策略实现。

### 方案比较

1. **仅标准 Skill**：分发简单，但 Skill 按需加载，无法可靠覆盖所有开发任务，也无法单独保证目标语言配置始终存在。
2. **仅原生常驻指令**：加载稳定，但缺少可进入 Skill 生态的标准包，详细规则会重复散落在不同 Agent 的文件中。
3. **混合架构（采用）**：标准 Skill 提供可移植语义，CLI 把短规则写入 Agent 常驻指令，验证器检查落盘文档。维护成本略高，但同时满足可发现性、持续生效和结果校验。

## 语言模型

统一语言注册表包含三个 BCP 47 标签：

- `zh-CN`：简体中文，默认值。
- `zh-TW`：繁体中文。
- `ko-KR`：韩文。

每个 Profile 保持相同字段，并增加验证器需要的语言族与书写系统信息。`zh-CN` 和 `zh-TW` 都以汉字正文为基础，但繁体中文额外检查常见简繁差异字符；只包含两岸共用字符的短文本不应被误判为失败。验证结果需要区分“语言不匹配”和“可能使用了另一中文变体”。

## Skill 的独立行为

`human-decision-language` 保持单一标准 Skill。Skill 必须说明目标语言解析顺序：

1. 当前用户对本次输出的明确语言要求。
2. 项目级 `.agent-language-policy.yaml`。
3. Agent 常驻指令中已经展开的语言规则。
4. 用户级配置。
5. 默认 `zh-CN`。

Skill 目录内包含三个语言参考文件，避免独立安装后引用 Skill 根目录之外的文件。自动化测试保证这些参考文件与根目录语言 Profile 的规则一致。

## 安装和分发

### npm CLI

包名保持 `agent-language-policy`，移除 `private`，补齐 `license`、`repository`、`homepage`、`bugs`、`keywords` 和 `publishConfig`。`prepack` 必须运行发布验证，`npm pack --dry-run` 必须只包含声明过的运行文件、文档和许可证。

### Agent Skill

仓库继续提供 `skills/human-decision-language/SKILL.md`。文档列出各 Agent 的标准安装目录和显式调用方式。正式验证检查 YAML frontmatter、目录名匹配、字段长度、引用文件存在以及语言参考完整性。

### 插件清单

根 `plugin.json` 声明 `skills: "./skills/"`。为需要原生扩展清单的 Agent 提供最小适配清单；不支持开放 Agent Skills 的环境继续由 CLI 写入原生规则文件。

### CLI 安装语义

CLI 的常驻指令安装仍是默认可靠路径。安装输出必须明确说明：

- 写入了哪个常驻指令文件；
- Skill 是否由当前 Agent 原生发现；
- 是否还有手动步骤；
- 如何查看状态、验证文档和卸载。

本阶段不在用户未确认的目录中复制额外 Skill 文件；标准 Skill 的市场安装与 CLI 常驻策略安装在文档中作为两个互补入口说明。

## 项目文档

- 默认 `README.md` 保持英文。
- 保留 `README.zh-CN.md` 和 `README.ko-KR.md`。
- 新增 `README.zh-TW.md`。
- 三种本地化 README 与英文 README 使用一致的结构、命令和语言导航。
- 新增 `CHANGELOG.md`、`CONTRIBUTING.md` 和 `SECURITY.md`。
- 安全报告使用 GitHub Private Vulnerability Reporting，不公开个人邮箱。
- 本阶段不添加需要私人执法联系方式的行为准则；仓库公开并确定社区联系方式后再补充。
- 重命名现有带阶段性名称的计划文件，并改写其中的标题和表述。
- README 必须区分“发布就绪”和“已经发布”，不得展示尚不可用的 npm 或市场安装命令为已发布能力。

## 验证和持续集成

本地发布检查包含：

- 全量单元和集成测试；
- Skill 结构与引用验证；
- 插件和包元数据验证；
- 三个语言 Profile 的字段一致性；
- 四种 README 的导航与发布清单检查；
- `npm pack --dry-run` 内容检查；
- CLI 安装、切换语言、验证和卸载冒烟测试。

GitHub Actions 在 Windows、macOS 和 Linux 上运行支持的 Node.js 版本矩阵。工作流只运行测试和打包检查，不执行发布。

## 安全和兼容性

- 保持托管区块的幂等更新和精确卸载。
- 修改已有文件前继续创建备份。
- 发布检查不得读取或上传用户配置。
- 文档明确 Skill 和项目指令都属于受信任代码边界。
- 不在 Skill 中预批准 shell 或其他高权限工具。
- 明确列出已验证与仅结构兼容的 Agent 版本，避免笼统承诺。
- `zh-TW` 文档明显以简体字为主时验证失败；只有少量疑似简体字时通过但给出警告；只包含两岸共用汉字时正常通过。

## 完成标准

- Apache-2.0 文件、包元数据和 Skill 元数据一致。
- `zh-TW` 可配置、可渲染、可验证，并完成端到端测试。
- 当前项目文档不再使用阶段性产品定位措辞。
- npm tarball、Skill、插件清单和 CI 均通过验证。
- README 能让陌生用户理解当前能力、安装方式、限制和卸载方法。
- 仓库保持私有，所有改动以英文提交信息提交并推送到 `origin/main`。
