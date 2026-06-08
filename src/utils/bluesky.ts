import { readFileSync } from "node:fs";

function loadBlueskyPosts(): Record<string, string> {
  try {
    return JSON.parse(readFileSync("public/bluesky-posts.json", "utf-8"));
  } catch {
    return {};
  }
}

export function getBlueskyPostUri(postId: string): string | null {
  const posts = loadBlueskyPosts();
  return posts[postId] || posts[`pages/${postId}`] || null;
}

export function atUriToBlueskyUrl(atUri: string): string {
  const m = atUri.match(
    /^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/(.+)$/,
  );
  if (!m) return atUri;
  return `https://bsky.app/profile/${m[1]}/post/${m[2]}`;
}
