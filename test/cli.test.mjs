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
  assert.match(stdout.value(), /zh-CN, zh-TW, ko-KR/);
});

test('doctor lists all supported languages', async () => {
  const stdout = capture();
  const code = await runCli(['doctor'], {
    stdout,
    stderr: capture(),
    cwd: process.cwd(),
    homeDir: process.cwd(),
  });

  assert.equal(code, 0);
  assert.match(stdout.value(), /zh-CN, zh-TW, ko-KR/);
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

test('installation output explains coverage and next lifecycle commands', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-cli-'));
  const stdout = capture();
  const code = await runCli([
    'install', '--agent', 'codex', '--scope', 'project', '--language', 'zh-TW',
  ], { stdout, stderr: capture(), cwd: projectDir, homeDir: projectDir });

  assert.equal(code, 0);
  assert.match(stdout.value(), /AGENTS\.md/);
  assert.match(stdout.value(), /Persistent instruction: installed/);
  assert.match(stdout.value(), /Portable Skill: separate installation/);
  assert.match(stdout.value(), /status --agent codex --scope project/);
  assert.match(stdout.value(), /validate <file> --language zh-TW/);
  assert.match(stdout.value(), /uninstall --agent codex --scope project/);
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

test('validate warns without failing for limited simplified evidence in Traditional Chinese', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-cli-'));
  const documentPath = join(projectDir, 'plan.md');
  await writeFile(documentPath, '# 實作計畫\n\n这份實作計畫說明系統架構、資料流程與風險。\n');
  const stderr = capture();

  const code = await runCli(['validate', documentPath, '--language', 'zh-TW'], {
    stdout: capture(), stderr, cwd: projectDir, homeDir: projectDir,
  });

  assert.equal(code, 0);
  assert.match(stderr.value(), /possible-simplified-chinese/);
});

test('validate reports a variant mismatch for simplified-dominant Traditional Chinese', async () => {
  const projectDir = await mkdtemp(join(tmpdir(), 'alp-cli-'));
  const documentPath = join(projectDir, 'plan.md');
  await writeFile(documentPath, '# 实施计划\n\n这个实现计划说明系统架构、数据流程、风险以及后续维护方式。\n');
  const stderr = capture();

  const code = await runCli(['validate', documentPath, '--language', 'zh-TW'], {
    stdout: capture(), stderr, cwd: projectDir, homeDir: projectDir,
  });

  assert.equal(code, 1);
  assert.match(stderr.value(), /variant-mismatch/);
});
