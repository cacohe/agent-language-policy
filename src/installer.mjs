import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { getInstructionTarget } from './adapters.mjs';
import { inspectManagedBlock, removeManagedBlock, upsertManagedBlock } from './managed-block.mjs';
import { renderManagedPolicy } from './policy-renderer.mjs';
import { loadLanguageProfile } from './profiles.mjs';

async function readOrEmpty(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return '';
    throw error;
  }
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function withCursorHeader(content, format) {
  if (format !== 'mdc' || content) return content;
  return ['---', 'description: Keep human decision content in the configured language', 'alwaysApply: true', '---', ''].join('\n');
}

export async function planInstallation({ agent, scope, locale, projectDir, homeDir }) {
  const target = getInstructionTarget(agent, scope, { projectDir, homeDir });
  const profile = await loadLanguageProfile(locale);
  const policy = renderManagedPolicy(profile);

  if (target.mode === 'manual') {
    return {
      mode: 'manual',
      agent,
      scope,
      locale,
      instructions: `Open ${target.location} and add:\n\n${policy}`,
    };
  }

  const originalContent = await readOrEmpty(target.path);
  const baseContent = withCursorHeader(originalContent, target.format);
  const nextContent = upsertManagedBlock(baseContent, policy);
  return {
    mode: 'file',
    operation: 'install',
    agent,
    scope,
    locale,
    targetPath: target.path,
    backupPath: `${target.path}.agent-language-policy.bak`,
    originalContent,
    nextContent,
    changed: originalContent !== nextContent,
  };
}

export async function applyInstallation(plan) {
  if (plan.mode === 'manual' || !plan.changed) return plan;

  await mkdir(dirname(plan.targetPath), { recursive: true });
  if (plan.originalContent && !(await exists(plan.backupPath))) {
    await writeFile(plan.backupPath, plan.originalContent, 'utf8');
  }
  await writeFile(plan.targetPath, plan.nextContent, 'utf8');
  return plan;
}

export async function planRemoval({ agent, scope, projectDir, homeDir }) {
  const target = getInstructionTarget(agent, scope, { projectDir, homeDir });
  if (target.mode === 'manual') {
    return { mode: 'manual', operation: 'remove', instructions: `Remove the policy from ${target.location}.` };
  }

  const originalContent = await readOrEmpty(target.path);
  const inspection = inspectManagedBlock(originalContent);
  const nextContent = inspection.status === 'absent' ? originalContent : removeManagedBlock(originalContent);
  return {
    mode: 'file',
    operation: 'remove',
    targetPath: target.path,
    originalContent,
    nextContent,
    changed: originalContent !== nextContent,
  };
}

export async function applyRemoval(plan) {
  if (plan.mode === 'manual' || !plan.changed) return plan;
  await writeFile(plan.targetPath, plan.nextContent, 'utf8');
  return plan;
}
