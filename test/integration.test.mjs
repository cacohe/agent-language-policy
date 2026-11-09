import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { runCli } from '../src/cli/cli.mjs';

const sink = { write() {} };

test('configure, install, switch language, validate, and uninstall completes a three-locale workflow', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-e2e-'));
  const dependencies = { stdout: sink, stderr: sink, cwd: projectDir, homeDir: projectDir, configDir: join(projectDir, '.config') };
  const instructionPath = join(projectDir, 'AGENTS.md');
  const originalContent = '# Existing project instructions\n\nKeep this content.\n';
  await writeFile(instructionPath, originalContent);

  assert.equal(await runCli(['configure', '--scope', 'project', '--language', 'zh-TW'], dependencies), 0);
  assert.equal(await runCli(['install', '--agent', 'codex', '--scope', 'project'], dependencies), 0);
  let content = await readFile(instructionPath, 'utf8');
  assert.match(content, /繁體中文/);
  assert.match(content, /Keep this content/);

  assert.equal(await runCli(['configure', '--scope', 'project', '--language', 'ko-KR'], dependencies), 0);
  assert.equal(await runCli(['install', '--agent', 'codex', '--scope', 'project'], dependencies), 0);
  content = await readFile(instructionPath, 'utf8');
  assert.match(content, /한국어/);
  assert.doesNotMatch(content, /繁體中文/);
  assert.equal(content.match(/agent-language-policy:start/g)?.length, 1);

  const fixture = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'zh-TW-valid.md');
  assert.equal(await runCli(['validate', fixture, '--language', 'zh-TW'], dependencies), 0);

  assert.equal(await runCli(['uninstall', '--agent', 'codex', '--scope', 'project'], dependencies), 0);
  content = await readFile(instructionPath, 'utf8');
  assert.doesNotMatch(content, /agent-language-policy/);
  assert.equal(content, originalContent);
});
