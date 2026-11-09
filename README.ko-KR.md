# Agent Language Policy

[English](README.md) | [简体中文](README.zh-CN.md) | 한국어

코딩 에이전트가 설계, 계획, 위험 및 결론을 개발자가 실제로 검토할 수 있는 언어로 설명하도록 하면서 코드, 명령어, 경로, API, 식별자, 로그 및 원본 오류는 그대로 유지합니다.

현재 MVP는 다음을 지원합니다.

- 중국어 간체: `zh-CN`
- 한국어: `ko-KR`
- Codex, Claude Code, Cursor, Gemini CLI 및 GitHub Copilot
- 프로젝트 수준 및 사용자 수준 설정

## 정책 범위

- 사람의 의사결정에 필요한 내용은 설정된 대상 언어를 사용합니다.
- 기술 리터럴은 영어 또는 원문을 유지합니다.
- README, 제품 문서, UI 문구, 코드 주석, commit message, PR 내용 및 공개 API 문서는 프로젝트 규칙과 대상 독자를 따릅니다.
- Cursor 프로젝트 규칙은 자동으로 설치할 수 있지만 Cursor 사용자 규칙은 `Cursor Settings > Rules > User Rules`에 복사해야 합니다.
- 자연어 지시만으로 수학적인 100% 준수를 보장할 수는 없습니다. 문서 검증기는 저장소에 작성된 계획 및 설계 문서를 추가로 검사합니다.

## 사용법

도움말 보기:

```bash
node bin/agent-language-policy.mjs --help
```

Codex 프로젝트에 적용할 한국어 정책 미리 보기:

```bash
node bin/agent-language-policy.mjs install \
  --agent codex \
  --scope project \
  --language ko-KR \
  --dry-run
```

실제로 설치하려면 `--dry-run`을 제거합니다. 중국어 간체는 `--language zh-CN`을 사용합니다.

구현 계획 검증:

```bash
node bin/agent-language-policy.mjs validate docs/plans/feature.md --language ko-KR
```

제거 명령은 이 도구가 관리하는 블록만 삭제합니다.

```bash
node bin/agent-language-policy.mjs uninstall --agent codex --scope project
```

## 개발

```bash
npm test
npm run verify
```

