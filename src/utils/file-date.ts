import { statSync } from "node:fs";
import { URL } from "node:url";

interface FileDateInfo {
  datetime: string; // ISO format for datetime attribute
  formatted: string; // Human readable format like "2 May 2026"
}

export function getFileLastModifiedDate(
  relativePath: string,
  importUrl: string,
): FileDateInfo | null {
  try {
    const filePath = new URL(relativePath, importUrl);
    const stats = statSync(filePath);
    const date = stats.mtime; // modification time

    const datetime = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const formatted = date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return { datetime, formatted };
  } catch (error) {
    console.error(`Error getting file date for ${relativePath}:`, error);
    return null;
  }
}
