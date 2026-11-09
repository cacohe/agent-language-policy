import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('plugin package exposes a portable skills directory', async () => {
  const plugin = await readJson(new URL('../plugin.json', import.meta.url));

  assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(plugin.name, 'agent-language-policy');
  assert.equal(plugin.version, '0.1.0');
});

test('release metadata consistently identifies the package', async () => {
  const packageJson = await readJson(new URL('../package.json', import.meta.url));
  const portable = await readJson(new URL('../plugin.json', import.meta.url));
  const codex = await readJson(new URL('../.codex-plugin/plugin.json', import.meta.url));
  const claude = await readJson(new URL('../.claude-plugin/plugin.json', import.meta.url));
  const gemini = await readJson(new URL('../gemini-extension.json', import.meta.url));

  for (const manifest of [portable, codex, claude, gemini]) {
    assert.equal(manifest.name, packageJson.name);
    assert.equal(manifest.version, packageJson.version);
    assert.equal(manifest.description, packageJson.description);
  }

  assert.equal(packageJson.private, undefined);
  assert.equal(packageJson.license, 'Apache-2.0');
  assert.deepEqual(packageJson.repository, {
    type: 'git',
    url: 'git+https://github.com/cacohe/agent-language-policy.git',
  });
  assert.equal(packageJson.homepage, 'https://github.com/cacohe/agent-language-policy#readme');
  assert.equal(packageJson.bugs.url, 'https://github.com/cacohe/agent-language-policy/issues');
  assert.equal(packageJson.publishConfig.access, 'public');
  assert.ok(packageJson.keywords.includes('agent-skills'));

  assert.equal(portable.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(Object.hasOwn(portable, 'skills'), false);
  assert.equal(portable.license, 'Apache-2.0');
  assert.equal(codex.skills, './skills/');
  assert.equal(Object.hasOwn(claude, 'skills'), false);
  assert.equal(Object.hasOwn(gemini, 'skills'), false);
});

test('release files use Apache-2.0 notices', async () => {
  const license = await readFile(new URL('../LICENSE', import.meta.url), 'utf8');
  const notice = await readFile(new URL('../NOTICE', import.meta.url), 'utf8');

  assert.match(license, /^Apache License\r?\nVersion 2\.0, January 2004/);
  assert.match(notice, /Copyright 2026 cacohe and contributors/);
});

test('language profiles expose the same required policy fields', async () => {
  for (const locale of ['zh-CN', 'ko-KR']) {
    const profile = await readJson(new URL(`../policy/profiles/${locale}.json`, import.meta.url));

    assert.equal(profile.locale, locale);
    assert.equal(typeof profile.languageName, 'string');
    assert.equal(typeof profile.policyTitle, 'string');
    assert.equal(typeof profile.decisionRule, 'string');
    assert.equal(typeof profile.technicalRule, 'string');
    assert.equal(typeof profile.projectRule, 'string');
    assert.equal(typeof profile.approvalRule, 'string');
  }
});

test('portable skill has valid minimum Agent Skills frontmatter', async () => {
  const skill = await readFile(new URL('../skills/human-decision-language/SKILL.md', import.meta.url), 'utf8');
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  assert.ok(frontmatter, 'SKILL.md must start with YAML frontmatter');
  assert.match(frontmatter[1], /^name: human-decision-language$/m);
  assert.match(frontmatter[1], /^description: .+/m);
});

test('package ships English default README with Chinese and Korean alternatives', async () => {
  const packageJson = await readJson(new URL('../package.json', import.meta.url));
  const english = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const chinese = await readFile(new URL('../README.zh-CN.md', import.meta.url), 'utf8');
  const korean = await readFile(new URL('../README.ko-KR.md', import.meta.url), 'utf8');

  assert.match(english, /English \| \[简体中文\]/);
  assert.match(chinese, /\[English\].*简体中文/);
  assert.match(korean, /\[English\].*한국어/);
  assert.ok(packageJson.files.includes('README.zh-CN.md'));
  assert.ok(packageJson.files.includes('README.ko-KR.md'));
});
