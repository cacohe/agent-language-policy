import { extractHumanProse } from './markdown-prose.mjs';

const TARGET_PATTERNS = Object.freeze({
  'zh-CN': /\p{Script=Han}/gu,
  'ko-KR': /\p{Script=Hangul}/gu,
});

export function validateDocumentLanguage(markdown, locale) {
  const targetPattern = TARGET_PATTERNS[locale];
  if (!targetPattern) throw new Error(`Unsupported target language: ${locale}`);

  const prose = extractHumanProse(markdown);
  const targetCharacters = prose.match(targetPattern)?.length ?? 0;
  const latinCharacters = prose.match(/\p{Script=Latin}/gu)?.length ?? 0;
  const consideredCharacters = targetCharacters + latinCharacters;
  const targetRatio = consideredCharacters === 0 ? 0 : targetCharacters / consideredCharacters;

  return {
    valid: targetCharacters >= 4 && targetRatio >= 0.2,
    locale,
    targetCharacters,
    latinCharacters,
    targetRatio,
    prose,
  };
}
