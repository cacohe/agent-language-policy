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

test('accepts Traditional Chinese prose without variant warnings', async () => {
  const result = validateDocumentLanguage(await fixture('zh-TW-valid.md'), 'zh-TW');

  assert.equal(result.valid, true);
  assert.equal(result.failureReason, null);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.variantEvidence.simplifiedCharacters, 0);
  assert.ok(result.variantEvidence.traditionalCharacters >= 4);
});

test('rejects simplified-dominant prose for Traditional Chinese', async () => {
  const result = validateDocumentLanguage(await fixture('zh-TW-simplified.md'), 'zh-TW');

  assert.equal(result.valid, false);
  assert.equal(result.failureReason, 'variant-mismatch');
  assert.ok(result.variantEvidence.simplifiedCharacters >= 4);
});

test('warns but accepts a small amount of simplified variant evidence', async () => {
  const result = validateDocumentLanguage(await fixture('zh-TW-warning.md'), 'zh-TW');

  assert.equal(result.valid, true);
  assert.equal(result.failureReason, null);
  assert.deepEqual(result.warnings, ['possible-simplified-chinese']);
});

test('accepts shared Han prose without guessing a Chinese variant', () => {
  const result = validateDocumentLanguage('# 安全方案\n\n安全方案工作流程', 'zh-TW');

  assert.equal(result.valid, true);
  assert.equal(result.failureReason, null);
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.variantEvidence, {
    simplifiedCharacters: 0,
    traditionalCharacters: 0,
  });
});

test('does not treat shared 查 量 or 料 characters as variant evidence', () => {
  for (const markdown of [
    '各向量的量相同，分量的量亦相同。',
    '安全查核工作',
    '材料管理流程',
  ]) {
    const result = validateDocumentLanguage(markdown, 'zh-TW');

    assert.equal(result.valid, true, markdown);
    assert.deepEqual(result.warnings, [], markdown);
    assert.deepEqual(result.variantEvidence, {
      simplifiedCharacters: 0,
      traditionalCharacters: 0,
    }, markdown);
  }
});

test('shared characters do not suppress a real simplified variant mismatch', () => {
  const result = validateDocumentLanguage('这个开发材料材料', 'zh-TW');

  assert.equal(result.valid, false);
  assert.equal(result.failureReason, 'variant-mismatch');
  assert.deepEqual(result.variantEvidence, {
    simplifiedCharacters: 4,
    traditionalCharacters: 0,
  });
});
