#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs");

const publicPages = [
  {
    file: "docs/index.html",
    tokens: ["コードレビュー発覚問題", "テストパターン一覧"],
  },
  {
    file: "docs/architecture/retail-ai-ops-copilot-architecture.html",
    tokens: ["dbt seed", "コードレビュー発覚問題", "テストパターン一覧"],
  },
  {
    file: "docs/project-management/code-review-findings.html",
    tokens: ["コードレビュー発覚問題一覧", "dbt seed"],
  },
  {
    file: "docs/project-management/code-review-ai-mistake-patterns.html",
    tokens: ["AIミスパターン", "code-review-findings.html", "test-patterns.html"],
  },
  {
    file: "docs/project-management/test-patterns.html",
    tokens: ["テストパターン一覧", "code-review-findings.html"],
  },
];

const skipSchemes = /^(?:https?:|mailto:|tel:|data:|javascript:)/i;
const linkPattern = /\b(?:href|src)\s*=\s*(["'])(.*?)\1/g;
const findings = [];
let checkedLinks = 0;

function addFinding(file, message) {
  findings.push(`${file}: ${message}`);
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function stripQueryAndHash(rawTarget) {
  return rawTarget.split("#", 1)[0].split("?", 1)[0];
}

for (const page of publicPages) {
  const absoluteFile = path.join(repoRoot, page.file);
  if (!fs.existsSync(absoluteFile)) {
    addFinding(page.file, "page is missing");
    continue;
  }

  const html = fs.readFileSync(absoluteFile, "utf8");
  for (const token of page.tokens) {
    if (!html.includes(token)) {
      addFinding(page.file, `required token is missing: ${token}`);
    }
  }

  for (const match of html.matchAll(linkPattern)) {
    const rawTarget = match[2].trim();
    if (
      rawTarget === "" ||
      rawTarget.startsWith("#") ||
      rawTarget.startsWith("//") ||
      skipSchemes.test(rawTarget)
    ) {
      continue;
    }

    const target = stripQueryAndHash(rawTarget);
    if (target === "") {
      continue;
    }

    checkedLinks += 1;
    const resolved = path.resolve(path.dirname(absoluteFile), target);
    if (!isInside(docsRoot, resolved)) {
      addFinding(page.file, `${rawTarget} resolves outside docs/`);
      continue;
    }
    if (!fs.existsSync(resolved)) {
      addFinding(page.file, `${rawTarget} target is missing`);
    }
  }
}

if (findings.length) {
  console.error("Public surface link lint: FAIL");
  for (const finding of findings) {
    console.error(`ERROR ${finding}`);
  }
  process.exit(1);
}

console.log("Public surface link lint: PASS");
console.log(`Checked ${publicPages.length} public pages and ${checkedLinks} local links.`);
