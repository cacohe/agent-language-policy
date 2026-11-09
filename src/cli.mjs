import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { getInstructionTarget, SUPPORTED_AGENTS } from './adapters.mjs';
import { inspectManagedBlock } from './managed-block.mjs';
import { applyInstallation, applyRemoval, planInstallation, planRemoval } from './installer.mjs';
import { validateDocumentLanguage } from './language-validator.mjs';
import { SUPPORTED_LOCALES } from './profiles.mjs';

const HELP = `Agent Language Policy

Usage:
  agent-language-policy install --agent <name> --scope <project|user> --language <locale> [--dry-run]
  agent-language-policy configure --scope <project|user> --language <locale>
  agent-language-policy status --agent <name> --scope <project|user>
  agent-language-policy doctor
  agent-language-policy validate <file> --language <locale>
  agent-language-policy uninstall --agent <name> --scope <project|user> [--dry-run]

Languages: zh-CN, ko-KR
Agents: codex, claude-code, cursor, gemini-cli, github-copilot
`;

function parseArguments(argv) {
  const options = {};
  const positionals = [];
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) {
      positionals.push(value);
      continue;
    }
    const name = value.slice(2);
    if (name === 'dry-run' || name === 'help') options[name] = true;
    else options[name] = argv[++index];
  }
  return { positionals, options };
}

function writeLine(stream, value) {
  stream.write(`${value}\n`);
}

function environmentFor(deps) {
  return { projectDir: deps.cwd, homeDir: deps.homeDir };
}

function requireOption(options, name) {
  if (!options[name]) throw new Error(`Missing required option: --${name}`);
  return options[name];
}

async function statusFor(options, deps) {
  const target = getInstructionTarget(
    requireOption(options, 'agent'),
    requireOption(options, 'scope'),
    environmentFor(deps),
  );
  if (target.mode === 'manual') {
    writeLine(deps.stdout, `Manual setup: ${target.location}`);
    return 0;
  }
  let content = '';
  try {
    content = await readFile(target.path, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  writeLine(deps.stdout, `${target.path}: ${inspectManagedBlock(content).status}`);
  return 0;
}

async function configure(options, deps) {
  const scope = requireOption(options, 'scope');
  const locale = requireOption(options, 'language');
  if (!SUPPORTED_LOCALES.includes(locale)) throw new Error(`Unsupported target language: ${locale}`);
  const path = scope === 'project'
    ? join(deps.cwd, '.agent-language-policy.yaml')
    : join(deps.configDir, 'config.yaml');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `version: 1\ntarget_language: ${locale}\n`, 'utf8');
  writeLine(deps.stdout, `Configured ${locale}: ${path}`);
  return 0;
}

export async function runCli(argv, dependencies = {}) {
  const deps = {
    stdout: dependencies.stdout ?? process.stdout,
    stderr: dependencies.stderr ?? process.stderr,
    cwd: dependencies.cwd ?? process.cwd(),
    homeDir: dependencies.homeDir ?? process.env.HOME ?? process.env.USERPROFILE,
    configDir: dependencies.configDir
      ?? (process.env.APPDATA ? join(process.env.APPDATA, 'agent-language-policy') : join(process.env.HOME ?? process.env.USERPROFILE, '.config/agent-language-policy')),
  };
  const { positionals, options } = parseArguments(argv);
  const command = positionals[0];

  if (!command || command === 'help' || options.help) {
    deps.stdout.write(HELP);
    return 0;
  }

  try {
    if (command === 'install') {
      const plan = await planInstallation({
        agent: requireOption(options, 'agent'),
        scope: requireOption(options, 'scope'),
        locale: requireOption(options, 'language'),
        ...environmentFor(deps),
      });
      if (!options['dry-run']) await applyInstallation(plan);
      writeLine(deps.stdout, plan.mode === 'manual' ? plan.instructions : `${options['dry-run'] ? 'Would update' : 'Updated'}: ${plan.targetPath}`);
      return 0;
    }

    if (command === 'uninstall') {
      const plan = await planRemoval({
        agent: requireOption(options, 'agent'),
        scope: requireOption(options, 'scope'),
        ...environmentFor(deps),
      });
      if (!options['dry-run']) await applyRemoval(plan);
      writeLine(deps.stdout, plan.mode === 'manual' ? plan.instructions : `${options['dry-run'] ? 'Would update' : 'Updated'}: ${plan.targetPath}`);
      return 0;
    }

    if (command === 'status') return statusFor(options, deps);
    if (command === 'configure') return configure(options, deps);

    if (command === 'doctor') {
      writeLine(deps.stdout, `Supported languages: ${SUPPORTED_LOCALES.join(', ')}`);
      writeLine(deps.stdout, `Supported agents: ${SUPPORTED_AGENTS.join(', ')}`);
      return 0;
    }

    if (command === 'validate') {
      if (!positionals[1]) throw new Error('Missing Markdown file path');
      const path = resolve(deps.cwd, positionals[1]);
      const locale = requireOption(options, 'language');
      const result = validateDocumentLanguage(await readFile(path, 'utf8'), locale);
      if (!result.valid) {
        writeLine(deps.stderr, `${path} does not match ${locale} (target ratio ${result.targetRatio.toFixed(2)})`);
        return 1;
      }
      writeLine(deps.stdout, `${path} matches ${locale}`);
      return 0;
    }

    writeLine(deps.stderr, `Unknown command: ${command}`);
    return 2;
  } catch (error) {
    writeLine(deps.stderr, error.message);
    return 2;
  }
}

export { HELP };

