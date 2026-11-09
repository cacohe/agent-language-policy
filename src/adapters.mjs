import { join } from 'node:path';

const SUPPORTED_AGENTS = Object.freeze([
  'codex',
  'claude-code',
  'cursor',
  'gemini-cli',
  'github-copilot',
]);

export function getInstructionTarget(agent, scope, { homeDir, projectDir }) {
  if (!SUPPORTED_AGENTS.includes(agent)) throw new Error(`Unsupported agent: ${agent}`);
  if (!['project', 'user'].includes(scope)) throw new Error(`Unsupported scope: ${scope}`);

  if (scope === 'project') {
    const relativePaths = {
      codex: 'AGENTS.md',
      'claude-code': 'CLAUDE.md',
      cursor: '.cursor/rules/agent-language-policy.mdc',
      'gemini-cli': 'GEMINI.md',
      'github-copilot': '.github/copilot-instructions.md',
    };
    return {
      mode: 'file',
      path: join(projectDir, relativePaths[agent]),
      format: agent === 'cursor' ? 'mdc' : 'markdown',
    };
  }

  if (agent === 'cursor') {
    return {
      mode: 'manual',
      location: 'Cursor Settings > Rules > User Rules',
    };
  }

  const relativePaths = {
    codex: '.codex/AGENTS.md',
    'claude-code': '.claude/CLAUDE.md',
    'gemini-cli': '.gemini/GEMINI.md',
    'github-copilot': '.copilot/copilot-instructions.md',
  };
  return { mode: 'file', path: join(homeDir, relativePaths[agent]), format: 'markdown' };
}

export { SUPPORTED_AGENTS };

