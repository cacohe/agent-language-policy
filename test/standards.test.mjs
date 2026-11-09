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
