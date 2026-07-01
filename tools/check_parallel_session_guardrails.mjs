#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const REQUIRED_PLAN = "docs/project-management/parallel-session-implementation-plan.md";
const REQUIRED_SPLIT = "docs/project-management/parallel-session-task-split-20260630.md";
const REQUIRED_PROJECT_SKILL = "skills/ai-architecture-learning/SKILL.md";
const REQUIRED_REVIEW_SKILL =
  "skills/ai-architecture-learning/child-skills/code-review-ai-mistake-patterns/SKILL.md";
const REQUIRED_INVOCATIONS = ".agent-feedback/SUBAGENT_INVOCATIONS.md";

const COORDINATION_ONLY_FILES = new Set([
  ".agent-feedback/FEEDBACK_LEDGER.md",
  ".agent-feedback/PROJECT_SKILL.md",
  ".agent-feedback/SUBAGENT_INVOCATIONS.md",
  ".github/workflows/diagram-quality.yml",
  "AGENTS.md",
  "README.md",
  "docs/project-management/parallel-session-implementation-plan.md",
  "docs/project-management/parallel-session-task-split-20260630.md",
  "skills/ai-architecture-learning/SKILL.md",
  "skills/ai-architecture-learning/child-skills/code-review-ai-mistake-patterns/SKILL.md",
  "tools/check_parallel_session_guardrails.mjs",
]);

const ARTIFACT_PREFIXES = [
  "dbt/",
  "data/",
  "fixtures/",
  "retail_ai_ops/",
  "semantic/",
  "streamlit_app/",
  "tests/",
];

const ARTIFACT_FILE_PATTERNS = [
  /^docs\/architecture\/.+\.html$/,
  /^docs\/project-management\/.+\.html$/,
  /^tools\/(?!check_parallel_session_guardrails\.mjs).+\.(mjs|js|py)$/,
];

const IMPLEMENTATION_SECTION_HEADINGS = [
  "## Lane A: dbt実装者",
  "## LL追加タスク: AIミスパターンHTML可視化",
];

const REVIEWER_ONLY_ARTIFACT_PATTERNS = [
  /code-review-ai-mistake-patterns/i,
  /code-review-findings\.html/i,
  /findings-only HTML/i,
  /過去レビューfindings/,
  /過去finding/,
  /known-miss/i,
  /AIミスパターン/,
  /reviewer-only trap/i,
  /レビュワー専用/,
];

const REVIEWER_CONTEXT_LOAD_PATTERNS = [
  /必読/,
  /読ませ/,
  /読む/,
  /参照/,
  /確認/,
  /inspect/i,
  /load/i,
  /read/i,
];

const WITHHELD_CONTEXT_PATTERNS = [
  /渡さない/,
  /触らない/,
  /禁止/,
  /withheld/i,
  /blocked/i,
  /do not/i,
  /must not/i,
  /should not/i,
];

function readText(filePath, findings) {
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) {
    findings.push({
      severity: "error",
      file: filePath,
      message: `${filePath} does not exist`,
    });
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function addFinding(findings, severity, file, message) {
  findings.push({ severity, file, message });
}

function gitOutput(args) {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function cliValue(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return "";
  return process.argv[index + 1] || "";
}

function hasCliFlag(name) {
  return process.argv.includes(name);
}

function currentChangedFiles() {
  const compareRange = cliValue("--compare") || process.env.ORCHESTRATOR_GUARD_COMPARE || "";
  if (compareRange) {
    return uniqueSorted(
      gitOutput(["diff", "--name-only", "--diff-filter=ACMRTUXB", compareRange])
        .split(/\r?\n/)
    );
  }

  return uniqueSorted([
    ...gitOutput(["diff", "--name-only", "--diff-filter=ACMRTUXB"]).split(/\r?\n/),
    ...gitOutput(["diff", "--cached", "--name-only", "--diff-filter=ACMRTUXB"]).split(/\r?\n/),
    ...gitOutput(["ls-files", "--others", "--exclude-standard"]).split(/\r?\n/),
  ]);
}

function diffFor(filePath) {
  const compareRange = cliValue("--compare") || process.env.ORCHESTRATOR_GUARD_COMPARE || "";
  if (compareRange) {
    return gitOutput(["diff", "--unified=0", compareRange, "--", filePath]);
  }
  return [
    gitOutput(["diff", "--unified=0", "--", filePath]),
    gitOutput(["diff", "--cached", "--unified=0", "--", filePath]),
  ].join("\n");
}

function isCoordinationOnlyFile(filePath) {
  if (COORDINATION_ONLY_FILES.has(filePath)) return true;
  if (filePath.startsWith(".agent-feedback/")) return true;
  if (filePath.startsWith("skills/")) return true;
  if (filePath.startsWith(".github/")) return true;
  if (filePath.startsWith("docs/obsidian/")) return true;
  if (filePath === "package.json" || filePath === "package-lock.json") return true;
  return false;
}

function isArtifactFile(filePath) {
  if (!filePath || isCoordinationOnlyFile(filePath)) return false;
  if (ARTIFACT_PREFIXES.some((prefix) => filePath.startsWith(prefix))) return true;
  if (ARTIFACT_FILE_PATTERNS.some((pattern) => pattern.test(filePath))) return true;
  return false;
}

function addedDiffLines(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"));
}

function hasDelegatedArtifactEvidence() {
  const invocationAdded = addedDiffLines(diffFor(REQUIRED_INVOCATIONS));
  const newRealSubagent = invocationAdded.some(
    (line) =>
      line.includes("evidence_type=real-subagent") &&
      /final_artifact_status=(PASS|PARTIAL|pending-review|not-reviewed|FAIL)/.test(line)
  );
  const newExplicitSubstitution = invocationAdded.some(
    (line) =>
      (line.includes("main-context substituted") ||
        line.includes("evidence_type=main-context-substituted")) &&
      (line.includes("reason=") || line.includes("explicitly authorized") || line.includes("lane unavailable"))
  );
  return {
    ok: newRealSubagent || newExplicitSubstitution,
    newRealSubagent,
    newExplicitSubstitution,
  };
}

function requirePhrase(findings, text, file, phrase) {
  if (!text.includes(phrase)) {
    addFinding(findings, "error", file, `Missing required phrase: ${phrase}`);
  }
}

function sectionBetween(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = markdown.search(new RegExp(`^${escaped}\\s*$`, "m"));
  if (start < 0) return "";
  const rest = markdown.slice(start);
  const next = rest.search(/\n##\s+/);
  return next < 0 ? rest : rest.slice(0, next);
}

function checkPlan(findings, text) {
  const file = REQUIRED_PLAN;
  [
    "## 実装者briefとレビュワーbriefの情報分離",
    "`implementation_brief_level=baseline`",
    "`implementation_brief_level=hardened`",
    "`implementation_brief_level=full-pattern-aware`",
    "`reviewer_context_level=pattern-aware`",
    "`promotion_decision=keep_reviewer_only|promote_to_brief|promote_to_lint_or_ci|promote_to_backlog_acceptance|promote_to_project_rule`",
    "`baseline-contract miss`",
    "`reviewer-training miss`",
    "`upstream-promotion candidate`",
    "`reviewer-skill gap`",
    "レビュワーを恒久的な手直し係にせず",
    "blocked reviewer-only artifacts",
    "full-pattern-aware exception reason",
  ].forEach((phrase) => requirePhrase(findings, text, file, phrase));
}

function checkProjectSkills(findings, parentText, reviewText) {
  [
    "Reviewer-First Staged Upstreaming",
    "Implementation briefs must always include the baseline delivery contract",
    "Implementation briefs should not receive the full reviewer-only mistake",
    "Implementation lanes must not be instructed to read reviewer-only artifacts",
    "Reviewer sessions are not only defect detectors",
    "`Hardened` means distilled promoted rules only",
    "`implementation_brief_level=baseline`",
    "`reviewer_context_level=pattern-aware`",
  ].forEach((phrase) => requirePhrase(findings, parentText, REQUIRED_PROJECT_SKILL, phrase));

  [
    "Information-Asymmetric Review Mode",
    "Do not mark an implementer as failing a hidden requirement",
    "`baseline-contract miss`",
    "`reviewer-training miss`",
    "`upstream-promotion candidate`",
    "`reviewer-skill gap`",
    "`promotion_decision=keep_reviewer_only`",
    "Reviewer lanes must treat review-skill growth as part of the deliverable",
    "For `hardened` mode, require distilled promoted rules only",
  ].forEach((phrase) => requirePhrase(findings, reviewText, REQUIRED_REVIEW_SKILL, phrase));
}

function checkLane(findings, markdown, heading, requiredPhrases) {
  const file = REQUIRED_SPLIT;
  const section = sectionBetween(markdown, heading);
  if (!section) {
    addFinding(findings, "error", file, `Missing lane section: ${heading}`);
    return;
  }

  requiredPhrases.forEach((phrase) => {
    if (!section.includes(phrase)) {
      addFinding(findings, "error", file, `${heading} is missing required phrase: ${phrase}`);
    }
  });
}

function reviewerOnlyReferenceViolations(section) {
  const violations = [];
  if (section.includes("`implementation_brief_level=full-pattern-aware`")) {
    return violations;
  }

  let withheldBlock = false;
  section.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    const startsNewListItem = /^\s*-\s+/.test(line);
    const isContinuation = /^\s{2,}\S/.test(line);
    const lineMarksWithheld = WITHHELD_CONTEXT_PATTERNS.some((pattern) =>
      pattern.test(line)
    );

    if (startsNewListItem && !lineMarksWithheld) {
      withheldBlock = false;
    } else if (!isContinuation && trimmed && !lineMarksWithheld) {
      withheldBlock = false;
    }

    if (lineMarksWithheld) {
      withheldBlock = true;
    }

    const hasReviewerArtifact = REVIEWER_ONLY_ARTIFACT_PATTERNS.some((pattern) =>
      pattern.test(line)
    );
    if (!hasReviewerArtifact) return;

    if (withheldBlock) return;

    const hasLoadInstruction = REVIEWER_CONTEXT_LOAD_PATTERNS.some((pattern) =>
      pattern.test(line)
    );
    violations.push({
      line: index + 1,
      text: line.trim(),
      reason: hasLoadInstruction
        ? "reviewer-only artifact load/reference"
        : "reviewer-only artifact used outside withheld/blocked context",
    });
  });

  return violations;
}

function checkImplementationSectionsDoNotLoadReviewerOnly(findings, markdown) {
  const file = REQUIRED_SPLIT;
  for (const heading of IMPLEMENTATION_SECTION_HEADINGS) {
    const section = sectionBetween(markdown, heading);
    if (!section) continue;
    const violations = reviewerOnlyReferenceViolations(section);
    for (const violation of violations) {
      addFinding(
        findings,
        "error",
        file,
        `${heading} appears to include reviewer-only context in baseline/hardened mode at section line ${violation.line} (${violation.reason}): ${violation.text}`
      );
    }
  }
}

function briefInputs(findings) {
  const inputs = [];
  const briefPath = cliValue("--brief");
  if (briefPath) {
    const absolute = path.resolve(process.cwd(), briefPath);
    if (!fs.existsSync(absolute)) {
      addFinding(findings, "error", briefPath, "Brief file passed to --brief does not exist");
    } else {
      inputs.push({ source: briefPath, text: fs.readFileSync(absolute, "utf8") });
    }
  }

  if (hasCliFlag("--brief-stdin")) {
    inputs.push({ source: "stdin", text: fs.readFileSync(0, "utf8") });
  }

  return inputs;
}

function checkActualBrief(findings, source, text) {
  if (!text.trim()) {
    addFinding(findings, "error", source, "Brief text is empty");
    return;
  }

  const implementationMode =
    text.includes("implementation_brief_level=baseline") ||
    text.includes("implementation_brief_level=hardened") ||
    text.includes("`implementation_brief_level=baseline`") ||
    text.includes("`implementation_brief_level=hardened`");
  const fullPatternAware =
    text.includes("implementation_brief_level=full-pattern-aware") ||
    text.includes("`implementation_brief_level=full-pattern-aware`");

  if (fullPatternAware) {
    const hasReason =
      /exception reason|例外理由|reviewer-tooling implementation exception|full-pattern-aware 例外/i.test(
        text
      );
    if (!hasReason) {
      addFinding(
        findings,
        "error",
        source,
        "full-pattern-aware implementation brief must record an exception reason"
      );
    }
    return;
  }

  if (!implementationMode) return;

  for (const violation of reviewerOnlyReferenceViolations(text)) {
    addFinding(
      findings,
      "error",
      source,
      `Actual baseline/hardened brief includes reviewer-only context at line ${violation.line} (${violation.reason}): ${violation.text}`
    );
  }
}

function checkTaskSplit(findings, text) {
  const file = REQUIRED_SPLIT;
  [
    "main sessionは観測者・統制者",
    "shared file、feedback ledger、project skill、Obsidian mirrorはmain sessionが統合する",
    "`brief_drafted` は `posted` ではない",
  ].forEach((phrase) => requirePhrase(findings, text, file, phrase));

  checkLane(findings, text, "## Lane A: dbt実装者", [
    "### 情報モード",
    "`implementation_brief_level=baseline`",
    "reviewer-only context intentionally withheld",
    "promotion decision owner=main session",
    "レビュワー専用の全ミスカタログは渡さない",
    "baseline実装者にreviewer-only artifactを",
  ]);

  checkLane(findings, text, "## Lane B: 受託品質レビュワー", [
    "### 情報モード",
    "`reviewer_context_level=pattern-aware`",
    "`implementation_brief_level=baseline`",
    "`promotion_decision`",
    "`baseline-contract miss`",
    "`reviewer-training miss`",
    "`upstream-promotion candidate`",
    "`reviewer-skill gap`",
    "どのreview lensが捕捉したか",
    "次に強化すべき対象",
  ]);

  checkLane(findings, text, "## Lane C: Backlog/チケット運用QA", [
    "### 情報モード",
    "`reviewer_context_level=pattern-aware`",
    "`implementation_brief_level=baseline`",
    "`promotion_decision`",
    "実Backlog/実Slack操作は委譲しない",
    "どの運用QA lensを確認したか",
  ]);

  checkLane(findings, text, "## LL追加タスク: AIミスパターンHTML可視化", [
    "### 情報モード",
    "`implementation_brief_level=full-pattern-aware`",
    "reviewer-tooling implementation exception",
    "promotion decision owner=main session",
    "通常のbaseline実装者briefへ一般化しない",
  ]);

  checkImplementationSectionsDoNotLoadReviewerOnly(findings, text);
}

function checkOrchestratorTakeover(findings) {
  const changedFiles = currentChangedFiles();
  const artifactFiles = changedFiles.filter(isArtifactFile);
  if (artifactFiles.length === 0) return;

  const evidence = hasDelegatedArtifactEvidence();
  if (evidence.ok) return;

  addFinding(
    findings,
    "error",
    "orchestrator-takeover",
    [
      "Artifact files changed without new delegation evidence or explicit main-context substitution.",
      `Artifact files: ${artifactFiles.join(", ")}`,
      `Add a new ${REQUIRED_INVOCATIONS} row with evidence_type=real-subagent, or record explicit main-context substituted evidence with reason=... before accepting this change.`,
    ].join(" ")
  );
}

function main() {
  const findings = [];
  const plan = readText(REQUIRED_PLAN, findings);
  const split = readText(REQUIRED_SPLIT, findings);
  const projectSkill = readText(REQUIRED_PROJECT_SKILL, findings);
  const reviewSkill = readText(REQUIRED_REVIEW_SKILL, findings);

  if (plan) checkPlan(findings, plan);
  if (split) checkTaskSplit(findings, split);
  if (projectSkill && reviewSkill) checkProjectSkills(findings, projectSkill, reviewSkill);
  for (const input of briefInputs(findings)) {
    checkActualBrief(findings, input.source, input.text);
  }
  checkOrchestratorTakeover(findings);

  const errors = findings.filter((finding) => finding.severity === "error");
  if (findings.length > 0) {
    console.error("Parallel session guardrail findings:");
    for (const finding of findings) {
      console.error(`- [${finding.severity}] ${finding.file}: ${finding.message}`);
    }
  }

  if (errors.length > 0) {
    console.error(`Parallel session guardrail lint: FAIL (${errors.length} error(s))`);
    process.exit(1);
  }

  console.log("Parallel session guardrail lint: PASS");
}

main();
