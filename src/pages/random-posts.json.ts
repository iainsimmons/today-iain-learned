import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { shouldShowPost } from "@/utils/markdown";

export const GET: APIRoute = async () => {
  try {
    const posts = await getCollection("posts");
    const isDev = import.meta.env.DEV;

    const slugs = posts
      .filter((post) => shouldShowPost(post, isDev))
      .map((post) => post.id);

    return new Response(JSON.stringify(slugs), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
