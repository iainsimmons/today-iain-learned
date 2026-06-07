#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const statePath = resolve(ROOT, ".sequoia-state.json");
const outputPath = resolve(ROOT, "public", "bluesky-posts.json");

const mapping = {};
if (existsSync(statePath)) {
  const state = JSON.parse(readFileSync(statePath, "utf-8"));
  for (const data of Object.values(state.posts || {})) {
    if (data.bskyPostRef?.uri) {
      mapping[data.slug] = data.bskyPostRef.uri;
    }
  }
}

writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
console.log(
  `\u{1F4DD} Bluesky post mapping: ${Object.keys(mapping).length} entries`,
);
