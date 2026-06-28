#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const CHECKS = [
  {
    name: "connector geometry",
    script: "tools/check_diagram_connectors.mjs",
  },
  {
    name: "text layout",
    script: "tools/check_diagram_text_layout.mjs",
  },
];

function parseArgs(argv) {
  const passthrough = [];

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--html" || value === "--viewport-width" || value === "--viewport-height") {
      passthrough.push(value, argv[++index]);
    } else if (value === "--no-screenshot") {
      passthrough.push(value);
    } else if (value === "-h" || value === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unsupported option for all-check wrapper: ${value}`);
    }
  }

  return passthrough;
}

function printHelp() {
  console.log(`Usage:
  node tools/check_diagram_quality.mjs [--html docs/architecture/retail-ai-ops-copilot-architecture.html]

Runs every required diagram lint for arrow/correlation review:
  - tools/check_diagram_connectors.mjs
  - tools/check_diagram_text_layout.mjs

Supported shared options:
  --html <path>
  --viewport-width <px>
  --viewport-height <px>
  --no-screenshot

Use the individual lint scripts when you need script-specific report or
threshold options.`);
}

const passthroughArgs = parseArgs(process.argv.slice(2));
let failed = false;

for (const check of CHECKS) {
  console.log(`\n=== ${check.name} ===`);
  const result = spawnSync(process.execPath, [path.resolve(check.script), ...passthroughArgs], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Failed to run ${check.name}: ${result.error.message}`);
    failed = true;
    continue;
  }

  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  console.error("\nDiagram quality lint: FAIL");
  process.exitCode = 1;
} else {
  console.log("\nDiagram quality lint: PASS");
}
