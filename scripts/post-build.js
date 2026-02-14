#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "..", "public");
const buildDir = path.join(__dirname, "..", "dist");
const oldPath = path.join(publicDir, "headers.txt");
const newPath = path.join(buildDir, "_headers");

try {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log("✅ Successfully renamed public/headers.txt to dist/_headers");
  } else {
    console.warn(
      "⚠️ headers.txt not found in " + publicDir + ". Skipping rename.",
    );
  }
} catch (err) {
  console.error("❌ Error renaming headers file:", err);
  process.exit(1);
}
