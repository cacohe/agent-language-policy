import assert from 'node:assert/strict';
import test from 'node:test';

import {
  inspectManagedBlock,
  removeManagedBlock,
  upsertManagedBlock,
} from '../src/installation/managed-block.mjs';

test('adds one managed block without changing existing user content', () => {
  const result = upsertManagedBlock('# Existing\n\nKeep this.\n', '## Policy\nChinese text.');

  assert.match(result, /^# Existing\n\nKeep this\.\n/);
  assert.equal(result.match(/agent-language-policy:start/g)?.length, 1);
  assert.match(result, /## Policy\nChinese text\./);
});

test('updating a managed block is idempotent', () => {
  const once = upsertManagedBlock('# Existing\n', 'first');
  const twice = upsertManagedBlock(once, 'second');
  const thrice = upsertManagedBlock(twice, 'second');

  assert.equal(twice, thrice);
  assert.doesNotMatch(twice, /first/);
  assert.equal(twice.match(/agent-language-policy:start/g)?.length, 1);
});

test('preserves CRLF when updating Windows instruction files', () => {
  const original = '# Existing\r\n\r\nKeep this.\r\n';
  const result = upsertManagedBlock(original, 'policy\nline');

  assert.equal(result.includes('\r\n'), true);
  assert.equal(result.replaceAll('\r\n', '').includes('\n'), false);
});

test('refuses to update malformed markers', () => {
  const malformed = '# Existing\n<!-- agent-language-policy:start -->\nbroken';

  assert.equal(inspectManagedBlock(malformed).status, 'malformed');
  assert.throws(() => upsertManagedBlock(malformed, 'replacement'), /Malformed managed block/);
});

test('removes only the managed block and leaves user content', () => {
  const installed = upsertManagedBlock('# Existing\n\nKeep this.\n', 'policy');
  const result = removeManagedBlock(installed);

  assert.equal(result, '# Existing\n\nKeep this.\n');
});
