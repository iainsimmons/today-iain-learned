#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "..", "public");
const buildDir = path.join(__dirname, "..", "dist");

// Rename redirects.txt -> _redirects in dist/
const redirectsSource = path.join(publicDir, "redirects.txt");
const redirectsDest = path.join(buildDir, "_redirects");
try {
  if (fs.existsSync(redirectsSource)) {
    fs.renameSync(redirectsSource, redirectsDest);
    console.log("✅ Successfully renamed public/redirects.txt to dist/_redirects");
  }
} catch (err) {
  console.error("❌ Error renaming redirects file:", err);
  process.exit(1);
}

// Rename headers.txt -> _headers in dist/
const headersSource = path.join(publicDir, "headers.txt");
const headersDest = path.join(buildDir, "_headers");
try {
  if (fs.existsSync(headersSource)) {
    fs.renameSync(headersSource, headersDest);
    console.log("✅ Successfully renamed public/headers.txt to dist/_headers");
  }
} catch (err) {
  console.error("❌ Error renaming headers file:", err);
  process.exit(1);
}

// Copy .assetsignore.template to dist/.assetsignore
const assetsIgnoreTemplate = path.join(__dirname, "..", ".assetsignore.template");
const assetsIgnoreDest = path.join(buildDir, ".assetsignore");
try {
  if (fs.existsSync(assetsIgnoreTemplate)) {
    fs.copyFileSync(assetsIgnoreTemplate, assetsIgnoreDest);
    console.log("✅ Successfully copied .assetsignore to dist/");
  }
} catch (err) {
  console.warn("⚠️  Could not copy .assetsignore file:", err.message);
}
