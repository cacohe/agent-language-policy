import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { resolveConfiguration } from '../src/configuration/config.mjs';

test('command line locale overrides project and user configuration', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'alp-config-'));
  const userConfigPath = join(directory, 'user.yaml');
  const projectConfigPath = join(directory, 'project.yaml');
  await writeFile(userConfigPath, 'target_language: ko-KR\n');
  await writeFile(projectConfigPath, 'target_language: zh-CN\n');

  const result = await resolveConfiguration({
    cliLocale: 'ko-KR',
    projectConfigPath,
    userConfigPath,
  });

  assert.deepEqual(result, { locale: 'ko-KR', source: 'cli' });
});

test('project configuration overrides user configuration', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'alp-config-'));
  const userConfigPath = join(directory, 'user.yaml');
  const projectConfigPath = join(directory, 'project.yaml');
  await writeFile(userConfigPath, 'target_language: ko-KR\n');
  await writeFile(projectConfigPath, 'target_language: zh-CN\n');

  const result = await resolveConfiguration({ projectConfigPath, userConfigPath });

  assert.deepEqual(result, { locale: 'zh-CN', source: 'project' });
});

test('configuration rejects unsupported locales', async () => {
  await assert.rejects(
    resolveConfiguration({ cliLocale: 'fr-FR' }),
    /Unsupported target language: fr-FR/,
  );
});

test('configuration accepts Traditional Chinese from the command line', async () => {
  const result = await resolveConfiguration({ cliLocale: 'zh-TW' });

  assert.deepEqual(result, { locale: 'zh-TW', source: 'cli' });
});
