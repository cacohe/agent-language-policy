---
name: human-decision-language
description: Apply the configured target language to human-facing software development decisions, explanations, plans, designs, reviews, and approval requests while preserving technical literals and project-owned language conventions.
license: MIT
compatibility: Works with Agent Skills-compatible coding agents.
metadata:
  version: "0.1.0"
---

# Human Decision Language

Apply the configured language policy whenever software-development work produces content whose primary purpose is human understanding, evaluation, approval, rejection, or control.

Read [content classification](references/content-classification.md) before deciding which language governs an artifact. Read [precedence](references/precedence.md) when instructions, project conventions, or template language conflict.

Before requesting approval of a design, architecture, specification, or implementation plan, verify that its explanatory prose uses the configured target language. Preserve source code and technical literals exactly. The language of a Skill or template does not determine the natural language of its human-facing result.
