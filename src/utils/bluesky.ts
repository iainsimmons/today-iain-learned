import { readFileSync } from "node:fs";

interface SequoiaPostState {
  bskyPostRef?: { uri: string; cid: string };
  slug: string;
  [key: string]: unknown;
}

function loadSequoiaState(): Record<string, SequoiaPostState> | null {
  try {
    const content = readFileSync(".sequoia-state.json", "utf-8");
    return JSON.parse(content).posts;
  } catch {
    return null;
  }
}

export function getBlueskyPostUri(postId: string): string | null {
  const posts = loadSequoiaState();
  if (!posts) return null;

  for (const data of Object.values(posts)) {
    if (data.slug === postId && data.bskyPostRef?.uri) {
      return data.bskyPostRef.uri;
    }
  }

  return null;
}

export function atUriToBlueskyUrl(atUri: string): string {
  const m = atUri.match(
    /^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/(.+)$/,
  );
  if (!m) return atUri;
  return `https://bsky.app/profile/${m[1]}/post/${m[2]}`;
}
