import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repository = join(dirname(fileURLToPath(import.meta.url)), '..');

test('package verification inspects a dry-run tarball without lifecycle recursion', async () => {
  const packageJson = JSON.parse(await readFile(join(repository, 'package.json'), 'utf8'));
  const source = await readFile(join(repository, 'scripts/verify-package.mjs'), 'utf8');
  const result = spawnSync(process.execPath, ['scripts/verify-package.mjs'], {
    cwd: repository,
    encoding: 'utf8',
  });

  assert.equal(packageJson.scripts.prepack, 'npm run verify -- --skip-tests');
  assert.equal(packageJson.scripts['verify:package'], 'node scripts/verify-package.mjs');
  assert.equal(packageJson.scripts['verify:release'], 'npm run verify && npm run verify:package');
  assert.match(source, /npm[^\n]*pack/);
  assert.match(source, /--dry-run/);
  assert.match(source, /--ignore-scripts/);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Package contents verified/);
});

test('CI verifies the release matrix without publishing', async () => {
  const workflow = await readFile(join(repository, '.github/workflows/ci.yml'), 'utf8');

  for (const os of ['ubuntu-latest', 'windows-latest', 'macos-latest']) assert.match(workflow, new RegExp(os));
  assert.match(workflow, /node-version:\s*\[20, 22\]/);
  assert.match(workflow, /npm run verify:release/);
  assert.doesNotMatch(workflow, /cache:\s*npm/, 'setup-node npm caching requires a committed lockfile');
  assert.doesNotMatch(workflow, /npm publish|contents:\s*write|id-token:\s*write/);
});
