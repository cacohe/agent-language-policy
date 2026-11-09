import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runCli } from '../src/cli.mjs';

function capture() {
  let value = '';
  return { write: (chunk) => { value += chunk; }, value: () => value };
}

test('help lists the supported workflow commands', async () => {
  const stdout = capture();
  const code = await runCli(['--help'], { stdout, stderr: capture(), cwd: process.cwd(), homeDir: process.cwd() });

  assert.equal(code, 0);
  assert.match(stdout.value(), /install/);
  assert.match(stdout.value(), /validate/);
  assert.match(stdout.value(), /uninstall/);
});

test('dry-run previews installation without writing the instruction file', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-cli-'));
  const stdout = capture();
  const code = await runCli([
    'install', '--agent', 'codex', '--scope', 'project', '--language', 'zh-CN', '--dry-run',
  ], { stdout, stderr: capture(), cwd: projectDir, homeDir: projectDir });

  assert.equal(code, 0);
  assert.match(stdout.value(), /AGENTS\.md/);
  await assert.rejects(readFile(join(projectDir, 'AGENTS.md')), /ENOENT/);
});

test('validate returns a nonzero code for an English-only Chinese decision document', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-cli-'));
  const documentPath = join(projectDir, 'plan.md');
  await writeFile(documentPath, '# Plan\n\nThis implementation plan is written only in English for reviewers.\n');
  const stderr = capture();

  const code = await runCli(['validate', documentPath, '--language', 'zh-CN'], {
    stdout: capture(), stderr, cwd: projectDir, homeDir: projectDir,
  });

  assert.equal(code, 1);
  assert.match(stderr.value(), /does not match zh-CN/);
});

test('unknown commands return usage error code', async () => {
  const stderr = capture();
  const code = await runCli(['unknown'], { stdout: capture(), stderr, cwd: process.cwd(), homeDir: process.cwd() });

  assert.equal(code, 2);
  assert.match(stderr.value(), /Unknown command/);
});

test('configure rejects unknown scopes instead of writing user configuration', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-cli-'));
  const configDir = join(projectDir, 'config');
  const stderr = capture();

  const code = await runCli(['configure', '--scope', 'organization', '--language', 'zh-CN'], {
    stdout: capture(), stderr, cwd: projectDir, homeDir: projectDir, configDir,
  });

  assert.equal(code, 2);
  assert.match(stderr.value(), /Unsupported scope/);
  await assert.rejects(readFile(join(configDir, 'config.yaml')), /ENOENT/);
});
