import assert from 'node:assert/strict';
import test from 'node:test';

import { loadLanguageProfile } from '../src/profiles.mjs';
import { renderManagedPolicy } from '../src/policy-renderer.mjs';

test('renders Chinese human decision policy while preserving English technical examples', async () => {
  const profile = await loadLanguageProfile('zh-CN');
  const result = renderManagedPolicy(profile);

  assert.match(result, /人类决策语言/);
  assert.match(result, /简体中文/);
  assert.match(result, /`createSession\(\)`/);
  assert.match(result, /`ECONNREFUSED`/);
});

test('renders Korean human decision policy while preserving English technical examples', async () => {
  const profile = await loadLanguageProfile('ko-KR');
  const result = renderManagedPolicy(profile);

  assert.match(result, /사람의 의사결정 언어/);
  assert.match(result, /한국어/);
  assert.match(result, /`createSession\(\)`/);
  assert.match(result, /`ECONNREFUSED`/);
});

test('renders Traditional Chinese human decision policy while preserving English technical examples', async () => {
  const profile = await loadLanguageProfile('zh-TW');
  const result = renderManagedPolicy(profile);

  assert.equal(profile.languageName, '繁體中文');
  assert.match(result, /人類決策語言/);
  assert.match(result, /繁體中文/);
  assert.match(result, /`createSession\(\)`/);
  assert.match(result, /`ECONNREFUSED`/);
});
