import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  applyInstallation,
  applyRemoval,
  planInstallation,
  planRemoval,
} from '../src/installer.mjs';

test('installation preview does not write and apply preserves existing content with backup', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-install-'));
  const target = join(projectDir, 'AGENTS.md');
  await writeFile(target, '# Existing\n\nKeep this.\n');

  const plan = await planInstallation({ agent: 'codex', scope: 'project', locale: 'zh-CN', projectDir, homeDir: projectDir });
  assert.equal(await readFile(target, 'utf8'), '# Existing\n\nKeep this.\n');
  assert.match(plan.nextContent, /简体中文/);

  await applyInstallation(plan);
  assert.match(await readFile(target, 'utf8'), /^# Existing[\s\S]*简体中文/);
  assert.equal(await readFile(plan.backupPath, 'utf8'), '# Existing\n\nKeep this.\n');
});

test('reinstall is idempotent and removal keeps original user content', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-install-'));
  const request = { agent: 'gemini-cli', scope: 'project', locale: 'ko-KR', projectDir, homeDir: projectDir };

  await applyInstallation(await planInstallation(request));
  const first = await readFile(join(projectDir, 'GEMINI.md'), 'utf8');
  await applyInstallation(await planInstallation(request));
  const second = await readFile(join(projectDir, 'GEMINI.md'), 'utf8');
  assert.equal(first, second);

  await applyRemoval(await planRemoval(request));
  assert.equal(await readFile(join(projectDir, 'GEMINI.md'), 'utf8'), '');
});

test('manual targets return instructions without touching disk', async () => {
  const homeDir = await mkdtemp(join(tmpdir(), 'alp-install-'));
  const plan = await planInstallation({ agent: 'cursor', scope: 'user', locale: 'zh-CN', projectDir: homeDir, homeDir });

  assert.equal(plan.mode, 'manual');
  assert.match(plan.instructions, /Cursor Settings/);
  await applyInstallation(plan);
  await assert.rejects(access(join(homeDir, '.cursor')), /ENOENT/);
});

test('uninstalling a newly created Cursor project rule removes generated frontmatter too', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-install-'));
  const request = { agent: 'cursor', scope: 'project', locale: 'zh-CN', projectDir, homeDir: projectDir };

  await applyInstallation(await planInstallation(request));
  await applyRemoval(await planRemoval(request));

  assert.equal(await readFile(join(projectDir, '.cursor/rules/agent-language-policy.mdc'), 'utf8'), '');
});
