# Agent Language Policy

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | 한국어

개발자가 검토해야 하는 설명은 선택한 언어로 작성하고 코드, 명령어, 경로, API, 식별자, 로그 및 원본 오류는 그대로 유지합니다.

## 지원 범위

- 언어: 중국어 간체(`zh-CN`), 중국어 번체(`zh-TW`), 한국어(`ko-KR`). 기본값은 `zh-CN`입니다.
- 에이전트: Codex, Claude Code, Cursor, Gemini CLI, GitHub Copilot.
- 제공 방식: 이식 가능한 Agent Skill, 프로젝트 또는 사용자 영구 지침, CLI, Markdown 검증기.
- 런타임: Node.js 20 이상, 런타임 의존성 없음.

npm 패키지가 게시되었습니다: [`agent-language-policy`](https://www.npmjs.com/package/agent-language-policy). portable Skill은 [GitHub `v0.1.0` 릴리스](https://github.com/cacohe/agent-language-policy/releases/tag/v0.1.0)에 포함되어 있습니다. Cursor Marketplace 제출은 검토 중이고 Gemini CLI Gallery 자동 색인은 대기 중이며 OpenAI 및 Claude 디렉터리에는 아직 제출하지 않았습니다.

## portable Skill 설치

커뮤니티 `skills` CLI로 지원되는 Agent에 `human-decision-language`를 설치할 수 있습니다.

```bash
npx skills add cacohe/agent-language-policy --skill human-decision-language
```

이 명령은 portable Skill만 설치합니다. 영구 지침을 설치하거나 설정을 만들거나 Markdown 검증기를 제공하지 않습니다. 이러한 기능이 필요하면 npm 또는 소스에서 정책 CLI를 별도로 사용하세요.

## npm에서 정책 CLI 사용

전역 설치 없이 게시된 CLI를 실행할 수 있습니다.

```bash
npx --yes --package agent-language-policy@latest -- agent-language-policy doctor
npx --yes --package agent-language-policy@latest -- agent-language-policy install --agent codex --scope project --language ko-KR --dry-run
npx --yes --package agent-language-policy@latest -- agent-language-policy install --agent codex --scope project --language ko-KR
```

영구 규칙을 추가할 대상 프로젝트에서 명령을 실행하세요. 필요에 따라 `codex`와 `ko-KR`을 지원되는 다른 Agent 및 언어로 바꿀 수 있습니다.

## 정책 범위

- 설계, 계획, 검토, 진행 상황, 위험 및 승인 요청과 같은 사람의 의사결정 내용은 설정 언어를 사용합니다.
- 기술 리터럴은 영어 또는 원문을 유지합니다.
- README, 제품 문서, UI 문구, 코드 주석, commit message, PR, changelog 및 공개 API 문서는 저장소와 대상 독자 규칙을 따릅니다.
- 자연어 지시만으로 완벽한 준수를 보장할 수 없으므로 저장소의 Markdown 문서는 검증기로 추가 확인할 수 있습니다.

## 소스에서 설치

```bash
git clone https://github.com/cacohe/agent-language-policy.git /path/to/agent-language-policy
cd /path/to/agent-language-policy
npm test
cd /path/to/your-project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs doctor
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language ko-KR --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs install --agent codex --scope project --language ko-KR
```

`codex` 대신 `claude-code`, `cursor`, `gemini-cli`, `github-copilot`을 사용할 수 있고 언어는 `zh-CN` 또는 `zh-TW`로 바꿀 수 있습니다. Cursor 사용자 규칙은 CLI가 안내하는 수동 설정이 필요합니다.

## 저장소 디렉터리

| 경로 | 책임 |
| --- | --- |
| `skills/` | 이식 가능한 Agent Skills 및 자체 포함 참조 자료 |
| `policy/` | CLI가 사용하는 표준 언어 데이터 |
| `src/cli/` | 명령 구문 분석 및 오케스트레이션 |
| `src/configuration/` | 설정 해석, 언어 프로필 로딩 및 정책 렌더링 |
| `src/installation/` | Agent 어댑터 및 관리 블록 수명 주기 |
| `src/validation/` | Markdown 설명문 추출 및 언어 검증 |
| `bin/` | 실행 진입점 |
| `scripts/` | 정적 검증 및 패키지 릴리스 검증 |
| `test/` | 단위, 통합, 구조 및 패키지 테스트 |
| `.github/workflows/` | 크로스 플랫폼 지속적 통합 |

## 상태, 검증 및 제거

```bash
node /path/to/agent-language-policy/bin/agent-language-policy.mjs status --agent codex --scope project
node /path/to/agent-language-policy/bin/agent-language-policy.mjs validate docs/plans/feature.md --language ko-KR
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project --dry-run
node /path/to/agent-language-policy/bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

제거 시 도구가 관리하는 블록만 삭제합니다. 설치 프로그램은 기존 파일 변경 전에 백업을 만들고 Skill은 도구나 shell 권한을 사전 승인하지 않습니다. 다섯 에이전트의 파일 매핑은 자동화 테스트로 검증되며 npm 패키지와 GitHub 릴리스는 공개되어 있습니다. Cursor 검토와 Gemini CLI Gallery 색인은 외부 처리를 기다리고 있으며 OpenAI 및 Claude 디렉터리에는 아직 제출하지 않았습니다.

설계, 프로젝트 정책 및 기록은 [Architecture](docs/architecture.md), [SECURITY.md](SECURITY.md), [CHANGELOG.md](CHANGELOG.md)를 참조하세요. 일반적인 문제는 [GitHub Issues](https://github.com/cacohe/agent-language-policy/issues)에 제출하고 보안 취약점은 `SECURITY.md`의 비공개 절차로 보고하세요.

## 개발

```bash
npm test
npm run verify
```
