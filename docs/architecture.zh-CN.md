# 架构

Agent Language Policy 将可移植 Skill、常驻指令和文档校验组合在一起。这些机制解决不同的可靠性问题，也可以独立使用。

## 四层架构

### 1. 可移植 Skill

位置：`skills/human-decision-language/`

该 Skill 定义哪些面向人类的软件开发内容使用选定语言、哪些技术字面量保持不变，以及如何解决相互冲突的语言指令。兼容 Agent Skills 的宿主会在相关场景或显式调用时加载它。

该 Skill 是自包含的：它的语言参考和内容分类规则都位于 Skill 目录内。安装它不会安装策略 CLI、写入 Agent 常驻指令、创建配置或启用 Markdown 校验。

### 2. 语言配置文件

位置：`policy/profiles/` 和 `src/configuration/`

JSON 配置文件是 `zh-CN`、`zh-TW` 和 `ko-KR` 的规范机器可读规则。配置模块负责解析命令行、项目、用户和默认设置，加载语言配置文件，并生成对应的常驻指令文本。

自动化测试保证每个配置文件与可移植 Skill 内随附的对应语言参考保持同步。

### 3. 常驻指令部署

位置：`src/installation/`

安装模块将每个受支持的 Agent 映射到其原生指令文件，管理隔离的标记区块，在修改现有文件前创建备份，并且只删除工具自身管理的内容。常驻指令的覆盖范围比按需加载的 Skill 更广，因为 Agent 会将其作为常规项目或用户上下文的一部分读取。

### 4. 文档校验

位置：`src/validation/`

校验器提取 Markdown 中的说明性正文，同时排除代码块、行内字面量、URL 和托管注释。它检查配置的目标语言，并对繁体中文执行额外的启发式变体检查。

校验是自然语言指令的补充；它无法保证每一条对话回复都遵循策略。

## 编排

位置：`src/cli/`

CLI 连接配置、安装和校验功能，提供 `configure`、`install`、`status`、`doctor`、`validate` 和 `uninstall` 命令。可执行入口是 `bin/agent-language-policy.mjs`。

CLI 负责的是编排，而不是第五个策略层：它不会定义语言规则的另一份副本。

## 数据流

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
