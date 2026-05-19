import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceExtensions = [".js", ".jsx", ".mjs", ".ts", ".tsx"];
const resolvableExtensions = [
  "",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const trackedFiles = execSync("git ls-files", {
  cwd: repoRoot,
  encoding: "utf8",
})
  .split(/\r?\n/)
  .filter(Boolean)
  .map((file) => file.replaceAll("\\", "/"));

const trackedFileSet = new Set(trackedFiles);
const lowerCasePathMap = new Map();
const errors = [];

for (const file of trackedFiles) {
  const lower = file.toLowerCase();
  const existing = lowerCasePathMap.get(lower);

  if (existing && existing !== file) {
    errors.push(`Case-colliding tracked paths: "${existing}" and "${file}"`);
  } else {
    lowerCasePathMap.set(lower, file);
  }
}

const importPattern =
  /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;

function normalizePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function candidatePaths(basePath) {
  const normalized = normalizePath(basePath);
  const candidates = [];

  for (const extension of resolvableExtensions) {
    candidates.push(`${normalized}${extension}`);
  }

  for (const extension of sourceExtensions) {
    candidates.push(`${normalized}/index${extension}`);
  }

  return candidates;
}

function resolveLocalImport(fromFile, specifier) {
  if (specifier.startsWith("@/")) {
    return candidatePaths(specifier.slice(2));
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const fromDirectory = path.posix.dirname(fromFile);
    return candidatePaths(path.posix.normalize(path.posix.join(fromDirectory, specifier)));
  }

  return [];
}

for (const file of trackedFiles) {
  if (!sourceExtensions.includes(path.posix.extname(file))) {
    continue;
  }

  const absoluteFile = path.join(repoRoot, ...file.split("/"));
  const content = readFileSync(absoluteFile, "utf8");
  const matches = content.matchAll(importPattern);

  for (const match of matches) {
    const specifier = match[1] || match[2] || match[3];
    const candidates = resolveLocalImport(file, specifier);

    if (candidates.length === 0) {
      continue;
    }

    const exactMatch = candidates.find((candidate) => trackedFileSet.has(candidate));
    if (exactMatch) {
      continue;
    }

    const caseInsensitiveMatch = candidates
      .map((candidate) => lowerCasePathMap.get(candidate.toLowerCase()))
      .find(Boolean);

    if (caseInsensitiveMatch) {
      errors.push(`${file}: "${specifier}" should be "${caseInsensitiveMatch}"`);
    } else {
      errors.push(`${file}: "${specifier}" does not resolve to a tracked file`);
    }
  }
}

if (errors.length > 0) {
  console.error("Path casing check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Path casing check passed.");
