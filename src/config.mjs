import { readFile } from 'node:fs/promises';

import { SUPPORTED_LOCALES } from './profiles.mjs';

async function readConfiguredLocale(path) {
  if (!path) return undefined;

  try {
    const source = await readFile(path, 'utf8');
    const json = path.endsWith('.json') ? JSON.parse(source) : undefined;
    if (json) return json.target_language;

    const match = source.match(/^target_language\s*:\s*["']?([^\s"']+)["']?\s*$/m);
    return match?.[1];
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

function assertSupported(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported target language: ${locale}`);
  }
  return locale;
}

export async function resolveConfiguration({
  cliLocale,
  projectConfigPath,
  userConfigPath,
  defaultLocale = 'zh-CN',
} = {}) {
  if (cliLocale) return { locale: assertSupported(cliLocale), source: 'cli' };

  const projectLocale = await readConfiguredLocale(projectConfigPath);
  if (projectLocale) return { locale: assertSupported(projectLocale), source: 'project' };

  const userLocale = await readConfiguredLocale(userConfigPath);
  if (userLocale) return { locale: assertSupported(userLocale), source: 'user' };

  return { locale: assertSupported(defaultLocale), source: 'default' };
}

