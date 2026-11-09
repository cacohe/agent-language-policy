/** Load canonical language profiles from the package root. */
import { readFile } from 'node:fs/promises';

export const SUPPORTED_LOCALES = Object.freeze(['zh-CN', 'zh-TW', 'ko-KR']);

export async function loadLanguageProfile(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported target language: ${locale}`);
  }

  const url = new URL(`../../policy/profiles/${locale}.json`, import.meta.url);
  return JSON.parse(await readFile(url, 'utf8'));
}
