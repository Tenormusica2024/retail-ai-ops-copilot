#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_LEDGER = ".agent-feedback/FEEDBACK_LEDGER.md";
const DEFAULT_PROJECT_SKILL = ".agent-feedback/PROJECT_SKILL.md";
const DEFAULT_SKILLS_ROOT = "skills";
const NEW_STYLE_LEDGER_MIN_DATE = "2026-06-29";
const TARGET_SCOPE_PATTERN = /target_scope=([a-z-]+(?:\/[a-z-]+)*)/;
const TRIGGER_DECISION_PATTERN = /trigger_decision=(fired|not-triggered|missed)/;

function parseArgs(argv) {
  const options = {
    ledger: DEFAULT_LEDGER,
    projectSkill: DEFAULT_PROJECT_SKILL,
    skillsRoot: DEFAULT_SKILLS_ROOT,
    globalLedgerSkill: "",
    globalReviewSkill: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--ledger") options.ledger = argv[++index];
    else if (value === "--project-skill") options.projectSkill = argv[++index];
    else if (value === "--skills-root") options.skillsRoot = argv[++index];
    else if (value === "--global-ledger-skill") options.globalLedgerSkill = argv[++index];
    else if (value === "--global-review-skill") options.globalReviewSkill = argv[++index];
    else if (value === "-h" || value === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${value}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node tools/check_feedback_reflection.mjs

Checks structural feedback-reflection evidence:
  - duplicate ledger ids
  - malformed ledger table rows
  - new reflected ledger rows without target_scope or trigger_decision
  - project rule gates for trigger decisions and missing child skills
  - repo-local child skill files listed by parent skills
  - child-skill files that are not listed by their parent skill
  - ledger rows that reference missing skill files
  - reflected child-specific improvements without child routing evidence

Options:
  --ledger <path>                Default: ${DEFAULT_LEDGER}
  --project-skill <path>         Default: ${DEFAULT_PROJECT_SKILL}
  --skills-root <path>           Default: ${DEFAULT_SKILLS_ROOT}
  --global-ledger-skill <path>   Optional installed agent-feedback-ledger check
  --global-review-skill <path>   Optional installed agent-feedback-ledger-review check
`);
}

function readText(filePath, findings, required = true) {
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) {
    findings.push({
      severity: required ? "error" : "warning",
      type: "missing-file",
      file: filePath,
      message: `${filePath} does not exist`,
    });
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function existsRepoPath(filePath) {
  return fs.existsSync(path.resolve(process.cwd(), filePath));
}

function parseLedgerRows(markdown, findings) {
  const rows = [];
  let section = "";
  let lineNumber = 0;

  for (const line of markdown.split(/\r?\n/)) {
    lineNumber += 1;
    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }

    if (!line.startsWith("| ")) continue;
    if (line.includes("| ---")) continue;
    if (line.includes("| ID |")) continue;

    const cells = line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());

    if (cells.length !== 7) {
      addFinding(
        findings,
        "error",
        "malformed-ledger-row",
        `Ledger row at line ${lineNumber} has ${cells.length} column(s); expected 7`,
        { line: lineNumber },
      );
      continue;
    }
    rows.push({
      section,
      id: cells[0],
      date: cells[1],
      source: cells[2],
      summary: cells[3],
      context: cells[4],
      target: cells[5],
      status: cells[6],
      raw: line,
      text: cells.join(" "),
    });
  }

  return rows;
}

function collectSkillFiles(skillsRoot) {
  const root = path.resolve(process.cwd(), skillsRoot);
  if (!fs.existsSync(root)) return [];

  const results = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile() && entry.name === "SKILL.md") {
        results.push(toPosix(path.relative(process.cwd(), entryPath)));
      }
    }
  }
  return results.sort();
}

function extractRepoSkillPaths(text) {
  const paths = new Set();
  const pattern = /(?:^|[`'"\s(])((?:\.\/)?skills\/[A-Za-z0-9._/-]+\/SKILL\.md)(?=[`'"\s),.]|$)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    paths.add(match[1].replace(/^\.\//, ""));
  }
  return [...paths].sort();
}

function findParentSkill(childPath) {
  const parts = childPath.split("/");
  const childIndex = parts.indexOf("child-skills");
  if (childIndex <= 1) return "";
  return `${parts.slice(0, childIndex).join("/")}/SKILL.md`;
}

function addFinding(findings, severity, type, message, extra = {}) {
  findings.push({ severity, type, message, ...extra });
}

function checkRequiredPhrase(findings, text, file, phrase, type) {
  if (!text.includes(phrase)) {
    addFinding(findings, "error", type, `${file} is missing required phrase: ${phrase}`, { file });
  }
}

function checkLedger(findings, ledgerText) {
  const rows = parseLedgerRows(ledgerText, findings);
  const ids = new Map();

  for (const row of rows) {
    if (ids.has(row.id)) {
      addFinding(findings, "error", "duplicate-ledger-id", `Duplicate ledger id ${row.id}`, {
        id: row.id,
        firstSection: ids.get(row.id).section,
        duplicateSection: row.section,
      });
    } else {
      ids.set(row.id, row);
    }

    for (const skillPath of extractRepoSkillPaths(row.raw)) {
      if (!existsRepoPath(skillPath)) {
        addFinding(findings, "error", "missing-skill-reference", `${row.id} references missing skill file ${skillPath}`, {
          id: row.id,
          path: skillPath,
        });
      }
    }

    const childTarget = /target_scope=(child-specific|multi-child)/.test(row.text) ||
      /child skill|child-skill|child pack|child-pack|子スキル/i.test(row.target);
    const hasConcreteChildEvidence = /skills\/.+child-skills\/.+\/SKILL\.md/.test(row.text) ||
      /created_child_skill=|proposed_child_skill=|loaded_child_packs=|child_pack_not_loaded=/.test(row.text);

    if (row.section === "改善" && row.status === "reflected" && childTarget && !hasConcreteChildEvidence) {
      addFinding(
        findings,
        "error",
        "missing-child-routing-evidence",
        `${row.id} is a reflected child-scope improvement but lacks child skill path or routing evidence`,
        { id: row.id },
      );
    }

    if (row.status === "reflected" && /trigger-condition|発火条件|発火判断|Trigger Decision/i.test(row.text)) {
      const hasTriggerRuleTarget = /agent-feedback-ledger|PROJECT_SKILL|project feedback|trigger rule|Trigger Decision/i.test(row.text);
      if (!hasTriggerRuleTarget) {
        addFinding(
          findings,
          "warning",
          "weak-trigger-condition-evidence",
          `${row.id} mentions trigger weakness but does not name a trigger-rule target`,
          { id: row.id },
        );
      }
    }

    const isNewStyleReflectedRow = row.status === "reflected" && row.date >= NEW_STYLE_LEDGER_MIN_DATE;
    if (isNewStyleReflectedRow && !TARGET_SCOPE_PATTERN.test(row.text)) {
      addFinding(
        findings,
        "error",
        "missing-target-scope",
        `${row.id} is a new reflected ledger row but lacks target_scope=...`,
        { id: row.id },
      );
    }
    if (isNewStyleReflectedRow && !TRIGGER_DECISION_PATTERN.test(row.text)) {
      addFinding(
        findings,
        "error",
        "missing-trigger-decision",
        `${row.id} is a new reflected ledger row but lacks trigger_decision=fired|not-triggered|missed`,
        { id: row.id },
      );
    }
  }

  return rows;
}

function checkSkillHierarchy(findings, skillFiles) {
  for (const skillFile of skillFiles) {
    const text = fs.readFileSync(path.resolve(process.cwd(), skillFile), "utf8");
    const references = extractRepoSkillPaths(text);

    for (const reference of references) {
      if (!existsRepoPath(reference)) {
        addFinding(findings, "error", "missing-skill-reference", `${skillFile} references missing skill file ${reference}`, {
          file: skillFile,
          path: reference,
        });
      }
    }

    if (!skillFile.includes("/child-skills/")) continue;
    const parent = findParentSkill(skillFile);
    if (!parent || !existsRepoPath(parent)) {
      addFinding(findings, "error", "missing-parent-skill", `${skillFile} has no existing parent skill`, {
        file: skillFile,
        expectedParent: parent,
      });
      continue;
    }

    const parentText = fs.readFileSync(path.resolve(process.cwd(), parent), "utf8");
    const relativeFromParent = toPosix(path.relative(path.dirname(parent), skillFile));
    if (!parentText.includes(relativeFromParent) && !parentText.includes(skillFile)) {
      addFinding(findings, "error", "child-not-listed-by-parent", `${skillFile} is not listed by parent ${parent}`, {
        file: skillFile,
        parent,
        expectedReference: relativeFromParent,
      });
    }
  }
}

function checkProjectSkill(findings, projectSkillText, projectSkillPath) {
  const requiredAnchors = [
    "feedback-gate:trigger-decision",
    "feedback-gate:missing-child-skill-creation",
    "feedback-gate:reflection-audit",
    "feedback-gate:backlog-ticket-japanese",
  ];

  for (const anchor of requiredAnchors) {
    checkRequiredPhrase(findings, projectSkillText, projectSkillPath, anchor, "missing-project-feedback-anchor");
  }

  const requiredPhrases = [
    "node tools/check_feedback_reflection.mjs",
    "trigger_decision=fired",
    "Every new reflected ledger row must include a concrete `target_scope=...`",
  ];

  for (const phrase of requiredPhrases) {
    checkRequiredPhrase(findings, projectSkillText, projectSkillPath, phrase, "missing-project-feedback-gate");
  }

  for (const skillPath of extractRepoSkillPaths(projectSkillText)) {
    if (!existsRepoPath(skillPath)) {
      addFinding(findings, "error", "missing-skill-reference", `${projectSkillPath} references missing skill file ${skillPath}`, {
        file: projectSkillPath,
        path: skillPath,
      });
    }
  }
}

function checkOptionalGlobalSkill(findings, filePath, expectedPhrases, label) {
  if (!filePath) return;
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) {
    addFinding(findings, "warning", "missing-global-skill", `${label} was requested but ${filePath} does not exist`, {
      file: filePath,
    });
    return;
  }
  const text = fs.readFileSync(absolute, "utf8");
  for (const phrase of expectedPhrases) {
    if (!text.includes(phrase)) {
      addFinding(findings, "error", "missing-global-feedback-gate", `${label} is missing required phrase: ${phrase}`, {
        file: filePath,
      });
    }
  }
}

function printSummary(findings, rows, skillFiles) {
  const errors = findings.filter((finding) => finding.severity === "error");
  const warnings = findings.filter((finding) => finding.severity === "warning");

  console.log(`Feedback reflection lint: ${errors.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`Checked ${rows.length} ledger rows and ${skillFiles.length} repo-local skill files.`);
  console.log(`Findings: ${errors.length} error(s), ${warnings.length} warning(s).`);

  for (const finding of errors.slice(0, 30)) {
    const id = finding.id ? ` ${finding.id}` : "";
    const file = finding.file ? ` ${finding.file}` : "";
    console.log(`ERROR ${finding.type}${id}${file} - ${finding.message}`);
  }
  if (errors.length > 30) {
    console.log(`... ${errors.length - 30} more error(s)`);
  }

  for (const finding of warnings.slice(0, 20)) {
    const id = finding.id ? ` ${finding.id}` : "";
    const file = finding.file ? ` ${finding.file}` : "";
    console.log(`WARN ${finding.type}${id}${file} - ${finding.message}`);
  }
  if (warnings.length > 20) {
    console.log(`... ${warnings.length - 20} more warning(s)`);
  }
}

const options = parseArgs(process.argv.slice(2));
const findings = [];

const ledgerText = readText(options.ledger, findings);
const projectSkillText = readText(options.projectSkill, findings);
const skillFiles = collectSkillFiles(options.skillsRoot);

const rows = checkLedger(findings, ledgerText);
checkProjectSkill(findings, projectSkillText, options.projectSkill);
checkSkillHierarchy(findings, skillFiles);

checkOptionalGlobalSkill(
  findings,
  options.globalLedgerSkill,
  [
    "Trigger Decision Gate",
    "If the correct target is `child-specific` or `multi-child`",
    "created_child_skill=...",
    "trigger_decision=fired",
    "Every new reflected ledger row must record `target_scope=...`",
  ],
  "global agent-feedback-ledger",
);

checkOptionalGlobalSkill(
  findings,
  options.globalReviewSkill,
  [
    "Was an explicit trigger decision made",
    "correct task-specific child",
    "target_scope",
    "trigger_decision",
  ],
  "global agent-feedback-ledger-review",
);

printSummary(findings, rows, skillFiles);

if (findings.some((finding) => finding.severity === "error")) {
  process.exitCode = 1;
}
