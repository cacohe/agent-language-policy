import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runCli } from '../src/cli.mjs';

const sink = { write() {} };

test('configure, install, switch language, and uninstall completes one project workflow', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-e2e-'));
  const dependencies = { stdout: sink, stderr: sink, cwd: projectDir, homeDir: projectDir, configDir: join(projectDir, '.config') };

  assert.equal(await runCli(['configure', '--scope', 'project', '--language', 'zh-CN'], dependencies), 0);
  assert.equal(await runCli(['install', '--agent', 'codex', '--scope', 'project'], dependencies), 0);
  let content = await readFile(join(projectDir, 'AGENTS.md'), 'utf8');
  assert.match(content, /简体中文/);

  assert.equal(await runCli(['configure', '--scope', 'project', '--language', 'ko-KR'], dependencies), 0);
  assert.equal(await runCli(['install', '--agent', 'codex', '--scope', 'project'], dependencies), 0);
  content = await readFile(join(projectDir, 'AGENTS.md'), 'utf8');
  assert.match(content, /한국어/);
  assert.doesNotMatch(content, /简体中文/);
  assert.equal(content.match(/agent-language-policy:start/g)?.length, 1);

  assert.equal(await runCli(['uninstall', '--agent', 'codex', '--scope', 'project'], dependencies), 0);
  content = await readFile(join(projectDir, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(content, /agent-language-policy/);
});
