import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';

const manifests = [
  'plugin.json',
  '.codex-plugin/plugin.json',
  '.claude-plugin/plugin.json',
  'gemini-extension.json',
];
const locales = ['zh-CN', 'zh-TW', 'ko-KR'];
const requiredFiles = [
  'package.json',
  ...manifests,
  'skills/human-decision-language/SKILL.md',
  ...locales.map((locale) => `skills/human-decision-language/references/${locale}.md`),
  ...locales.map((locale) => `policy/profiles/${locale}.json`),
  'bin/agent-language-policy.mjs',
  'LICENSE',
  'NOTICE',
];

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) throw new Error(`Node.js 20 or newer is required; found ${process.versions.node}`);

for (const path of requiredFiles) await access(path);

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
for (const path of manifests) {
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  for (const field of ['name', 'version', 'description']) {
    if (manifest[field] !== packageJson[field]) throw new Error(`${path} has an unexpected ${field}`);
  }
}

for (const locale of locales) {
  const profile = JSON.parse(await readFile(`policy/profiles/${locale}.json`, 'utf8'));
  if (profile.locale !== locale) throw new Error(`Profile locale mismatch: ${locale}`);
  for (const field of ['languageName', 'policyTitle', 'decisionRule', 'technicalRule', 'projectRule', 'approvalRule']) {
    if (typeof profile[field] !== 'string' || profile[field].length === 0) {
      throw new Error(`Profile ${locale} is missing ${field}`);
    }
  }
}

const skill = await readFile('skills/human-decision-language/SKILL.md', 'utf8');
if (!skill.startsWith('---\n') && !skill.startsWith('---\r\n')) {
  throw new Error('SKILL.md is missing frontmatter');
}
if (/^(license|metadata):/m.test(skill)) {
  throw new Error('SKILL.md frontmatter must contain only the required portable fields');
}

if (!process.argv.includes('--skip-tests')) {
  const result = spawnSync(process.execPath, ['--test'], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('Package verification passed.');
