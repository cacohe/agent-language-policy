import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'plugin.json',
  'skills/human-decision-language/SKILL.md',
  'policy/profiles/zh-CN.json',
  'policy/profiles/ko-KR.json',
  'bin/agent-language-policy.mjs',
];

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) throw new Error(`Node.js 20 or newer is required; found ${process.versions.node}`);

for (const path of requiredFiles) await access(path);

const plugin = JSON.parse(await readFile('plugin.json', 'utf8'));
if (plugin.name !== 'agent-language-policy') throw new Error('plugin.json has an unexpected name');

for (const locale of ['zh-CN', 'ko-KR']) {
  const profile = JSON.parse(await readFile(`policy/profiles/${locale}.json`, 'utf8'));
  if (profile.locale !== locale) throw new Error(`Profile locale mismatch: ${locale}`);
}

const skill = await readFile('skills/human-decision-language/SKILL.md', 'utf8');
if (!skill.startsWith('---\n') && !skill.startsWith('---\r\n')) {
  throw new Error('SKILL.md is missing frontmatter');
}

if (!process.argv.includes('--skip-tests')) {
  const result = spawnSync(process.execPath, ['--test'], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('Package verification passed.');
