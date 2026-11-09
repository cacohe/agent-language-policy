# Agent Language Policy

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | 한국어

개발자가 검토해야 하는 설명은 선택한 언어로 작성하고 코드, 명령어, 경로, API, 식별자, 로그 및 원본 오류는 그대로 유지합니다.

## 지원 범위

- 언어: 중국어 간체(`zh-CN`), 중국어 번체(`zh-TW`), 한국어(`ko-KR`). 기본값은 `zh-CN`입니다.
- 에이전트: Codex, Claude Code, Cursor, Gemini CLI, GitHub Copilot.
- 제공 방식: 이식 가능한 Agent Skill, 프로젝트 또는 사용자 영구 지침, CLI, Markdown 검증기.
- 런타임: Node.js 20 이상, 런타임 의존성 없음.

npm 패키지는 아직 게시되지 않았습니다. 마켓플레이스 패키지도 아직 게시되지 않았습니다. 공식 릴리스 전에는 신뢰할 수 있는 저장소 체크아웃에서 설치하세요.

## 정책 범위

- 설계, 계획, 검토, 진행 상황, 위험 및 승인 요청과 같은 사람의 의사결정 내용은 설정 언어를 사용합니다.
- 기술 리터럴은 영어 또는 원문을 유지합니다.
- README, 제품 문서, UI 문구, 코드 주석, commit message, PR, changelog 및 공개 API 문서는 저장소와 대상 독자 규칙을 따릅니다.
- 자연어 지시만으로 완벽한 준수를 보장할 수 없으므로 저장소의 Markdown 문서는 검증기로 추가 확인할 수 있습니다.

## 소스에서 설치

```bash
git clone https://github.com/cacohe/agent-language-policy.git
cd agent-language-policy
npm test
node bin/agent-language-policy.mjs doctor
node bin/agent-language-policy.mjs install --agent codex --scope project --language ko-KR --dry-run
node bin/agent-language-policy.mjs install --agent codex --scope project --language ko-KR
```

`codex` 대신 `claude-code`, `cursor`, `gemini-cli`, `github-copilot`을 사용할 수 있고 언어는 `zh-CN` 또는 `zh-TW`로 바꿀 수 있습니다. Cursor 사용자 규칙은 CLI가 안내하는 수동 설정이 필요합니다.

이식 가능한 Skill은 `skills/human-decision-language/`에 있습니다. Agent Skills 호환 호스트의 신뢰할 수 있는 Skill 디렉터리에 복사하거나 호스트의 저장소 설치 기능을 사용하세요. 모든 개발 작업에 적용하려면 영구 지침도 함께 설치하는 것이 좋습니다.

## 상태, 검증 및 제거

```bash
node bin/agent-language-policy.mjs status --agent codex --scope project
node bin/agent-language-policy.mjs validate docs/plans/feature.md --language ko-KR
node bin/agent-language-policy.mjs uninstall --agent codex --scope project --dry-run
node bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

제거 시 도구가 관리하는 블록만 삭제합니다. 설치 프로그램은 기존 파일 변경 전에 백업을 만들고 Skill은 도구나 shell 권한을 사전 승인하지 않습니다. 다섯 에이전트의 파일 매핑은 자동화 테스트로 검증하지만 공개 마켓플레이스 등록은 아직 검증하지 않았습니다.

프로젝트 정책과 기록은 [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [CHANGELOG.md](CHANGELOG.md)를 참조하세요.

## 개발

```bash
npm test
npm run verify
```
