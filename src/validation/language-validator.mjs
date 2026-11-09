/** Validate human-readable Markdown prose against a configured language. */
import { extractHumanProse } from './markdown-prose.mjs';

const TARGET_PATTERNS = Object.freeze({
  'zh-CN': /\p{Script=Han}/gu,
  'zh-TW': /\p{Script=Han}/gu,
  'ko-KR': /\p{Script=Hangul}/gu,
});

const SIMPLIFIED_VARIANT_PATTERN = /[这为发后里国个实计说统构数据风险续维护开员审软码识别类变项档径参库赖设环协议栈踪误应过则]/gu;
const TRADITIONAL_VARIANT_PATTERN = /[這為發後裡國個實計說統構資風險續維護開員審軟碼識別類變數項檔徑參庫賴設環協議疊蹤誤應過則]/gu;

export function validateDocumentLanguage(markdown, locale) {
  const targetPattern = TARGET_PATTERNS[locale];
  if (!targetPattern) throw new Error(`Unsupported target language: ${locale}`);

  const prose = extractHumanProse(markdown);
  const targetCharacters = prose.match(targetPattern)?.length ?? 0;
  const latinCharacters = prose.match(/\p{Script=Latin}/gu)?.length ?? 0;
  const consideredCharacters = targetCharacters + latinCharacters;
  const targetRatio = consideredCharacters === 0 ? 0 : targetCharacters / consideredCharacters;
  const languageMatches = targetCharacters >= 4 && targetRatio >= 0.2;
  const variantEvidence = {
    simplifiedCharacters: locale === 'zh-TW'
      ? (prose.match(SIMPLIFIED_VARIANT_PATTERN)?.length ?? 0)
      : 0,
    traditionalCharacters: locale === 'zh-TW'
      ? (prose.match(TRADITIONAL_VARIANT_PATTERN)?.length ?? 0)
      : 0,
  };
  const variantMismatch = locale === 'zh-TW'
    && variantEvidence.simplifiedCharacters >= 4
    && variantEvidence.simplifiedCharacters > variantEvidence.traditionalCharacters * 2;
  const warnings = locale === 'zh-TW'
    && languageMatches
    && !variantMismatch
    && variantEvidence.simplifiedCharacters > 0
    ? ['possible-simplified-chinese']
    : [];

  return {
    valid: languageMatches && !variantMismatch,
    failureReason: languageMatches ? (variantMismatch ? 'variant-mismatch' : null) : 'language-mismatch',
    warnings,
    variantEvidence,
    locale,
    targetCharacters,
    latinCharacters,
    targetRatio,
    prose,
  };
}
