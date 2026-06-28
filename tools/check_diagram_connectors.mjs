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
const DEFAULT_REPORT = "outputs/diagram-connector-geometry-report.json";
const DEFAULT_SCREENSHOT = "outputs/diagram-connector-geometry-check.png";

const EXPECTED_BIDIRECTIONAL_EDGES = new Set([
  "ci-cd-to-dbt-modeling-frame",
  "golden-eval-to-semantic-improvement",
  "app-runtime-improvement-to-trace-store",
  "error-taxonomy-review-request-to-human-review",
  "rbac-to-cost-guardrails",
]);

function parseArgs(argv) {
  const options = {
    html: DEFAULT_HTML,
    out: DEFAULT_REPORT,
    screenshot: DEFAULT_SCREENSHOT,
    viewportWidth: 1900,
    viewportHeight: 1320,
    sampleStep: 6,
    anchorTolerance: 4,
    endpointNearTolerance: 10,
    anchorSkip: 10,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--html") options.html = argv[++index];
    else if (value === "--out") options.out = argv[++index];
    else if (value === "--screenshot") options.screenshot = argv[++index];
    else if (value === "--viewport-width") options.viewportWidth = Number(argv[++index]);
    else if (value === "--viewport-height") options.viewportHeight = Number(argv[++index]);
    else if (value === "--sample-step") options.sampleStep = Number(argv[++index]);
    else if (value === "--anchor-tolerance") options.anchorTolerance = Number(argv[++index]);
    else if (value === "--endpoint-near-tolerance") options.endpointNearTolerance = Number(argv[++index]);
    else if (value === "--anchor-skip") options.anchorSkip = Number(argv[++index]);
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
  node tools/check_diagram_connectors.mjs [--html ${DEFAULT_HTML}]

Options:
  --out <path>                       JSON report path. Default: ${DEFAULT_REPORT}
  --screenshot <path>                Full-page screenshot path. Default: ${DEFAULT_SCREENSHOT}
  --no-screenshot                    Skip screenshot capture
  --sample-step <px>                 SVG path sampling interval. Default: 6
  --anchor-tolerance <px>            Allowed in-card border touch tolerance. Default: 4
  --endpoint-near-tolerance <px>     Allowed endpoint gap to an anchor. Default: 10
  --anchor-skip <px>                 Path length skipped near endpoints for body-cross checks. Default: 10
`);
}

function ensureParent(filePath) {
  const dirname = path.dirname(filePath);
  fs.mkdirSync(dirname, { recursive: true });
}

function absoluteFromCwd(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

function printSummary(report) {
  const errors = report.findings.filter((finding) => finding.severity === "error");
  const warnings = report.findings.filter((finding) => finding.severity === "warning");
  console.log(`Connector geometry lint: ${errors.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`Checked ${report.summary.pathCount} connector paths, ${report.summary.serviceCount} service nodes, ${report.summary.labelCount} flow labels.`);
  console.log(`Findings: ${errors.length} error(s), ${warnings.length} warning(s).`);

  for (const finding of errors.slice(0, 20)) {
    const endpoint = finding.endpoint ? ` endpoint=${finding.endpoint}` : "";
    console.log(`ERROR ${finding.type}: ${finding.edgeId}${endpoint} - ${finding.message}`);
  }
  if (errors.length > 20) {
    console.log(`... ${errors.length - 20} more error(s) in ${report.reportPath}`);
  }
  for (const finding of warnings.slice(0, 10)) {
    const endpoint = finding.endpoint ? ` endpoint=${finding.endpoint}` : "";
    console.log(`WARN ${finding.type}: ${finding.edgeId}${endpoint} - ${finding.message}`);
  }
  if (warnings.length > 10) {
    console.log(`... ${warnings.length - 10} more warning(s) in ${report.reportPath}`);
  }
}

const options = parseArgs(process.argv.slice(2));
const htmlPath = absoluteFromCwd(options.html);
const reportPath = absoluteFromCwd(options.out);
const screenshotPath = options.screenshot ? absoluteFromCwd(options.screenshot) : "";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

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
    const svg = document.querySelector("svg.connectors");
    if (!svg) {
      throw new Error("svg.connectors was not found");
    }

    const svgRect = svg.getBoundingClientRect();
    const screenToSvg = svg.getScreenCTM().inverse();
    const svgPoint = svg.createSVGPoint();

    const toSvgPoint = (x, y) => {
      svgPoint.x = x;
      svgPoint.y = y;
      const point = svgPoint.matrixTransform(screenToSvg);
      return { x: point.x, y: point.y };
    };

    const rectToSvg = (rect) => {
      const points = [
        toSvgPoint(rect.left, rect.top),
        toSvgPoint(rect.right, rect.top),
        toSvgPoint(rect.right, rect.bottom),
        toSvgPoint(rect.left, rect.bottom),
      ];
      const xs = points.map((point) => point.x);
      const ys = points.map((point) => point.y);
      return {
        left: Math.min(...xs),
        top: Math.min(...ys),
        right: Math.max(...xs),
        bottom: Math.max(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    };

    const roundPoint = (point) => ({ x: Math.round(point.x), y: Math.round(point.y) });
    const roundRect = (rect) => ({
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });

    const labelFor = (element, fallback) => {
      const title = element.querySelector?.(".service-title, .subzone-title, .zone-label")?.innerText;
      return (title || element.innerText || fallback).replace(/\s+/g, " ").trim();
    };

    const collectRects = (selector, kind) => (
      [...document.querySelectorAll(selector)].map((element, index) => ({
        id: element.dataset.edge || element.id || `${kind}-${index + 1}`,
        kind,
        label: labelFor(element, `${kind}-${index + 1}`),
        rect: rectToSvg(element.getBoundingClientRect()),
      }))
    );

    const services = collectRects(".diagram > .service", "service");
    const labels = collectRects(".diagram > .flow-label", "flow-label");
    const subzones = collectRects(".diagram > .subzone", "subzone");
    const zones = collectRects(".diagram > .zone", "zone");
    const anchorRects = [...services, ...labels, ...subzones, ...zones];
    const foregroundBlockers = [...services, ...labels];

    const pointInsideRect = (point, rect, tolerance = 0) => (
      point.x >= rect.left - tolerance &&
      point.x <= rect.right + tolerance &&
      point.y >= rect.top - tolerance &&
      point.y <= rect.bottom + tolerance
    );

    const edgeDistance = (point, rect) => {
      const dx = point.x < rect.left ? rect.left - point.x : point.x > rect.right ? point.x - rect.right : 0;
      const dy = point.y < rect.top ? rect.top - point.y : point.y > rect.bottom ? point.y - rect.bottom : 0;
      const outsideDistance = Math.hypot(dx, dy);
      const inside = dx === 0 && dy === 0;
      const borderDistance = inside
        ? Math.min(
          Math.abs(point.x - rect.left),
          Math.abs(point.x - rect.right),
          Math.abs(point.y - rect.top),
          Math.abs(point.y - rect.bottom),
        )
        : outsideDistance;
      return { inside, borderDistance, outsideDistance };
    };

    const nearestAnchor = (point, candidates) => {
      let best = null;
      for (const candidate of candidates) {
        const distance = edgeDistance(point, candidate.rect);
        if (!best || distance.borderDistance < best.distance.borderDistance) {
          best = { ...candidate, distance };
        }
      }
      return best;
    };

    const inspectEndpoint = (pathInfo, endpoint, point, hasMarker) => {
      const serviceHit = services.find((service) => pointInsideRect(point, service.rect));
      const nearest = nearestAnchor(point, anchorRects);
      const result = {
        endpoint,
        point: roundPoint(point),
        hasMarker,
        status: "open",
        nearest: nearest ? {
          kind: nearest.kind,
          label: nearest.label,
          distance: Math.round(nearest.distance.borderDistance),
          inside: nearest.distance.inside,
        } : null,
      };

      if (serviceHit) {
        const distance = edgeDistance(point, serviceHit.rect);
        result.anchor = { kind: serviceHit.kind, label: serviceHit.label, distance: Math.round(distance.borderDistance) };
        result.status = distance.borderDistance <= config.anchorTolerance ? "attached-to-service-edge" : "inside-service-body";
        return result;
      }

      if (nearest && nearest.distance.borderDistance <= config.endpointNearTolerance) {
        result.anchor = { kind: nearest.kind, label: nearest.label, distance: Math.round(nearest.distance.borderDistance) };
        result.status = "near-anchor";
        return result;
      }

      result.status = hasMarker ? "dangling-marker-endpoint" : "open-without-marker";
      return result;
    };

    const bodyIntersections = (pathInfo) => {
      const findings = [];
      for (const sample of pathInfo.samples) {
        const nearEndpoint = sample.distance <= config.anchorSkip || (pathInfo.length - sample.distance) <= config.anchorSkip;
        for (const blocker of foregroundBlockers) {
          if (!pointInsideRect(sample.point, blocker.rect)) continue;
          const distance = edgeDistance(sample.point, blocker.rect);
          const isBorderTouch = distance.borderDistance <= config.anchorTolerance;
          if (nearEndpoint && isBorderTouch) continue;
          if (isBorderTouch) continue;
          findings.push({
            blockerKind: blocker.kind,
            blockerLabel: blocker.label,
            blockerRect: roundRect(blocker.rect),
            point: roundPoint(sample.point),
            distanceAlongPath: Math.round(sample.distance),
            depthFromNearestEdge: Math.round(distance.borderDistance),
          });
        }
      }
      return findings;
    };

    const paths = [...svg.querySelectorAll(":scope > path")].map((element, index) => {
      const length = element.getTotalLength();
      const sampleCount = Math.max(2, Math.ceil(length / config.sampleStep));
      const samples = [];
      for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex += 1) {
        const distance = (length * sampleIndex) / sampleCount;
        samples.push({ distance, point: element.getPointAtLength(distance) });
      }
      const start = element.getPointAtLength(0);
      const end = element.getPointAtLength(length);
      const markerStart = element.getAttribute("marker-start") || "";
      const markerEnd = element.getAttribute("marker-end") || "";
      const edgeId = element.dataset.edge || `unidentified-path-${index + 1}`;
      return {
        index: index + 1,
        edgeId,
        hasDataEdge: Boolean(element.dataset.edge),
        className: element.getAttribute("class") || "",
        d: element.getAttribute("d") || "",
        markerStart,
        markerEnd,
        length,
        samples,
        start,
        end,
      };
    });

    const findings = [];
    const pathReports = [];

    for (const pathInfo of paths) {
      const hasAnyMarker = Boolean(pathInfo.markerStart || pathInfo.markerEnd);
      if (!pathInfo.hasDataEdge && hasAnyMarker) {
        findings.push({
          severity: "error",
          type: "missing-data-edge",
          edgeId: pathInfo.edgeId,
          message: "Marker-bearing connector path is missing a stable data-edge id.",
          path: { index: pathInfo.index, className: pathInfo.className, d: pathInfo.d },
        });
      } else if (!pathInfo.hasDataEdge) {
        findings.push({
          severity: "warning",
          type: "missing-data-edge",
          edgeId: pathInfo.edgeId,
          message: "Structural connector path is missing a data-edge id; keep it in matrix coverage or document it as a bus/rail segment.",
          path: { index: pathInfo.index, className: pathInfo.className, d: pathInfo.d },
        });
      }

      if (config.expectedBidirectionalEdges.includes(pathInfo.edgeId)) {
        if (!pathInfo.markerStart || !pathInfo.markerEnd) {
          findings.push({
            severity: "error",
            type: "missing-bidirectional-marker",
            edgeId: pathInfo.edgeId,
            message: "Expected bidirectional connector is missing marker-start or marker-end.",
            markers: { markerStart: pathInfo.markerStart, markerEnd: pathInfo.markerEnd },
          });
        }
      }

      const endpointChecks = [
        inspectEndpoint(pathInfo, "start", pathInfo.start, Boolean(pathInfo.markerStart)),
        inspectEndpoint(pathInfo, "end", pathInfo.end, Boolean(pathInfo.markerEnd)),
      ];

      for (const check of endpointChecks) {
        if (check.status === "inside-service-body") {
          findings.push({
            severity: "error",
            type: "endpoint-inside-service-body",
            edgeId: pathInfo.edgeId,
            endpoint: check.endpoint,
            message: `${check.endpoint} point is inside the service card body instead of adjacent to its edge.`,
            point: check.point,
            anchor: check.anchor,
          });
        } else if (check.status === "dangling-marker-endpoint") {
          findings.push({
            severity: "error",
            type: "dangling-marker-endpoint",
            edgeId: pathInfo.edgeId,
            endpoint: check.endpoint,
            message: `${check.endpoint} endpoint has an arrow marker but is not adjacent to a node, frame, label, or boundary.`,
            point: check.point,
            nearest: check.nearest,
          });
        }
      }

      const intersections = bodyIntersections(pathInfo);
      const serviceIntersections = intersections.filter((item) => item.blockerKind === "service");
      const labelIntersections = intersections.filter((item) => item.blockerKind === "flow-label");
      if (serviceIntersections.length > 0) {
        findings.push({
          severity: "error",
          type: "path-crosses-service-body",
          edgeId: pathInfo.edgeId,
          message: "Connector path body crosses a foreground service card away from an allowed edge anchor.",
          intersections: serviceIntersections.slice(0, 8),
          intersectionCount: serviceIntersections.length,
        });
      }
      if (labelIntersections.length > 0) {
        findings.push({
          severity: "warning",
          type: "path-crosses-flow-label",
          edgeId: pathInfo.edgeId,
          message: "Connector path body crosses a flow label; verify label readability and relationship ownership.",
          intersections: labelIntersections.slice(0, 8),
          intersectionCount: labelIntersections.length,
        });
      }

      pathReports.push({
        index: pathInfo.index,
        edgeId: pathInfo.edgeId,
        hasDataEdge: pathInfo.hasDataEdge,
        className: pathInfo.className,
        d: pathInfo.d,
        markers: { markerStart: pathInfo.markerStart, markerEnd: pathInfo.markerEnd },
        start: roundPoint(pathInfo.start),
        end: roundPoint(pathInfo.end),
        endpointChecks,
        serviceIntersectionCount: serviceIntersections.length,
        labelIntersectionCount: labelIntersections.length,
      });
    }

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      svg: {
        clientRect: roundRect({
          left: svgRect.left,
          top: svgRect.top,
          right: svgRect.right,
          bottom: svgRect.bottom,
          width: svgRect.width,
          height: svgRect.height,
        }),
        viewBox: svg.getAttribute("viewBox"),
      },
      summary: {
        pathCount: paths.length,
        serviceCount: services.length,
        labelCount: labels.length,
        subzoneCount: subzones.length,
        zoneCount: zones.length,
      },
      findings,
      paths: pathReports,
      services: services.map((item) => ({ id: item.id, kind: item.kind, label: item.label, rect: roundRect(item.rect) })),
      labels: labels.map((item) => ({ id: item.id, kind: item.kind, label: item.label, rect: roundRect(item.rect) })),
    };
  }, {
    sampleStep: options.sampleStep,
    anchorTolerance: options.anchorTolerance,
    endpointNearTolerance: options.endpointNearTolerance,
    anchorSkip: options.anchorSkip,
    expectedBidirectionalEdges: [...EXPECTED_BIDIRECTIONAL_EDGES],
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
