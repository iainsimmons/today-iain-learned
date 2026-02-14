#!/usr/bin/env node

import { existsSync, renameSync } from "fs";
import { join } from "path";

const publicDir = join(__dirname, "public");
const oldPath = join(publicDir, "headers.txt");
const newPath = join(publicDir, "_headers");

try {
  if (existsSync(oldPath)) {
    renameSync(oldPath, newPath);
    console.log("Successfully renamed headers.txt to _headers");
  } else {
    console.warn("headers.txt not found. Skipping rename.");
  }
} catch (err) {
  console.error("Error renaming headers file:", err);
  process.exit(1);
}
