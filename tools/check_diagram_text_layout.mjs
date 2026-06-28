#!/usr/bin/env node

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (error) {
  console.error("Could not load Playwright. Install it or run with NODE_PATH pointing to a node_modules that contains playwright.");
  console.error(error.message);
  process.exit(2);
}

const DEFAULT_HTML = "docs/architecture/retail-ai-ops-copilot-architecture.html";
const DEFAULT_REPORT = "outputs/diagram-text-layout-report.json";
const DEFAULT_SCREENSHOT = "outputs/diagram-text-layout-check.png";

function parseArgs(argv) {
  const options = {
    html: DEFAULT_HTML,
    out: DEFAULT_REPORT,
    screenshot: DEFAULT_SCREENSHOT,
    viewportWidth: 1900,
    viewportHeight: 1320,
    overlapTolerance: 1,
    minOverlapArea: 12,
    minOverlapRatio: 0.015,
    overflowTolerance: 1,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--html") options.html = argv[++index];
    else if (value === "--out") options.out = argv[++index];
    else if (value === "--screenshot") options.screenshot = argv[++index];
    else if (value === "--viewport-width") options.viewportWidth = Number(argv[++index]);
    else if (value === "--viewport-height") options.viewportHeight = Number(argv[++index]);
    else if (value === "--overlap-tolerance") options.overlapTolerance = Number(argv[++index]);
    else if (value === "--min-overlap-area") options.minOverlapArea = Number(argv[++index]);
    else if (value === "--min-overlap-ratio") options.minOverlapRatio = Number(argv[++index]);
    else if (value === "--overflow-tolerance") options.overflowTolerance = Number(argv[++index]);
    else if (value === "--no-screenshot") options.screenshot = "";
    else if (value === "-h" || value === "--help") {
      printHelp();
      process.exit(0);
    } else if (!value.startsWith("-")) {
      options.html = value;
    } else {
      throw new Error(`Unknown option: ${value}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node tools/check_diagram_text_layout.mjs [--html ${DEFAULT_HTML}]

Options:
  --out <path>                       JSON report path. Default: ${DEFAULT_REPORT}
  --screenshot <path>                Full-page screenshot path. Default: ${DEFAULT_SCREENSHOT}
  --no-screenshot                    Skip screenshot capture
  --overlap-tolerance <px>           Allowed text-box overlap before measuring area. Default: 1
  --min-overlap-area <px2>           Minimum overlap area to report. Default: 12
  --min-overlap-ratio <ratio>        Intersection/min-area ratio to report. Default: 0.015
  --overflow-tolerance <px>          Allowed scroll/client overflow. Default: 1
`);
}

function ensureParent(filePath) {
  const dirname = path.dirname(filePath);
  fs.mkdirSync(dirname, { recursive: true });
}

function absoluteFromCwd(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

function chromiumLaunchOptions() {
  const options = { headless: true };
  if (process.env.CHROME_EXECUTABLE_PATH) {
    options.executablePath = process.env.CHROME_EXECUTABLE_PATH;
  } else if (process.platform === "darwin") {
    options.executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  return options;
}

function printSummary(report) {
  const errors = report.findings.filter((finding) => finding.severity === "error");
  const warnings = report.findings.filter((finding) => finding.severity === "warning");
  console.log(`Text layout lint: ${errors.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`Checked ${report.summary.textElementCount} text elements.`);
  console.log(`Findings: ${errors.length} error(s), ${warnings.length} warning(s).`);

  for (const finding of errors.slice(0, 20)) {
    if (finding.type === "text-overlap") {
      console.log(`ERROR ${finding.type}: ${finding.a.id} <-> ${finding.b.id} - ${finding.message}`);
    } else {
      console.log(`ERROR ${finding.type}: ${finding.id} - ${finding.message}`);
    }
  }
  if (errors.length > 20) {
    console.log(`... ${errors.length - 20} more error(s) in ${report.reportPath}`);
  }
  for (const finding of warnings.slice(0, 10)) {
    console.log(`WARN ${finding.type}: ${finding.id} - ${finding.message}`);
  }
  if (warnings.length > 10) {
    console.log(`... ${warnings.length - 10} more warning(s) in ${report.reportPath}`);
  }
}

const options = parseArgs(process.argv.slice(2));
const htmlPath = absoluteFromCwd(options.html);
const reportPath = absoluteFromCwd(options.out);
const screenshotPath = options.screenshot ? absoluteFromCwd(options.screenshot) : "";

const browser = await chromium.launch(chromiumLaunchOptions());

try {
  const page = await browser.newPage({
    viewport: { width: options.viewportWidth, height: options.viewportHeight },
    deviceScaleFactor: 1,
  });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

  if (screenshotPath) {
    ensureParent(screenshotPath);
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }

  const report = await page.evaluate((config) => {
    const roundRect = (rect) => ({
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });

    const rectFromElement = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    };

    const area = (rect) => Math.max(0, rect.width) * Math.max(0, rect.height);

    const intersection = (a, b) => {
      const left = Math.max(a.left, b.left);
      const top = Math.max(a.top, b.top);
      const right = Math.min(a.right, b.right);
      const bottom = Math.min(a.bottom, b.bottom);
      const width = right - left;
      const height = bottom - top;
      if (width <= config.overlapTolerance || height <= config.overlapTolerance) {
        return null;
      }
      return { left, top, right, bottom, width, height };
    };

    const normalize = (text) => text.replace(/\s+/g, " ").trim();

    const candidateSelectors = [
      [".diagram > .flow-label", "flow-label"],
      [".diagram > .rail-label", "rail-label"],
      [".diagram > .boundary-note", "boundary-note"],
      [".diagram > .zone-label", "zone-label"],
      [".diagram > .footer-note", "footer-note"],
      [".diagram > .title", "title"],
      [".diagram > .subtitle", "subtitle"],
      [".diagram .subzone-title", "subzone-title"],
      [".diagram .service-title", "service-title"],
      [".diagram .service-sub", "service-sub"],
    ];

    const candidates = [];
    const seen = new Set();
    for (const [selector, kind] of candidateSelectors) {
      for (const element of document.querySelectorAll(selector)) {
        if (seen.has(element)) continue;
        seen.add(element);
        const style = window.getComputedStyle(element);
        const rect = rectFromElement(element);
        const text = normalize(element.innerText || element.textContent || "");
        if (!text || style.display === "none" || style.visibility === "hidden" || rect.width <= 0 || rect.height <= 0) {
          continue;
        }
        const index = candidates.filter((item) => item.kind === kind).length + 1;
        const service = element.closest(".service");
        const subzone = element.closest(".subzone");
        const parentFrame = service || subzone || element.parentElement;
        candidates.push({
          element,
          id: element.dataset.labelId || element.id || `${kind}-${index}`,
          kind,
          text,
          rect,
          zIndex: Number.parseInt(style.zIndex, 10) || 0,
          overflowX: element.scrollWidth - element.clientWidth,
          overflowY: element.scrollHeight - element.clientHeight,
          parent: parentFrame,
          parentKind: service ? "service" : subzone ? "subzone" : parentFrame?.className || "",
          parentLabel: service?.querySelector(".service-title")?.innerText || subzone?.querySelector(".subzone-title")?.innerText || "",
          parentRect: parentFrame ? rectFromElement(parentFrame) : null,
        });
      }
    }

    const findings = [];

    for (const item of candidates) {
      if (item.overflowX > config.overflowTolerance || item.overflowY > config.overflowTolerance) {
        findings.push({
          severity: "error",
          type: "text-overflow",
          id: item.id,
          kind: item.kind,
          text: item.text,
          message: "Text element scroll size exceeds its visible box; rendered text may be clipped.",
          overflow: { x: Math.round(item.overflowX), y: Math.round(item.overflowY) },
          rect: roundRect(item.rect),
        });
      }

      if (item.parentRect && item.parent !== item.element) {
        const escaped = (
          item.rect.left < item.parentRect.left - config.overflowTolerance ||
          item.rect.top < item.parentRect.top - config.overflowTolerance ||
          item.rect.right > item.parentRect.right + config.overflowTolerance ||
          item.rect.bottom > item.parentRect.bottom + config.overflowTolerance
        );
        if (escaped) {
          findings.push({
            severity: "error",
            type: "text-escapes-parent",
            id: item.id,
            kind: item.kind,
            text: item.text,
            message: "Text element extends outside its containing card/frame.",
            rect: roundRect(item.rect),
            parent: { kind: item.parentKind, label: normalize(item.parentLabel), rect: roundRect(item.parentRect) },
          });
        }
      }
    }

    for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
      const a = candidates[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
        const b = candidates[rightIndex];
        if (a.element.contains(b.element) || b.element.contains(a.element)) continue;
        const overlap = intersection(a.rect, b.rect);
        if (!overlap) continue;

        const overlapArea = area(overlap);
        const minArea = Math.min(area(a.rect), area(b.rect));
        const ratio = minArea > 0 ? overlapArea / minArea : 0;
        if (overlapArea < config.minOverlapArea || ratio < config.minOverlapRatio) continue;

        findings.push({
          severity: "error",
          type: "text-overlap",
          message: "Text-bearing elements overlap; one label can visually clip or hide the other.",
          overlap: { rect: roundRect(overlap), area: Math.round(overlapArea), ratio: Number(ratio.toFixed(3)) },
          a: { id: a.id, kind: a.kind, text: a.text, rect: roundRect(a.rect), zIndex: a.zIndex },
          b: { id: b.id, kind: b.kind, text: b.text, rect: roundRect(b.rect), zIndex: b.zIndex },
        });
      }
    }

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      summary: { textElementCount: candidates.length },
      findings,
      textElements: candidates.map((item) => ({
        id: item.id,
        kind: item.kind,
        text: item.text,
        rect: roundRect(item.rect),
        overflow: { x: Math.round(item.overflowX), y: Math.round(item.overflowY) },
      })),
    };
  }, {
    overlapTolerance: options.overlapTolerance,
    minOverlapArea: options.minOverlapArea,
    minOverlapRatio: options.minOverlapRatio,
    overflowTolerance: options.overflowTolerance,
  });

  const finalReport = {
    checkedAt: new Date().toISOString(),
    htmlPath,
    reportPath,
    screenshotPath,
    options,
    ...report,
  };
  ensureParent(reportPath);
  fs.writeFileSync(reportPath, `${JSON.stringify(finalReport, null, 2)}\n`);
  printSummary(finalReport);
  console.log(`Report: ${reportPath}`);
  if (screenshotPath) console.log(`Screenshot: ${screenshotPath}`);

  const errorCount = finalReport.findings.filter((finding) => finding.severity === "error").length;
  process.exitCode = errorCount === 0 ? 0 : 1;
} finally {
  await browser.close();
}
