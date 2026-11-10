import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const npmCache = await mkdtemp(join(tmpdir(), 'agent-language-policy-npm-'));

try {
  const npmArgs = ['pack', '--dry-run', '--json', '--ignore-scripts'];
  const command = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm.cmd', ...npmArgs] : npmArgs;
  const result = spawnSync(command, commandArgs, {
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: npmCache },
  });

  if (result.status !== 0) {
    throw new Error(result.stderr ?? String(result.error ?? 'npm pack failed'));
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    throw new Error(`npm pack did not return JSON: ${result.stdout}`);
  }

  const files = report[0]?.files?.map(({ path }) => path.replaceAll('\\', '/')) ?? [];
  if (files.length === 0) throw new Error('npm pack returned an empty file list');

  const declared = packageJson.files.map((path) => path.replaceAll('\\', '/'));
  const isAllowed = (path) => path === 'package.json' || declared.some((entry) => (
    entry.endsWith('/') ? path.startsWith(entry) : path === entry
  ));

  const unexpected = files.filter((path) => !isAllowed(path));
  if (unexpected.length > 0) throw new Error(`Unexpected package files: ${unexpected.join(', ')}`);

  const required = [
    'package.json',
    'LICENSE',
    'NOTICE',
    'README.md',
    'README.zh-CN.md',
    'README.zh-TW.md',
    'README.ko-KR.md',
    'CHANGELOG.md',
    'SECURITY.md',
    'docs/architecture.md',
    'docs/architecture.zh-CN.md',
    'plugin.json',
    '.codex-plugin/plugin.json',
    '.claude-plugin/plugin.json',
    'gemini-extension.json',
    'bin/agent-language-policy.mjs',
    'policy/profiles/zh-CN.json',
    'policy/profiles/zh-TW.json',
    'policy/profiles/ko-KR.json',
    'skills/human-decision-language/SKILL.md',
  ];
  const missing = required.filter((path) => !files.includes(path));
  if (missing.length > 0) throw new Error(`Missing required package files: ${missing.join(', ')}`);

  console.log(`Package contents verified (${files.length} files).`);
} finally {
  await rm(npmCache, { recursive: true, force: true });
}
