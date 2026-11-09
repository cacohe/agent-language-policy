import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { validateDocumentLanguage } from '../src/language-validator.mjs';

const fixture = (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

test('accepts Chinese decision prose with English technical literals', async () => {
  const result = validateDocumentLanguage(await fixture('zh-valid.md'), 'zh-CN');

  assert.equal(result.valid, true);
  assert.ok(result.targetCharacters > result.latinCharacters * 0.25);
});

test('accepts Korean decision prose with English technical literals', async () => {
  const result = validateDocumentLanguage(await fixture('ko-valid.md'), 'ko-KR');

  assert.equal(result.valid, true);
  assert.ok(result.targetCharacters > result.latinCharacters * 0.25);
});

test('rejects English-only decision prose for Chinese and Korean policies', async () => {
  const markdown = await fixture('en-invalid.md');

  assert.equal(validateDocumentLanguage(markdown, 'zh-CN').valid, false);
  assert.equal(validateDocumentLanguage(markdown, 'ko-KR').valid, false);
});

test('rejects unsupported validator locales', () => {
  assert.throws(() => validateDocumentLanguage('Bonjour', 'fr-FR'), /Unsupported target language/);
});
