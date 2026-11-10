import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('runtime modules are grouped by function', async () => {
  const sourceRoot = new URL('../src/', import.meta.url);
  const expected = {
    cli: ['cli.mjs'],
    configuration: ['config.mjs', 'policy-renderer.mjs', 'profiles.mjs'],
    installation: ['adapters.mjs', 'installer.mjs', 'managed-block.mjs'],
    validation: ['language-validator.mjs', 'markdown-prose.mjs'],
  };
  const rootEntries = await readdir(sourceRoot, { withFileTypes: true });

  assert.deepEqual(rootEntries.filter((entry) => entry.isFile()).map((entry) => entry.name), []);
  assert.deepEqual(rootEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(), Object.keys(expected).sort());
  for (const [directory, files] of Object.entries(expected)) {
    assert.deepEqual((await readdir(new URL(`${directory}/`, sourceRoot))).sort(), files.sort());
  }
});

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
  for (const locale of ['zh-CN', 'zh-TW', 'ko-KR']) {
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

test('portable skill is self-contained and synchronized with language profiles', async () => {
  const skillUrl = new URL('../skills/human-decision-language/SKILL.md', import.meta.url);
  const skill = await readFile(skillUrl, 'utf8');
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const name = frontmatter?.[1].match(/^name:\s*(.+)$/m)?.[1];
  const description = frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1];

  assert.equal(name, basename(fileURLToPath(new URL('.', skillUrl))));
  assert.ok(description.length >= 1 && description.length <= 1024);
  assert.doesNotMatch(frontmatter[1], /^license:/m);
  assert.doesNotMatch(frontmatter[1], /^metadata:/m);
  assert.doesNotMatch(frontmatter[1], /^allowed-tools:/m);
  assert.match(skill, /\.agent-language-policy\.yaml/);

  for (const locale of ['zh-CN', 'zh-TW', 'ko-KR']) {
    const referencePath = `references/${locale}.md`;
    assert.match(skill, new RegExp(referencePath.replaceAll('/', '\\/')));
    const reference = await readFile(new URL(`../skills/human-decision-language/${referencePath}`, import.meta.url), 'utf8');
    const profile = await readJson(new URL(`../policy/profiles/${locale}.json`, import.meta.url));

    assert.match(reference, new RegExp(`locale: ${locale}`));
    for (const field of ['decisionRule', 'technicalRule', 'projectRule', 'approvalRule']) {
      assert.ok(reference.includes(profile[field]), `${referencePath} must include ${field}`);
    }
  }

  const links = [...skill.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  assert.ok(links.length >= 5);
  for (const link of links) {
    assert.equal(link.startsWith('../'), false, `Skill link must stay inside its root: ${link}`);
    await readFile(new URL(`../skills/human-decision-language/${link}`, import.meta.url), 'utf8');
  }
});

test('package ships synchronized public installation documentation', async () => {
  const packageJson = await readJson(new URL('../package.json', import.meta.url));
  const readmeRequirements = {
    'README.md': /installs only the portable Skill/i,
    'README.zh-CN.md': /只安装.*portable Skill/,
    'README.zh-TW.md': /只安裝.*portable Skill/,
    'README.ko-KR.md': /portable Skill.*만 설치/,
  };
  const readmes = await Promise.all(Object.keys(readmeRequirements)
    .map(async (path) => [path, await readFile(new URL(`../${path}`, import.meta.url), 'utf8')]));

  for (const [path, readme] of readmes) {
    for (const label of ['English', '简体中文', '繁體中文', '한국어']) {
      assert.match(readme, new RegExp(label), `${path} must link all README languages`);
    }
    for (const locale of ['zh-CN', 'zh-TW', 'ko-KR']) {
      assert.match(readme, new RegExp(locale), `${path} must list ${locale}`);
    }
    for (const agent of ['Codex', 'Claude Code', 'Cursor', 'Gemini CLI', 'GitHub Copilot']) {
      assert.match(readme, new RegExp(agent), `${path} must document ${agent}`);
    }
    for (const command of ['install', 'status', 'validate', 'uninstall']) {
      assert.match(readme, new RegExp(`agent-language-policy\\.mjs ${command}`), `${path} must document ${command}`);
    }
    assert.match(readme, /cd \/path\/to\/your-project/, `${path} must change to the target project`);
    assert.match(readme, /node \/path\/to\/agent-language-policy\/bin\/agent-language-policy\.mjs install/, `${path} must invoke the checkout from the target project`);
    assert.match(readme, /npx skills add cacohe\/agent-language-policy --skill human-decision-language/);
    assert.match(readme, readmeRequirements[path], `${path} must explain the Skill-only boundary`);
    const architecturePath = path === 'README.zh-CN.md' ? 'docs/architecture.zh-CN.md' : 'docs/architecture.md';
    assert.match(readme, new RegExp(architecturePath.replaceAll('.', '\\.')));
    for (const directory of ['skills/', 'policy/', 'src/cli/', 'src/configuration/', 'src/installation/', 'src/validation/', 'bin/', 'scripts/', 'test/', '.github/workflows/']) {
      assert.match(readme, new RegExp(directory.replaceAll('.', '\\.').replaceAll('/', '\\/')), `${path} must map ${directory}`);
    }
    assert.match(readme, /https:\/\/github\.com\/cacohe\/agent-language-policy\/issues/);
    assert.doesNotMatch(readme, /CONTRIBUTING\.md/);
    assert.match(readme, /npm[^\n]*(not yet published|尚未发布|尚未發佈|아직 게시되지)/i);
    assert.match(readme, /(marketplace|市场|市集|마켓플레이스)[^\n]*(not yet published|尚未发布|尚未發佈|아직 게시되지)/i);
  }

  for (const path of ['README.zh-CN.md', 'README.zh-TW.md', 'README.ko-KR.md', 'CHANGELOG.md', 'SECURITY.md', 'docs/architecture.md', 'docs/architecture.zh-CN.md', 'docs/capabilities.zh-CN.md']) {
    assert.ok(packageJson.files.includes(path), `package must include ${path}`);
  }
  assert.equal(packageJson.files.includes('CONTRIBUTING.md'), false);
  await readFile(new URL('../docs/architecture.md', import.meta.url), 'utf8');
  await readFile(new URL('../docs/architecture.zh-CN.md', import.meta.url), 'utf8');
  const capabilities = await readFile(new URL('../docs/capabilities.zh-CN.md', import.meta.url), 'utf8');
  assert.match(readmes.find(([path]) => path === 'README.zh-CN.md')[1], /docs\/capabilities\.zh-CN\.md/);
  for (const heading of ['可移植语言策略 Skill', 'Agent 常驻语言指令', 'Markdown 文档语言校验', '配置和生命周期管理 CLI', '推荐使用组合']) {
    assert.match(capabilities, new RegExp(`^## ${heading}$`, 'm'));
  }
  await assert.rejects(readFile(new URL('../CONTRIBUTING.md', import.meta.url), 'utf8'), /ENOENT/);

  const security = await readFile(new URL('../SECURITY.md', import.meta.url), 'utf8');
  assert.match(security, /Private Vulnerability Reporting/);
  assert.doesNotMatch(security, /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
});

test('Chinese architecture documentation mirrors the English document structure', async () => {
  const english = await readFile(new URL('../docs/architecture.md', import.meta.url), 'utf8');
  const chinese = await readFile(new URL('../docs/architecture.zh-CN.md', import.meta.url), 'utf8');
  const headings = (document) => document.match(/^#{1,6} .+$/gm) ?? [];
  const codeBlocks = (document) => document.match(/```[\s\S]*?```/g) ?? [];

  assert.equal(headings(chinese).length, headings(english).length);
  assert.deepEqual(codeBlocks(chinese), codeBlocks(english));

  for (const literal of ['skills/human-decision-language/', 'policy/profiles/', 'src/configuration/', 'src/installation/', 'src/validation/', 'src/cli/', 'bin/agent-language-policy.mjs']) {
    assert.ok(english.includes(literal), `English architecture must include ${literal}`);
    assert.ok(chinese.includes(literal), `Chinese architecture must include ${literal}`);
  }
});

test('architecture documents exclude installation paths and repository mapping', async () => {
  for (const path of ['docs/architecture.md', 'docs/architecture.zh-CN.md']) {
    const document = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.doesNotMatch(document, /npx skills add/);
    assert.doesNotMatch(document, /^## (Two installation paths|Repository map|两条安装路径|仓库目录映射)$/m);
    assert.doesNotMatch(document, /^\| (Path|路径) \|/m);
  }
});

test('current public documents avoid provisional product positioning', async () => {
  const paths = [
    'README.md',
    'README.zh-CN.md',
    'README.zh-TW.md',
    'README.ko-KR.md',
    'docs/superpowers/specs/2026-11-09-agent-language-policy-design.md',
    'docs/superpowers/plans/2026-11-09-agent-language-policy-initial-release.md',
  ];

  for (const path of paths) {
    const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.doesNotMatch(content, /\bMVP\b/i, `${path} must not position the project as an MVP`);
  }
});
