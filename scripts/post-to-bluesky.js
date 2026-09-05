#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, relative, sep, join, basename } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { AtpAgent, RichText } from "@atproto/api";

const ROOT = process.cwd();
const CONTENT_DIR = resolve(ROOT, "src", "content");
const POSTS_DIR = resolve(CONTENT_DIR, "posts");
const STATE_PATH = resolve(ROOT, ".sequoia-state.json");
const BSKY_MAP_PATH = resolve(ROOT, "public", "bluesky-posts.json");
const CONFIG_PATH = resolve(ROOT, "src", "config.ts");

function readSiteUrl() {
  try {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    const m = content.match(/site:\s*["']([^"']+)["']/);
    if (m) return m[1].replace(/\/+$/, "");
  } catch {
    // fall through to default
  }
  return "https://til.iainsimmons.com";
}

const SITE_URL = readSiteUrl();

// ─── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
  dryRun: args.includes("--dry-run"),
  force: args.includes("--force"),
  noEdit: args.includes("--no-edit"),
  yes: args.includes("--yes"),
  now: args.includes("--now"),
};
let textOverride = null;
const positionals = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--text") {
    textOverride = args[++i];
  } else if (a.startsWith("--text=")) {
    textOverride = a.slice("--text=".length);
  } else if (a.startsWith("--")) {
    // handled flag
  } else {
    positionals.push(a);
  }
}

if (flags.dryRun) console.log("DRY RUN — no records will be created or modified.\n");

// ─── Env ───────────────────────────────────────────────────────────────────
const PDS_URL = process.env.PDS_URL;
const DID = process.env.DID;
const PUBLICATION_URI = process.env.PUBLICATION_URI;
const BSKY_HANDLE = process.env.BSKY_HANDLE || DID;
let appPassword = process.env.ATP_APP_PASSWORD;

const agent = new AtpAgent({ service: PDS_URL });

// ─── Helpers ───────────────────────────────────────────────────────────────
let _rl = null;
let pipedLines = null;
let pipedIndex = 0;

async function preparePipedInput() {
  if (input.isTTY || pipedLines !== null) return;
  const chunks = [];
  for await (const chunk of input) chunks.push(chunk);
  pipedLines = Buffer.concat(chunks).toString("utf-8").split("\n").map((s) => s.trim());
}

function nextPipedLine() {
  if (pipedLines === null) return undefined;
  const value = pipedLines[pipedIndex++];
  return value === undefined ? "" : value;
}

function sharedRl() {
  if (!_rl) _rl = createInterface({ input, output });
  return _rl;
}
function closeRl() {
  if (_rl) {
    _rl.close();
    _rl = null;
  }
}

function questionTTY(query) {
  return new Promise((resolve) => sharedRl().question(query, resolve));
}

async function promptLine(promptText) {
  if (!input.isTTY) {
    await preparePipedInput();
    const value = nextPipedLine();
    process.stdout.write(`${promptText} ${value === "" ? "(no input)" : value}\n`);
    return value;
  }
  return (await questionTTY(promptText)).trim();
}

function ask(promptText) {
  return promptLine(promptText);
}

function askHidden(promptText) {
  if (!input.isTTY) return promptLine(promptText);
  const i = sharedRl();
  return new Promise((resolveAnswer) => {
    const originalWrite = i._writeToOutput;
    i.muted = false;
    i._writeToOutput = function (str) {
      if (i.muted) output.write("*".repeat(str.length));
      else output.write(str);
    };
    i.question(promptText, (answer) => {
      i._writeToOutput = originalWrite;
      output.write("\n");
      resolveAnswer(answer.trim());
    });
    i.muted = true;
  });
}

function collectMarkdownFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const yaml = m[1];
  const r = {};
  const title = yaml.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (title) r.title = title[1];
  const desc = yaml.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  if (desc) r.description = desc[1];
  const date = yaml.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  if (date) r.date = date[1];
  const atUri = yaml.match(/^atUri:\s*["']?(at:\/\/[^\s"']+)["']?\s*$/m);
  if (atUri) r.atUri = atUri[1];
  const draft = yaml.match(/^draft:\s*(true|false|yes|no)\s*$/m);
  if (draft) r.draft = /^(true|yes)$/.test(draft[1]);
  return r;
}

function deriveSlug(filePath) {
  const relPath = relative(POSTS_DIR, filePath);
  let slug = relPath.replace(/\.md$/, "");
  slug = slug.replace(/\/index$/, "");
  return slug.split(sep).join("/");
}

function normalizeDate(str) {
  if (!str) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str}T00:00:00.000Z`;
  try {
    return new Date(str).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function parseAtUri(uri) {
  const m = uri.match(/^at:\/\/(did:[^/]+)\/([a-zA-Z0-9.]+)\/([a-zA-Z0-9._~:-]+)$/);
  if (!m) return null;
  return { repo: m[1], collection: m[2], rkey: m[3] };
}

function bskyUrlFromUri(uri) {
  const m = uri.match(/^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/(.+)$/);
  return m ? `https://bsky.app/profile/${m[1]}/post/${m[2]}` : uri;
}

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return {};
  }
}

function openInEditor(text) {
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  const dir = mkdtempSync(join(tmpdir(), "bsky-post-"));
  const filePath = join(dir, "post.txt");
  writeFileSync(filePath, text, "utf-8");
  const result = spawnSync(editor, [filePath], { stdio: "inherit", shell: false });
  const edited = readFileSync(filePath, "utf-8").replace(/\n$/, "");
  rmSync(dir, { recursive: true, force: true });
  if (result.status !== 0) {
    console.error("Editor exited with a non-zero status; aborting.");
    process.exit(1);
  }
  return edited;
}

// ─── Select post ───────────────────────────────────────────────────────────
const allPosts = collectMarkdownFiles(POSTS_DIR);
if (allPosts.length === 0) {
  console.error(`No markdown files found in ${POSTS_DIR}`);
  process.exit(1);
}

const bskyMap = loadJson(BSKY_MAP_PATH);

async function findPost(query) {
  const direct = resolve(ROOT, query);
  if (existsSync(direct) && direct.startsWith(POSTS_DIR)) return direct;
  if (query.includes("/") || query.endsWith(".md")) {
    const byPath = allPosts.find((p) => deriveSlug(p) === query || relative(ROOT, p) === query);
    if (byPath) return byPath;
  }
  const bySlug = allPosts.filter((p) => deriveSlug(p) === query);
  if (bySlug.length === 1) return bySlug[0];
  const fuzzy = allPosts.filter((p) => deriveSlug(p).includes(query) || basename(p, ".md").includes(query));
  if (fuzzy.length === 1) return fuzzy[0];
  if (fuzzy.length > 1) {
    console.log(`Multiple posts match "${query}":`);
    fuzzy.forEach((p, i) => console.log(`  ${i + 1}. ${deriveSlug(p)}`));
    const choice = Number(await ask("Select a number: "));
    if (choice >= 1 && choice <= fuzzy.length) return fuzzy[choice - 1];
  }
  return null;
}

async function pickInteractively() {
  const listed = allPosts
    .map((p) => ({ file: p, fm: parseFrontmatter(readFileSync(p, "utf-8")) }))
    .filter(({ fm }) => fm.title);
  listed.sort((a, b) => (a.fm.date || "").localeCompare(b.fm.date || "") || a.file.localeCompare(b.file));
  console.log("Posts in src/content/posts/:\n");
  listed.forEach(({ file, fm }, i) => {
    const badges = [];
    if (fm.draft) badges.push("draft");
    if (bskyMap[deriveSlug(file)]) badges.push("posted");
    const badgeStr = badges.length ? ` [${badges.join(", ")}]` : "";
    console.log(`  ${String(i + 1).padStart(2)}. ${fm.title}${badgeStr}`);
  });
  console.log("");
  const answer = await ask("Post to select (number or partial name, empty to cancel): ");
  if (!answer) return null;
  const num = Number(answer);
  if (Number.isInteger(num) && num >= 1 && num <= listed.length) return listed[num - 1].file;
  const partial = findPost(answer);
  if (partial) return partial;
  console.error(`No post matches "${answer}"`);
  return null;
}

let filePath;
if (positionals.length > 0) {
  filePath = await findPost(positionals[0]);
  if (!filePath) {
    console.error(`Could not find a post matching "${positionals[0]}" in ${POSTS_DIR}`);
    process.exit(1);
  }
} else {
  filePath = await pickInteractively();
  if (!filePath) process.exit(0);
}

const rawContent = readFileSync(filePath, "utf-8");
const fm = parseFrontmatter(rawContent);
const slug = deriveSlug(filePath);
const pageUrl = `${SITE_URL}/posts/${slug}`;
const relPath = relative(ROOT, filePath);

console.log(`Post: ${fm.title}`);
console.log(`  File: ${relPath}`);
console.log(`  Slug: ${slug}`);
console.log(`  URL:  ${pageUrl}`);

if (fm.draft) {
  if (!flags.force && !flags.yes) {
    const ok = await ask("This post is marked as a draft. Publish its Bluesky cross-post anyway? (y/N) ");
    if (!/^y/i.test(ok)) process.exit(0);
  } else {
    console.log("  (Note: post is marked as a draft)");
  }
}

// ─── Verify published as site.standard.document ─────────────────────────────
if (!PDS_URL || !DID || !PUBLICATION_URI) {
  console.error("PDS_URL, DID, and PUBLICATION_URI must be set in .env");
  process.exit(1);
}

if (!fm.atUri) {
  console.error(
    `\nThis post has no atUri in its frontmatter, so it has not been published as a site.standard.document.\n` +
      `Publish it first with either:\n` +
      `  pnpm exec sequoia publish ${relPath}\n` +
      `  node --env-file=.env scripts/publish-page.js ${relPath}\n`,
  );
  process.exit(1);
}

const parsedAtUri = parseAtUri(fm.atUri);
if (!parsedAtUri) {
  console.error(`Cannot parse atUri: ${fm.atUri}`);
  process.exit(1);
}
if (parsedAtUri.collection !== "site.standard.document") {
  console.error(`Expected atUri to reference a site.standard.document, got: ${parsedAtUri.collection}`);
  process.exit(1);
}

let docRecord;
try {
  const res = await agent.api.com.atproto.repo.getRecord({
    repo: parsedAtUri.repo,
    collection: parsedAtUri.collection,
    rkey: parsedAtUri.rkey,
  });
  docRecord = res.data;
} catch {
  console.error(
    `\nCould not fetch the site.standard.document record on the PDS:\n  ${fm.atUri}\n` +
      `The post has not (yet) been published to the PDS. Publish it first with:\n` +
      `  pnpm exec sequoia publish ${relPath}\n` +
      `  node --env-file=.env scripts/publish-page.js ${relPath}\n`,
  );
  process.exit(1);
}
if (docRecord.value.$type && docRecord.value.$type !== "site.standard.document") {
  console.error(
    `Record ${fm.atUri} is a ${docRecord.value.$type}, not a site.standard.document`,
  );
  process.exit(1);
}
const docCid = docRecord.cid;
console.log(`  Verified site.standard.document on PDS: ${fm.atUri}`);

// ─── Guard: already posted ──────────────────────────────────────────────────
const existingBsky =
  bskyMap[slug] ||
  loadJson(STATE_PATH).posts?.[relPath]?.bskyPostRef?.uri ||
  docRecord.value.bskyPostRef?.uri;
if (existingBsky && !flags.force) {
  console.error(
    `\nThis post already has a Bluesky post:\n  ${bskyUrlFromUri(existingBsky)}\n` +
      `Use --force to create another one anyway.`,
  );
  process.exit(1);
}

// ─── Auth ───────────────────────────────────────────────────────────────────
if (!appPassword) {
  console.log("ATP_APP_PASSWORD is not set. Enter your Bluesky app password:");
  appPassword = await askHidden("  App password: ");
  if (!appPassword) {
    console.error("No app password provided; aborting.");
    process.exit(1);
  }
}

await agent.login({ identifier: BSKY_HANDLE, password: appPassword });
console.log(`  Authenticated as ${BSKY_HANDLE}`);

// ─── Compose content ────────────────────────────────────────────────────────
const urlLine = pageUrl;
let postText = textOverride;
if (postText == null) {
  postText = `${fm.description || ""}\n${urlLine}`;
}
if (!postText.trim()) {
  console.error("Post text is empty; aborting.");
  process.exit(1);
}

if (!flags.noEdit && textOverride == null && !flags.dryRun) {
  closeRl();
  console.log("  Opening editor to customise the Bluesky post content…");
  postText = openInEditor(postText);
}

const rt = new RichText({ text: postText });
await rt.detectFacets(agent);
if (rt.graphemeLength > 300) {
  console.error(`Post text is ${rt.graphemeLength} graphemes; Bluesky limit is 300. Aborting.`);
  process.exit(1);
}

const createdAt = flags.now ? new Date().toISOString() : normalizeDate(fm.date);

const embed = {
  $type: "app.bsky.embed.external",
  external: {
    uri: pageUrl,
    title: fm.title,
    description: fm.description || "",
    associatedRefs: [
      { $type: "com.atproto.repo.strongRef", uri: fm.atUri, cid: docCid },
    ],
  },
};
try {
  const pubRes = await agent.api.com.atproto.repo.getRecord({
    repo: parsedAtUri.repo,
    collection: "site.standard.publication",
    rkey: PUBLICATION_URI.split("/").pop(),
  });
  embed.external.associatedRefs.push({
    $type: "com.atproto.repo.strongRef",
    uri: PUBLICATION_URI,
    cid: pubRes.data.cid,
  });
} catch {
  console.log("  (Warning: could not resolve publication record cid; omitting it from associatedRefs)");
}

const postRecord = {
  $type: "app.bsky.feed.post",
  text: rt.text,
  facets: rt.facets,
  createdAt,
  embed,
};

// ─── Preview ────────────────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────────────");
console.log("Bluesky post preview");
console.log("─────────────────────────────────────────────");
console.log(postText);
console.log("");
console.log(`URL:      ${pageUrl}`);
if (postRecord.facets?.length) {
  console.log(`Facets:   ${postRecord.facets.length} (byte-based, e.g. ${JSON.stringify(postRecord.facets[0].features[0]?.$type)})`);
} else {
  console.log("Facets:   none");
}
console.log(`createdAt: ${createdAt}`);
console.log("Embed:");
console.log(JSON.stringify(embed, null, 2));
console.log("─────────────────────────────────────────────\n");

if (flags.dryRun) {
  console.log("DRY RUN — would:");
  console.log("  1. createRecord  app.bsky.feed.post  on the PDS with the record above");
  console.log(`  2. putRecord     site.standard.document  ${fm.atUri}  (add bskyPostRef)`);
  console.log(`  3. update        ${relPath} entry in .sequoia-state.json`);
  console.log("  4. rebuild       public/bluesky-posts.json via scripts/extract-bsky-posts.js");
  console.log("\nNo changes were made.");
  process.exit(0);
}

if (!flags.yes) {
  const ok = await ask("Publish this Bluesky post? (y/N) ");
  if (!/^y/i.test(ok)) {
    console.log("Aborted.");
    process.exit(0);
  }
}

// ─── Publish ────────────────────────────────────────────────────────────────
const createRes = await agent.api.com.atproto.repo.createRecord({
  repo: DID,
  collection: "app.bsky.feed.post",
  record: postRecord,
});
const bskyUri = createRes.data.uri;
const bskyCid = createRes.data.cid;
console.log(`\nCreated Bluesky post: ${bskyUri}`);
console.log(`  ${bskyUrlFromUri(bskyUri)}`);

// ─── Wire up: document bskyPostRef ──────────────────────────────────────────
const docValue = { ...docRecord.value, bskyPostRef: { uri: bskyUri, cid: bskyCid } };
await agent.api.com.atproto.repo.putRecord({
  repo: parsedAtUri.repo,
  collection: "site.standard.document",
  rkey: parsedAtUri.rkey,
  record: docValue,
});
console.log(`  Updated document bskyPostRef: ${bskyUri}`);

// ─── Wire up: .sequoia-state.json ───────────────────────────────────────────
const state = loadJson(STATE_PATH);
if (!state.posts) state.posts = {};
state.posts[relPath] = {
  contentHash: sha256(rawContent),
  atUri: fm.atUri,
  lastPublished: new Date().toISOString(),
  slug,
  bskyPostRef: { uri: bskyUri, cid: bskyCid },
};
writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf-8");
console.log("  Updated .sequoia-state.json");

// ─── Wire up: rebuild bluesky-posts.json ────────────────────────────────────
execSync("node scripts/extract-bsky-posts.js", { cwd: ROOT, stdio: "inherit" });

closeRl();
console.log(`\nDone. Bluesky post: ${bskyUrlFromUri(bskyUri)}`);