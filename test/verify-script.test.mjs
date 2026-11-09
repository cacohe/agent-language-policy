import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

test('verification script checks the package without recursively running itself', () => {
  const repository = join(dirname(fileURLToPath(import.meta.url)), '..');
  const result = spawnSync(process.execPath, ['scripts/verify.mjs', '--skip-tests'], {
    cwd: repository,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Package verification passed/);
});

test('verification script covers every release manifest and language profile', async () => {
  const repository = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(repository, 'scripts/verify.mjs'), 'utf8');

  for (const path of ['plugin.json', '.codex-plugin/plugin.json', '.claude-plugin/plugin.json', 'gemini-extension.json']) {
    assert.match(source, new RegExp(path.replaceAll('.', '\\.').replaceAll('/', '\\/')));
  }
  for (const locale of ['zh-CN', 'zh-TW', 'ko-KR']) assert.match(source, new RegExp(locale));
});
