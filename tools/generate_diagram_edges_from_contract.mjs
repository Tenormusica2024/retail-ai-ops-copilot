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

const DEFAULT_OUT = "outputs/edge-contract-generated.json";
const DEFAULT_SNIPPET = "outputs/edge-contract-generated.svg.txt";
const SUPPORTED_ANCHORS = new Set(["left", "right", "top", "bottom", "center"]);

function parseArgs(argv) {
  const options = {
    html: "",
    contract: "",
    out: DEFAULT_OUT,
    snippet: DEFAULT_SNIPPET,
    screenshot: "",
    viewportWidth: 1440,
    viewportHeight: 900,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--html") options.html = argv[++index];
    else if (value === "--contract") options.contract = argv[++index];
    else if (value === "--out") options.out = argv[++index];
    else if (value === "--snippet") options.snippet = argv[++index];
    else if (value === "--screenshot") options.screenshot = argv[++index];
    else if (value === "--viewport-width") options.viewportWidth = Number(argv[++index]);
    else if (value === "--viewport-height") options.viewportHeight = Number(argv[++index]);
    else if (value === "--no-snippet") options.snippet = "";
    else if (value === "-h" || value === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${value}`);
    }
  }

  if (!options.html || !options.contract) {
    throw new Error("--html and --contract are required");
  }
  return options;
}

function printHelp() {
  console.log(`Usage:
  node tools/generate_diagram_edges_from_contract.mjs --html <diagram.html> --contract <edge-contract.json>

Options:
  --out <path>              JSON report path. Default: ${DEFAULT_OUT}
  --snippet <path>          SVG path snippet path. Default: ${DEFAULT_SNIPPET}
  --no-snippet              Skip snippet output
  --screenshot <path>       Optional rendered screenshot for debugging
  --viewport-width <px>     Browser viewport width. Default: 1440
  --viewport-height <px>    Browser viewport height. Default: 900

The tool renders the HTML, measures node rectangles, converts DOM coordinates
into the SVG coordinate system, and generates path d values from from/to node
anchors. It does not mutate the source HTML.`);
}

function ensureParent(filePath) {
  if (!filePath) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function absoluteFromCwd(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildPathElement(edge) {
  const attrs = [
    ["class", edge.className],
    ["data-edge", edge.id],
    ["d", edge.d],
    ["marker-start", edge.markerStart],
    ["marker-end", edge.markerEnd],
  ].filter(([, value]) => value);

  return `<path ${attrs.map(([name, value]) => `${name}="${escapeHtml(value)}"`).join(" ")}></path>`;
}

function normalizeContract(contract) {
  if (contract.version !== 1) {
    throw new Error(`Unsupported contract version: ${contract.version}`);
  }
  if (!Array.isArray(contract.edges) || contract.edges.length === 0) {
    throw new Error("contract.edges must contain at least one edge");
  }
  return {
    svgSelector: contract.svgSelector || "svg.connectors",
    nodeSelectorAttribute: contract.nodeSelectorAttribute || "data-node-id",
    edges: contract.edges,
  };
}

const options = parseArgs(process.argv.slice(2));
const htmlPath = absoluteFromCwd(options.html);
const contractPath = absoluteFromCwd(options.contract);
const outPath = absoluteFromCwd(options.out);
const snippetPath = options.snippet ? absoluteFromCwd(options.snippet) : "";
const screenshotPath = options.screenshot ? absoluteFromCwd(options.screenshot) : "";
const contract = normalizeContract(readJson(contractPath));

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

  const generated = await page.evaluate((input) => {
    const supportedAnchors = new Set(input.supportedAnchors);
    const svg = document.querySelector(input.contract.svgSelector);
    if (!svg) {
      throw new Error(`SVG was not found: ${input.contract.svgSelector}`);
    }
    const screenToSvg = svg.getScreenCTM()?.inverse();
    if (!screenToSvg) {
      throw new Error("Could not convert screen coordinates to SVG coordinates");
    }

    const point = svg.createSVGPoint();
    const toSvgPoint = (x, y) => {
      point.x = x;
      point.y = y;
      const converted = point.matrixTransform(screenToSvg);
      return { x: converted.x, y: converted.y };
    };

    const round = (value) => {
      const rounded = Math.round(value * 100) / 100;
      return Object.is(rounded, -0) ? 0 : rounded;
    };
    const fmt = (value) => Number.isInteger(round(value)) ? String(round(value)) : String(round(value));
    const escapeAttrValue = (value) => String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const selectorForEndpoint = (endpoint) => {
      if (endpoint.selector) return endpoint.selector;
      if (!endpoint.node) throw new Error("Endpoint requires node or selector");
      return `[${input.contract.nodeSelectorAttribute}="${escapeAttrValue(endpoint.node)}"]`;
    };

    const rectToSvg = (element) => {
      const rect = element.getBoundingClientRect();
      const points = [
        toSvgPoint(rect.left, rect.top),
        toSvgPoint(rect.right, rect.top),
        toSvgPoint(rect.right, rect.bottom),
        toSvgPoint(rect.left, rect.bottom),
      ];
      const xs = points.map((item) => item.x);
      const ys = points.map((item) => item.y);
      return {
        left: Math.min(...xs),
        top: Math.min(...ys),
        right: Math.max(...xs),
        bottom: Math.max(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    };

    const pointForAnchor = (rect, endpoint) => {
      const anchor = endpoint.anchor || "center";
      if (!supportedAnchors.has(anchor)) {
        throw new Error(`Unsupported anchor "${anchor}" for ${endpoint.node || endpoint.selector}`);
      }
      const offset = endpoint.offset || {};
      const base = {
        left: { x: rect.left, y: rect.top + rect.height / 2 },
        right: { x: rect.right, y: rect.top + rect.height / 2 },
        top: { x: rect.left + rect.width / 2, y: rect.top },
        bottom: { x: rect.left + rect.width / 2, y: rect.bottom },
        center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      }[anchor];
      return {
        x: base.x + Number(offset.x || 0),
        y: base.y + Number(offset.y || 0),
        anchor,
      };
    };

    const resolveEndpoint = (endpoint) => {
      const selector = selectorForEndpoint(endpoint);
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Endpoint element was not found: ${selector}`);
      }
      const rect = rectToSvg(element);
      const anchor = pointForAnchor(rect, endpoint);
      return {
        node: endpoint.node || selector,
        selector,
        anchor: anchor.anchor,
        point: { x: round(anchor.x), y: round(anchor.y) },
        rect: {
          left: round(rect.left),
          top: round(rect.top),
          right: round(rect.right),
          bottom: round(rect.bottom),
          width: round(rect.width),
          height: round(rect.height),
        },
      };
    };

    const defaultOrientation = (from, to) => {
      if ((from.anchor === "left" || from.anchor === "right") && (to.anchor === "left" || to.anchor === "right")) {
        return "horizontal-first";
      }
      if ((from.anchor === "top" || from.anchor === "bottom") && (to.anchor === "top" || to.anchor === "bottom")) {
        return "vertical-first";
      }
      if (from.anchor === "left" || from.anchor === "right") return "horizontal-first";
      return "vertical-first";
    };

    const pathFromPoints = (points) => {
      const commands = [`M ${fmt(points[0].x)} ${fmt(points[0].y)}`];
      for (const current of points.slice(1)) {
        commands.push(`L ${fmt(current.x)} ${fmt(current.y)}`);
      }
      return commands.join(" ");
    };

    const buildOrthogonalPath = (from, to, route = {}) => {
      const start = from.point;
      const end = to.point;
      if (Array.isArray(route.via) && route.via.length > 0) {
        return pathFromPoints([
          start,
          ...route.via.map((item) => ({ x: Number(item.x), y: Number(item.y) })),
          end,
        ]);
      }

      const orientation = route.orientation || defaultOrientation(from, to);
      if (orientation === "horizontal-first") {
        const midX = route.midX !== undefined ? Number(route.midX) : (start.x + end.x) / 2;
        return `M ${fmt(start.x)} ${fmt(start.y)} H ${fmt(midX)} V ${fmt(end.y)} H ${fmt(end.x)}`;
      }
      if (orientation === "vertical-first") {
        const midY = route.midY !== undefined ? Number(route.midY) : (start.y + end.y) / 2;
        return `M ${fmt(start.x)} ${fmt(start.y)} V ${fmt(midY)} H ${fmt(end.x)} V ${fmt(end.y)}`;
      }
      throw new Error(`Unsupported orthogonal route orientation: ${orientation}`);
    };

    const buildPath = (from, to, route = {}) => {
      const routeType = route.type || "orthogonal";
      if (routeType === "straight") {
        return `M ${fmt(from.point.x)} ${fmt(from.point.y)} L ${fmt(to.point.x)} ${fmt(to.point.y)}`;
      }
      if (routeType === "orthogonal") {
        return buildOrthogonalPath(from, to, route);
      }
      throw new Error(`Unsupported route type: ${routeType}`);
    };

    return input.contract.edges.map((edge) => {
      if (!edge.id) throw new Error("Every edge requires an id");
      const from = resolveEndpoint(edge.from);
      const to = resolveEndpoint(edge.to);
      const markerStart = edge.markerStart || (edge.bidirectional ? edge.marker : "");
      const markerEnd = edge.markerEnd || edge.marker || "";
      return {
        id: edge.id,
        className: edge.className || "",
        markerStart,
        markerEnd,
        from,
        to,
        route: edge.route || { type: "orthogonal" },
        d: buildPath(from, to, edge.route || {}),
      };
    });
  }, {
    contract,
    supportedAnchors: [...SUPPORTED_ANCHORS],
  });

  const report = {
    generatedAt: new Date().toISOString(),
    html: path.relative(process.cwd(), htmlPath),
    contract: path.relative(process.cwd(), contractPath),
    summary: {
      edgeCount: generated.length,
      svgSelector: contract.svgSelector,
      nodeSelectorAttribute: contract.nodeSelectorAttribute,
    },
    edges: generated,
    svgSnippet: generated.map(buildPathElement).join("\n"),
  };

  writeJson(outPath, report);
  if (snippetPath) {
    ensureParent(snippetPath);
    fs.writeFileSync(snippetPath, `${report.svgSnippet}\n`);
  }

  console.log(`Edge contract generation: PASS`);
  console.log(`Generated ${generated.length} edge path(s).`);
  console.log(`Report: ${path.relative(process.cwd(), outPath)}`);
  if (snippetPath) console.log(`Snippet: ${path.relative(process.cwd(), snippetPath)}`);
} finally {
  await browser.close();
}
