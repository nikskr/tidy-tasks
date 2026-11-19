// PreToolUse(Bash): block release/production and destructive commands for agents.
// Exit code 2 = block; stderr is shown to the agent as the reason.
let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input.replace(/^﻿/, ''))?.tool_input?.command ?? '';
  } catch {
    process.exit(0);
  }

  const rules = [
    [/\beas(-cli(@\S+)?)?\s+submit\b/, 'Store submission is human-only (docs/playbook/03 §3.6). Use the release workflow.'],
    [/\beas(-cli(@\S+)?)?\s+update\b[^\n]*(--channel|--branch)\s+production\b/, 'Publishing OTA updates to production is human-only.'],
    [/\bgit\s+push\b[^\n]*(--force\b|-f\b|--force-with-lease\b)/, 'Force push is not allowed for agents.'],
    [/\bgit\s+reset\s+--hard\b/, 'git reset --hard can destroy work; ask the human.'],
    [/\b(psql|pg_dump|pg_restore)\b(?![^\n]*localhost)(?![^\n]*127\.0\.0\.1)/, 'SQL against non-local databases is human-only (docs/playbook/04 §4.3).'],
    [/\beas(-cli(@\S+)?)?\s+(credentials|secret|env:(create|update|delete))\b/, 'Credentials and secrets are managed by humans.'],
  ];

  for (const [pattern, reason] of rules) {
    if (pattern.test(command)) {
      process.stderr.write(`Blocked by project policy: ${reason}\n`);
      process.exit(2);
    }
  }
  process.exit(0);
});
