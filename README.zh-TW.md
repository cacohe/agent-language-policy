# Agent Language Policy

[English](README.md) | [简体中文](README.zh-CN.md) | 繁體中文 | [한국어](README.ko-KR.md)

讓編碼 Agent 使用開發者能真正審閱的語言說明設計、計畫、風險與結論，同時保留程式碼、指令、路徑、API、識別碼、日誌和原始錯誤。

## 支援範圍

- 語言：簡體中文（`zh-CN`）、繁體中文（`zh-TW`）和韓文（`ko-KR`），預設為 `zh-CN`。
- Agent：Codex、Claude Code、Cursor、Gemini CLI 和 GitHub Copilot。
- 交付形式：可攜式 Agent Skill、專案或使用者層級常駐指令、CLI 和 Markdown 驗證器。
- 執行環境：Node.js 20 或更新版本，沒有執行階段相依套件。

npm 套件尚未發佈，市集（marketplace）版本也尚未發佈。正式發佈前請從可信任的儲存庫檢出版本安裝。

## 策略邊界

- 設計、計畫、審查、進度、風險與核准請求等人類決策內容使用目標語言。
- 技術字面值保留英文或原文。
- README、產品文件、UI 文案、程式碼註解、commit message、PR、changelog 和公開 API 文件遵循儲存庫及目標讀者慣例。
- 自然語言指令無法保證模型完全遵循；驗證器可額外檢查寫入儲存庫的 Markdown 方案文件。

## 從原始碼安裝

```bash
git clone https://github.com/cacohe/agent-language-policy.git /path/to/agent-language-policy
cd /path/to/agent-language-policy
npm test
cd /path/to/your-project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs doctor
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-TW --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language zh-TW
```

可將 `codex` 替換為 `claude-code`、`cursor`、`gemini-cli` 或 `github-copilot`，目標語言也可改成 `zh-CN` 或 `ko-KR`。Cursor 使用者規則需依 CLI 提示手動設定。

可攜式 Skill 位於 `skills/human-decision-language/`。可將該目錄複製到相容 Agent Skills 的可信任 Skill 目錄，或使用 Agent 的儲存庫安裝功能。若要涵蓋每次開發工作，仍建議同時安裝常駐指令。

## 狀態、驗證與解除安裝

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs status --agent codex --scope project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs validate docs/plans/feature.md --language zh-TW
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

解除安裝只會刪除工具管理的區塊。安裝器修改既有檔案前會建立備份，Skill 也不會預先授權工具或 shell 權限。五種 Agent 的檔案對應均有自動化測試，但尚未經過公開市集上架驗證。

專案政策與歷史請參閱 [CONTRIBUTING.md](CONTRIBUTING.md)、[SECURITY.md](SECURITY.md) 和 [CHANGELOG.md](CHANGELOG.md)。

## 開發

```bash
npm test
npm run verify
```
