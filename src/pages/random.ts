import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { shouldShowPost } from "@/utils/markdown";

export const prerender = false;

export const GET: APIRoute = async () => {
  const posts = await getCollection("posts");
  const isDev = import.meta.env.DEV;
  const visiblePosts = posts.filter((post: any) =>
    shouldShowPost(post, isDev)
  );

  if (visiblePosts.length === 0) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }

  const slugs = visiblePosts.map((post: any) => post.id);
  const slug = slugs[Math.floor(Math.random() * slugs.length)];

  return new Response(null, {
    status: 302,
    headers: { Location: `/posts/${slug}` },
  });
};
