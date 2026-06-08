#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, relative, sep } from "node:path";
import { createHash } from "node:crypto";
import { AtpAgent } from "@atproto/api";

const ROOT = process.cwd();
const CONTENT_DIR = resolve(ROOT, "src", "content");
const STATE_PATH = resolve(ROOT, ".sequoia-state.json");
const PDS_URL = process.env.PDS_URL;
const DID = process.env.DID;
const PUBLICATION_URI = process.env.PUBLICATION_URI;
if (!PDS_URL || !DID || !PUBLICATION_URI) {
  console.error("PDS_URL, DID, and PUBLICATION_URI must be set in .env");
  process.exit(1);
}

const S32_CHARS = "234567abcdefghijklmnopqrstuvwxyz";
const agent = new AtpAgent({ service: PDS_URL });

function s32encode(n) {
  if (n === 0) return S32_CHARS[0];
  let str = "";
  let remaining = n;
  while (remaining > 0) {
    str = S32_CHARS[remaining % 32] + str;
    remaining = Math.floor(remaining / 32);
  }
  return str;
}

function generateTID() {
  return s32encode(Date.now() * 1000) + s32encode(Math.floor(Math.random() * 32));
}

function parseFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const yaml = m[1];
  const r = { yaml, raw: m[0] };
  const title = yaml.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (title) r.title = title[1];
  const desc = yaml.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  if (desc) r.description = desc[1];
  const date = yaml.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  if (date) r.date = date[1];
  const atUri = yaml.match(/^atUri:\s*["']?(at:\/\/[^\s"']+)["']?\s*$/m);
  if (atUri) r.atUri = atUri[1];
  return r;
}

function deriveRecordPath(filePath) {
  const relPath = relative(CONTENT_DIR, filePath);
  let key = relPath.replace(/\.md$/, "");
  key = key.replace(/\/index$/, "");
  const parts = key.split(sep);
  const collection = parts[0];
  const slug = parts.slice(1).join("/");
  if (collection === "pages") return `/${slug}`;
  if (collection === "posts") return `/posts/${slug}`;
  if (collection === "projects") return `/projects/${slug}`;
  if (collection === "docs") return `/docs/${slug}`;
  return `/${collection}/${slug}`;
}

function deriveMappingKey(filePath) {
  const relPath = relative(CONTENT_DIR, filePath);
  let key = relPath.replace(/\.md$/, "");
  key = key.replace(/\/index$/, "");
  const parts = key.split(sep);
  if (parts[0] === "posts") return parts.slice(1).join("/");
  return key;
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

// ─── CLI ────────────────────────────────────────────────────────────────────
const fileArg = process.argv[2];
if (!fileArg) {
  console.error(
    "Usage: node --env-file=.env scripts/publish-page.js <path-to-markdown-file>",
  );
  console.error("  ATP_APP_PASSWORD and BSKY_HANDLE (optional) must be set in .env");
  process.exit(1);
}

const filePath = resolve(ROOT, fileArg);
if (!existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}
if (!filePath.startsWith(CONTENT_DIR)) {
  console.error(`File must be within ${CONTENT_DIR}`);
  process.exit(1);
}

// ─── Parse ──────────────────────────────────────────────────────────────────
const rawContent = readFileSync(filePath, "utf-8");
const fm = parseFrontmatter(rawContent);
if (!fm.title) {
  console.error("Frontmatter must include a title field");
  process.exit(1);
}

const recordPath = deriveRecordPath(filePath);
const mappingKey = deriveMappingKey(filePath);
const publishedAt = normalizeDate(fm.date);

console.log(`Publishing: ${fm.title}`);
console.log(`  Record path: ${recordPath}`);
console.log(`  Mapping key: ${mappingKey}`);
console.log(`  Published:   ${publishedAt}`);

// ─── Determine rkey ─────────────────────────────────────────────────────────
let rkey;
let isNew = false;

if (fm.atUri) {
  const parsed = fm.atUri.match(
    /^at:\/\/did:[^/]+\/[a-zA-Z0-9.]+\/([a-zA-Z0-9._~:-]+)$/,
  );
  if (!parsed) {
    console.error(`Cannot parse rkey from existing atUri: ${fm.atUri}`);
    process.exit(1);
  }
  rkey = parsed[1];
  console.log(`  Existing rkey: ${rkey}`);
} else {
  rkey = generateTID();
  isNew = true;
  console.log(`  New rkey: ${rkey}`);
}

// ─── Fetch existing record (to preserve bskyPostRef) ────────────────────────
let existingBskyPostRef = null;

if (!isNew) {
  try {
    const res = await agent.api.com.atproto.repo.getRecord({
      repo: DID,
      collection: "site.standard.document",
      rkey,
    });
    if (res.data.value?.bskyPostRef) {
      existingBskyPostRef = res.data.value.bskyPostRef;
    }
  } catch {
    isNew = true;
    console.log("  Existing record not found on PDS, creating new one");
  }
}

// Also check Sequoia state for bskyPostRef
if (!existingBskyPostRef && existsSync(STATE_PATH)) {
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    const relPath = relative(ROOT, filePath);
    const entry = state.posts?.[relPath];
    if (entry?.bskyPostRef) {
      existingBskyPostRef = entry.bskyPostRef;
      console.log("  Found bskyPostRef in Sequoia state");
    }
  } catch {}
}

// ─── Authenticate ────────────────────────────────────────────────────────────
const identifier = process.env.BSKY_HANDLE || DID;
const appPassword = process.env.ATP_APP_PASSWORD;
if (!appPassword) {
  console.error("Error: ATP_APP_PASSWORD environment variable must be set in .env");
  process.exit(1);
}

await agent.login({ identifier, password: appPassword });
console.log("  Authenticated to PDS");

// ─── Try to discover bskyPostRef from author's recent posts ─────────────────
if (!existingBskyPostRef) {
  try {
    const configPath = resolve(ROOT, "src", "config.ts");
    const configContent = readFileSync(configPath, "utf-8");
    const siteMatch = configContent.match(/site:\s*["']([^"']+)["']/);
    const SITE_URL = siteMatch?.[1];

    if (SITE_URL) {
      const pageUrl = `${SITE_URL.replace(/\/+$/, "")}${recordPath}`;
      console.log(`  Scanning recent posts for embeds matching: ${pageUrl}`);

      const listRes = await agent.api.com.atproto.repo.listRecords({
        repo: DID,
        collection: "app.bsky.feed.post",
        limit: 100,
      });

      for (const rec of listRes.data.records) {
        const val = rec.value;
        const external = val?.embed?.external;
        const refs = external?.associatedRefs;
        const found =
          external?.uri === pageUrl ||
          refs?.some((r) => r.uri === pageUrl || r.uri === fm.atUri);

        if (found) {
          existingBskyPostRef = { uri: rec.uri, cid: rec.cid };
          console.log(`  Found matching Bluesky post: ${rec.uri}`);
          break;
        }
      }

      if (!existingBskyPostRef) {
        console.log("  No matching Bluesky post found in recent posts");
      }
    } else {
      console.log("  Could not determine site URL from config");
    }
  } catch (e) {
    console.log(`  Error scanning recent posts: ${e.message}`);
  }
}

// ─── Build & publish record ─────────────────────────────────────────────────
const record = {
  path: recordPath,
  site: PUBLICATION_URI,
  $type: "site.standard.document",
  title: fm.title,
  description: fm.description || "",
  publishedAt,
};
if (existingBskyPostRef) {
  record.bskyPostRef = existingBskyPostRef;
}

const putResult = await agent.api.com.atproto.repo.putRecord({
  repo: DID,
  collection: "site.standard.document",
  rkey,
  record,
});
const newAtUri = putResult.data.uri;
console.log(`  Published: ${newAtUri}`);

// ─── Update file frontmatter ────────────────────────────────────────────────
let updatedContent;

if (fm.atUri) {
  // Replace existing atUri line
  updatedContent = rawContent.replace(
    /^atUri:\s*["']?.+["']?\s*$/m,
    `atUri: "${newAtUri}"`,
  );
} else {
  // Append atUri before closing frontmatter delimiter
  updatedContent = rawContent.replace(
    /^---\s*\n([\s\S]*?)\n---/,
    (_, yamlContent) => `---\n${yamlContent}\natUri: "${newAtUri}"\n---`,
  );
}

writeFileSync(filePath, updatedContent, "utf-8");
console.log(`  Updated file frontmatter`);

// ─── Update .sequoia-state.json ─────────────────────────────────────────────
let state = { posts: {} };
if (existsSync(STATE_PATH)) {
  try {
    state = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
  } catch {}
}
if (!state.posts) state.posts = {};

const relPath = relative(ROOT, filePath);
state.posts[relPath] = {
  contentHash: sha256(rawContent),
  atUri: newAtUri,
  lastPublished: new Date().toISOString(),
  slug: mappingKey,
};
if (existingBskyPostRef) {
  state.posts[relPath].bskyPostRef = existingBskyPostRef;
}

writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
console.log("  Updated .sequoia-state.json");

// ─── Rebuild bluesky-posts.json ──────────────────────────────────────────────
execSync("node scripts/extract-bsky-posts.js", { cwd: ROOT, stdio: "inherit" });

console.log(`\nDone: ${fm.title} → ${newAtUri}`);
