#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const ENV_PATH = resolve(process.cwd(), ".env");

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

function questionTTY(query) {
  return new Promise((resolve) => sharedRl().question(query, resolve));
}

async function promptLine(promptText, defaultValue) {
  const hint = defaultValue ? ` [${defaultValue}]` : "";
  if (!input.isTTY) {
    await preparePipedInput();
    const value = nextPipedLine() || defaultValue || "";
    process.stdout.write(`${promptText}${hint} ${value === "" ? "(no input)" : value}\n`);
    return value;
  }
  const answer = (await questionTTY(`${promptText}${hint}: `)).trim();
  return answer || defaultValue || "";
}

function ask(promptText, defaultValue) {
  return promptLine(promptText, defaultValue);
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

function loadEnv() {
  const env = {};
  if (!existsSync(ENV_PATH)) return env;
  for (const line of readFileSync(ENV_PATH, "utf-8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function saveEnv(env) {
  const lines = [
    "# Bluesky / AT Protocol publishing credentials",
    `PDS_URL=${env.PDS_URL}`,
    `DID=${env.DID}`,
    `BSKY_HANDLE=${env.BSKY_HANDLE}`,
    `PUBLICATION_URI=${env.PUBLICATION_URI}`,
    `ATP_APP_PASSWORD=${env.ATP_APP_PASSWORD}`,
  ];
  writeFileSync(ENV_PATH, lines.join("\n") + "\n", "utf-8");
}

console.log("Bluesky publishing setup — writes to .env\n");

const env = loadEnv();
const existing = (key) => (env[key] ? `${env[key]}` : "");

env.PDS_URL = await ask("PDS URL", existing("PDS_URL"));
env.DID = await ask("DID", existing("DID"));
env.BSKY_HANDLE = await ask("Bluesky handle", existing("BSKY_HANDLE"));
env.PUBLICATION_URI = await ask("site.standard.publication URI", existing("PUBLICATION_URI"));

if (env.ATP_APP_PASSWORD) {
  const keep = await ask("Keep existing ATP_APP_PASSWORD", "yes");
  if (!/^y/i.test(keep)) {
    env.ATP_APP_PASSWORD = "";
  }
}
if (!env.ATP_APP_PASSWORD) {
  const password = await askHidden("App password: ");
  if (password) env.ATP_APP_PASSWORD = password;
}

if (!env.ATP_APP_PASSWORD) {
  console.error("ATP_APP_PASSWORD is required to publish; aborting.");
  _rl?.close();
  process.exit(1);
}

saveEnv(env);
_rl?.close();
console.log(`\nWrote ${ENV_PATH}`);
console.log("  (This file is gitignored; the app password is not committed.)");