// Stop hook: if source files changed in the working tree, run typecheck + tests.
// On failure, exit 2 with a short report so the agent keeps working instead of stopping.
import { spawnSync } from 'node:child_process';

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    // Avoid infinite loops: if we already blocked once in this stop cycle, let it stop.
    if (JSON.parse(input.replace(/^﻿/, ''))?.stop_hook_active) process.exit(0);
  } catch {
    // no payload — continue
  }

  const status = spawnSync('git', ['status', '--porcelain', '--', 'src', 'app.config.ts'], { encoding: 'utf8' });
  if (status.status !== 0 || !status.stdout.trim()) process.exit(0);

  const run = (args) => spawnSync('npx', args, { encoding: 'utf8', shell: true });
  const tsc = run(['tsc', '--noEmit']);
  const jest = run(['jest', '--ci', '--silent']);

  if (tsc.status !== 0 || jest.status !== 0) {
    const tail = (s) => s.split('\n').slice(-30).join('\n');
    process.stderr.write(
      'Verification failed — fix before finishing.\n' +
        (tsc.status !== 0 ? `\n[typecheck]\n${tail(tsc.stdout + tsc.stderr)}` : '') +
        (jest.status !== 0 ? `\n[tests]\n${tail(jest.stdout + jest.stderr)}` : ''),
    );
    process.exit(2);
  }
  process.exit(0);
});
