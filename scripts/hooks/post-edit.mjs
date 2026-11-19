// PostToolUse(Edit|Write): auto-fix lint on the edited TS/JS file and report what's left.
// Exit 2 feeds remaining errors back to the agent so it fixes them immediately.
import { spawnSync } from 'node:child_process';

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let file = '';
  try {
    file = JSON.parse(input.replace(/^﻿/, ''))?.tool_input?.file_path ?? '';
  } catch {
    process.exit(0);
  }
  if (!/\.(ts|tsx|js|mjs)$/.test(file) || /node_modules|[\\/]\.claude[\\/]/.test(file)) process.exit(0);

  const result = spawnSync('npx', ['eslint', '--fix', '--no-warn-ignored', file], {
    encoding: 'utf8',
    shell: true,
  });
  if (result.status !== 0) {
    process.stderr.write(`ESLint errors remain in ${file}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
  process.exit(0);
});
