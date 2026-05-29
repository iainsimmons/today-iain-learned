interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/random") {
      const resp = await fetch(new URL("/random-posts.json", request.url));
      if (!resp.ok) {
        return new Response("Failed to load posts", { status: 500 });
      }
      const slugs: string[] = await resp.json();
      const slug = slugs[Math.floor(Math.random() * slugs.length)];
      return Response.redirect(new URL(`/posts/${slug}`, request.url).href, 302);
    }

    return env.ASSETS.fetch(request);
  },
};
