---
name: human-decision-language
description: Use during software-development work that produces plans, designs, reviews, approval requests, progress updates, or other human-facing decision content that must follow a configured language while technical literals and project-owned conventions remain unchanged.
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# Human Decision Language

Apply this policy whenever software-development work produces content whose primary purpose is human understanding, evaluation, approval, rejection, or control.

## Resolve the target language

Resolve the language in this order:

1. The user's explicit language instruction for the current output.
2. `target_language` in the nearest project `.agent-language-policy.yaml`.
3. A language rule already expanded in the active Agent instruction file.
4. The user's Agent Language Policy configuration, when available.
5. `zh-CN` as the default.

Supported values are [Simplified Chinese (`zh-CN`)](references/zh-CN.md), [Traditional Chinese (`zh-TW`)](references/zh-TW.md), and [Korean (`ko-KR`)](references/ko-KR.md). Read the selected language reference before producing human decision content. If an explicit configuration names another value, stop and report that it is unsupported instead of guessing.

## Apply the policy

Read [content classification](references/content-classification.md) before deciding which language governs an artifact. Read [language precedence](references/precedence.md) when instructions, project conventions, or template language conflict.

- Write human decision content in the resolved target language.
- Preserve source code and technical literals exactly.
- Apply user instructions, repository conventions, and intended audience rules to project-owned content.
- Do not infer that an English Skill, template, or tool response requires English explanatory prose.

Before requesting approval of a design, architecture, specification, or implementation plan, verify that its explanatory prose uses the configured target language. Preserve source code and technical literals exactly. The language of a Skill or template does not determine the natural language of its human-facing result.
