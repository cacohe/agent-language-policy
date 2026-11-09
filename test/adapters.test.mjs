import assert from 'node:assert/strict';
import { join } from 'node:path';
import test from 'node:test';

import { getInstructionTarget } from '../src/adapters.mjs';

const environment = { homeDir: '/home/dev', projectDir: '/work/repo' };

test('maps project instruction files for five supported agents', () => {
  assert.equal(getInstructionTarget('codex', 'project', environment).path, join('/work/repo', 'AGENTS.md'));
  assert.equal(getInstructionTarget('claude-code', 'project', environment).path, join('/work/repo', 'CLAUDE.md'));
  assert.equal(getInstructionTarget('cursor', 'project', environment).path, join('/work/repo', '.cursor/rules/agent-language-policy.mdc'));
  assert.equal(getInstructionTarget('gemini-cli', 'project', environment).path, join('/work/repo', 'GEMINI.md'));
  assert.equal(getInstructionTarget('github-copilot', 'project', environment).path, join('/work/repo', '.github/copilot-instructions.md'));
});

test('maps supported user instruction files and exposes Cursor manual setup', () => {
  assert.equal(getInstructionTarget('codex', 'user', environment).path, join('/home/dev', '.codex/AGENTS.md'));
  assert.equal(getInstructionTarget('claude-code', 'user', environment).path, join('/home/dev', '.claude/CLAUDE.md'));
  assert.equal(getInstructionTarget('gemini-cli', 'user', environment).path, join('/home/dev', '.gemini/GEMINI.md'));
  assert.equal(getInstructionTarget('github-copilot', 'user', environment).path, join('/home/dev', '.copilot/copilot-instructions.md'));

  const cursor = getInstructionTarget('cursor', 'user', environment);
  assert.equal(cursor.mode, 'manual');
  assert.equal(cursor.location, 'Cursor Settings > Rules > User Rules');
});

test('rejects unknown agents and scopes', () => {
  assert.throws(() => getInstructionTarget('unknown', 'project', environment), /Unsupported agent/);
  assert.throws(() => getInstructionTarget('codex', 'organization', environment), /Unsupported scope/);
});

