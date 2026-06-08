#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, relative, sep, join } from "node:path";
import { AtpAgent } from "@atproto/api";

const ROOT = process.cwd();
const CONTENT_DIR = resolve(ROOT, "src", "content");
const STATE_PATH = resolve(ROOT, ".sequoia-state.json");
const OUTPUT_PATH = resolve(ROOT, "public", "bluesky-posts.json");

const PDS_URL = process.env.PDS_URL;
if (!PDS_URL) {
  console.error("PDS_URL is not set. Set it in .env");
  process.exit(1);
}

const agent = new AtpAgent({ service: PDS_URL });

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
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  const m = yaml.match(/^atUri:\s*["']?(at:\/\/[^\s"']+)["']?\s*$/m);
  if (m) result.atUri = m[1];
  return result;
}

function deriveKey(filePath) {
  const relPath = relative(CONTENT_DIR, filePath);
  let key = relPath.replace(/\.md$/, "");
  key = key.replace(/\/index$/, "");
  const parts = key.split(sep);
  const collection = parts[0];
  if (collection === "posts") {
    return parts.slice(1).join("/");
  }
  return key;
}

async function fetchBskyPostRefFromPDS(atUri) {
  const parsed = atUri.match(/^at:\/\/(did:[^/]+)\/([a-zA-Z0-9.]+)\/([a-zA-Z0-9._~:-]+)$/);
  if (!parsed) return null;
  const [, repo, collection, rkey] = parsed;
  try {
    const res = await agent.api.com.atproto.repo.getRecord({
      repo,
      collection,
      rkey,
    });
    const val = res.data.value;
    if (val?.bskyPostRef?.uri) {
      return val.bskyPostRef.uri;
    }
  } catch {
    // PDS unreachable or record not found — handled by caller
  }
  return null;
}

function loadSequoiaMapping() {
  if (!existsSync(STATE_PATH)) return {};
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    const map = {};
    for (const data of Object.values(state.posts || {})) {
      if (data.bskyPostRef?.uri && data.slug) {
        map[data.slug] = data.bskyPostRef.uri;
      }
    }
    return map;
  } catch {
    return {};
  }
}

async function main() {
  const mapping = {};
  const sequoiaMap = loadSequoiaMapping();

  const mdFiles = collectMarkdownFiles(CONTENT_DIR);
  const withAtUri = [];

  for (const file of mdFiles) {
    const content = readFileSync(file, "utf-8");
    const fm = parseFrontmatter(content);
    if (fm.atUri) {
      withAtUri.push({ file, atUri: fm.atUri });
    }
  }

  if (withAtUri.length === 0) {
    console.log(
      "No files with atUri frontmatter found. Falling back to .sequoia-state.json entirely.",
    );
    writeFileSync(OUTPUT_PATH, JSON.stringify(sequoiaMap, null, 2));
    console.log(
      `Bluesky post mapping: ${Object.keys(sequoiaMap).length} entries (from Sequoia state)`,
    );
    return;
  }

  console.log(
    `Found ${withAtUri.length} files with atUri frontmatter. Fetching records from PDS...`,
  );

  let pdsSucceeded = 0;
  let pdsFailed = 0;
  let fromSequoia = 0;

  for (const { file, atUri } of withAtUri) {
    const key = deriveKey(file);
    const bskyUri = await fetchBskyPostRefFromPDS(atUri);
    if (bskyUri) {
      mapping[key] = bskyUri;
      pdsSucceeded++;
    } else if (sequoiaMap[key]) {
      mapping[key] = sequoiaMap[key];
      fromSequoia++;
    } else {
      pdsFailed++;
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(mapping, null, 2));

  const stats = [`Bluesky post mapping: ${Object.keys(mapping).length} entries`];
  if (pdsSucceeded > 0) stats.push(`${pdsSucceeded} from PDS`);
  if (fromSequoia > 0) stats.push(`${fromSequoia} from .sequoia-state.json fallback`);
  if (pdsFailed > 0) stats.push(`${pdsFailed} skipped (no Bluesky post ref found)`);
  console.log(stats.join(" | "));
}

main().catch((e) => {
  console.error("extract-bsky-posts.js failed:", e);
  process.exit(1);
});
