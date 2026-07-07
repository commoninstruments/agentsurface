import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "src/content/docs");
const referencesRoot = path.join(repoRoot, "skills/surface/references");
const templatesRoot = path.join(repoRoot, "templates");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(fullPath));
    } else {
      out.push(fullPath);
    }
  }
  return out;
}

const allFiles = walk(docsRoot);
const mdxFiles = allFiles.filter((file) => file.endsWith(".mdx"));
const metaFiles = allFiles.filter((file) => file.endsWith("meta.json"));

const validRoutes = new Set(["/docs"]);
for (const file of mdxFiles) {
  const rel = path.relative(docsRoot, file).replaceAll(path.sep, "/");
  const route = `/docs/${rel.replace(/\/index\.mdx$/, "").replace(/\.mdx$/, "")}`;
  validRoutes.add(route);
}

function stripCode(content) {
  return content.replaceAll(/```[\s\S]*?```/g, "").replaceAll(/`[^`\n]+`/g, "");
}

function resolveRelativeRoute(fromFile, target) {
  const relFile = path.relative(docsRoot, fromFile);
  const fromDir = path.dirname(relFile);
  const joined = path.normalize(path.join("/", fromDir, target)).replaceAll(path.sep, "/");
  const withoutExt = joined.replace(/\.mdx$/, "");
  const withoutIndex = withoutExt === "/index" ? "" : withoutExt.replace(/\/index$/, "");
  return `/docs${withoutIndex}`;
}

const linkIssues = [];
for (const file of mdxFiles) {
  const source = stripCode(fs.readFileSync(file, "utf-8"));
  const matches = [...source.matchAll(/\]\(([^)]+)\)/g), ...source.matchAll(/href="([^"]+)"/g)];

  for (const match of matches) {
    const raw = match[1].trim();
    if (
      raw === "" ||
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("mailto:") ||
      raw.startsWith("#")
    ) {
      continue;
    }

    const target = raw.split("#")[0];
    let route = null;
    if (target.startsWith("/docs")) {
      route = target.replace(/\/$/, "") || "/docs";
    } else if (target.startsWith("./") || target.startsWith("../")) {
      route = resolveRelativeRoute(file, target);
    } else if (target.startsWith("/")) {
      continue;
    }

    if (route !== null && !validRoutes.has(route)) {
      linkIssues.push(`${path.relative(repoRoot, file)} -> ${raw} (resolved ${route})`);
    }
  }
}

const metaIssues = [];
const docsDirs = fs
  .readdirSync(docsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(docsRoot, entry.name));

for (const dir of docsDirs) {
  const metaPath = path.join(dir, "meta.json");
  if (!fs.existsSync(metaPath)) {
    metaIssues.push(`${path.relative(repoRoot, dir)} is missing meta.json`);
  }
}

for (const metaFile of metaFiles) {
  const dir = path.dirname(metaFile);
  const meta = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
  const entries = (meta.pages ?? []).filter((page) => page !== "---");
  const siblings = fs.readdirSync(dir, { withFileTypes: true });
  const expected = new Set();

  for (const sibling of siblings) {
    if (sibling.name === "meta.json") {
      continue;
    }
    if (sibling.isFile() && sibling.name.endsWith(".mdx")) {
      expected.add(sibling.name.replace(/\.mdx$/, ""));
    }
    if (sibling.isDirectory()) {
      expected.add(sibling.name);
    }
  }

  for (const entry of entries) {
    if (!expected.has(entry)) {
      metaIssues.push(`${path.relative(repoRoot, metaFile)} references missing page "${entry}"`);
    }
  }

  for (const slug of [...expected].toSorted()) {
    if (!entries.includes(slug)) {
      metaIssues.push(`${path.relative(repoRoot, metaFile)} is missing page "${slug}"`);
    }
  }
}

// Template-citation existence check.
//
// Scans docs MDX and skill reference markdown for citations of template files
// (e.g. `templates/foo.ts` or `/templates/errors-and-auth/jwt-validate.ts`) and
// verifies each cited path resolves to a real file under the repo's templates/
// directory. Citations inside fenced code blocks are still real citations, so we
// scan raw content here (no stripCode).
const TEMPLATE_CITATION = /\btemplates\/[A-Za-z0-9._/-]+\.(?:ts|tsx|yaml|json|md|txt|mdc)\b/gi;

function collectFiles(root, extensions) {
  if (!fs.existsSync(root)) {
    return [];
  }
  return walk(root).filter((file) => extensions.some((ext) => file.endsWith(ext)));
}

const templateSourceFiles = [
  ...collectFiles(docsRoot, [".mdx"]),
  ...collectFiles(referencesRoot, [".md"]),
];

const templateIssues = [];
for (const file of templateSourceFiles) {
  const content = fs.readFileSync(file, "utf-8");
  for (const match of content.matchAll(TEMPLATE_CITATION)) {
    // Only treat as a citation if the segment starts with "templates/", optionally
    // preceded by a leading slash. Reject continuations like "sub-templates/foo.ts".
    const before = content[match.index - 1];
    if (before !== undefined && before !== "/" && /[A-Za-z0-9._-]/.test(before)) {
      continue;
    }

    const citedPath = match[0];
    const resolved = path.join(templatesRoot, citedPath.replace(/^templates\//, ""));
    if (!fs.existsSync(resolved)) {
      const line = content.slice(0, match.index).split("\n").length;
      templateIssues.push(
        `${path.relative(repoRoot, file)}:${line} — cited path does not exist: ${citedPath}`,
      );
    }
  }
}

if (linkIssues.length === 0 && metaIssues.length === 0 && templateIssues.length === 0) {
  console.log("docs integrity check passed");
  process.exit(0);
}

if (linkIssues.length > 0) {
  console.error("Broken internal docs links:");
  for (const issue of linkIssues) {
    console.error(`- ${issue}`);
  }
}

if (metaIssues.length > 0) {
  console.error("Docs metadata integrity issues:");
  for (const issue of metaIssues) {
    console.error(`- ${issue}`);
  }
}

if (templateIssues.length > 0) {
  console.error("Broken template citations:");
  for (const issue of templateIssues) {
    console.error(`- ${issue}`);
  }
}

process.exit(1);
