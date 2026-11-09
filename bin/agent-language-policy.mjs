#!/usr/bin/env node

import { runCli } from '../src/cli/cli.mjs';

process.exitCode = await runCli(process.argv.slice(2));
