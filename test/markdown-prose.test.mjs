import assert from 'node:assert/strict';
import test from 'node:test';

import { extractHumanProse } from '../src/markdown-prose.mjs';

test('extracts explanatory prose while excluding code, inline literals, URLs, and managed comments', () => {
  const markdown = [
    '# 中文设计',
    '',
    '这段说明需要保留，但 `createSession()` 和 https://example.com 不应参与判断。',
    '',
    '```javascript',
    'const englishOnly = "technical literal";',
    '```',
    '<!-- agent-language-policy:start -->',
  ].join('\n');

  const prose = extractHumanProse(markdown);

  assert.match(prose, /这段说明需要保留/);
  assert.doesNotMatch(prose, /createSession/);
  assert.doesNotMatch(prose, /example\.com/);
  assert.doesNotMatch(prose, /englishOnly/);
  assert.doesNotMatch(prose, /agent-language-policy/);
});

