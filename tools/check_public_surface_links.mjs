#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs");
const textScanRoots = ["docs", "tools"];
const wordCodeReview = "\u30b3\u30fc\u30c9\u30ec\u30d3\u30e5\u30fc";
const wordReview = "\u30ec\u30d3\u30e5\u30fc";
const wordProblem = "\u554f\u984c";
const wordDetected = "\u767a\u899a";
const blockedPublicSurfaceFraming = [
  `${wordCodeReview}${wordProblem}${wordDetected}`,
  `${wordCodeReview}${wordDetected}${wordProblem}`,
  `${wordProblem}${wordDetected}`,
  `${wordDetected}${wordProblem}`,
  `${wordDetected}\u5185\u5bb9`,
  `${wordReview}\u3067${wordDetected}`,
  `\u5b9f${wordReview}\u3067${wordDetected}`,
  `${wordReview}\u3067\u5b9f\u969b\u306b${wordDetected}`,
  "\u6539\u4fee\u4f8b",
];

const publicPages = [
  {
    file: "docs/index.html",
    tokens: ["ソースコード改修実例", "ソースコード改修実例を開く", "テストパターン一覧", "b8321eb"],
  },
  {
    file: "docs/architecture/retail-ai-ops-copilot-architecture.html",
    tokens: ["dbt seed", "ソースコード改修実例", "テストパターン一覧", "quality_passed=16"],
  },
  {
    file: "docs/project-management/code-review-findings.html",
    tokens: ["ソースコード改修実例", "dbt seed", "b8321eb", "known_gaps_observed=10"],
  },
  {
    file: "docs/project-management/code-review-ai-mistake-patterns.html",
    tokens: ["AIミスパターン", "code-review-findings.html", "test-patterns.html"],
  },
  {
    file: "docs/project-management/test-patterns.html",
    tokens: ["テストパターン一覧", "code-review-findings.html", "evaluation_mode=local_static_fixture"],
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

function collectTextFiles(root) {
  const files = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const absoluteEntry = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTextFiles(absoluteEntry));
    } else if (entry.isFile()) {
      files.push(absoluteEntry);
    }
  }
  return files;
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split("\n").length;
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

for (const relativeRoot of textScanRoots) {
  const absoluteRoot = path.join(repoRoot, relativeRoot);
  if (!fs.existsSync(absoluteRoot)) {
    continue;
  }

  for (const absoluteFile of collectTextFiles(absoluteRoot)) {
    const relativeFile = path.relative(repoRoot, absoluteFile);
    const content = fs.readFileSync(absoluteFile, "utf8");
    for (const phrase of blockedPublicSurfaceFraming) {
      const index = content.indexOf(phrase);
      if (index !== -1) {
        addFinding(
          relativeFile,
          `blocked public wording remains at line ${lineNumberFor(content, index)}: ${phrase}`,
        );
      }
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
