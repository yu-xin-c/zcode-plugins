#!/usr/bin/env node
/** Run a plugin Python entrypoint with platform-appropriate interpreter names. */

import { spawnSync } from "node:child_process";

const [script, ...scriptArgs] = process.argv.slice(2);

if (!script) {
  process.stderr.write("Usage: run_python.mjs <script> [...args]\n");
  process.exit(2);
}

const candidates =
  process.platform === "win32"
    ? [
        ["py", ["-3"]],
        ["python", []],
        ["python3", []],
      ]
    : [
        ["python3", []],
        ["python", []],
      ];

for (const [command, prefixArgs] of candidates) {
  const result = spawnSync(command, [...prefixArgs, script, ...scriptArgs], {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error?.code === "ENOENT") continue;
  if (result.error) {
    process.stderr.write(`[video2code] failed to start ${command}: ${result.error}\n`);
    process.exit(1);
  }
  if (result.signal) {
    process.stderr.write(`[video2code] ${command} exited via ${result.signal}\n`);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

process.stderr.write(
  "[video2code] Python 3.10+ was not found; install Python and retry.\n",
);
process.exit(127);
