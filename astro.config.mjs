import { defineConfig, fontProviders } from "astro/config";

import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import {
  remarkInternalLinks,
  remarkFolderImages,
  remarkImageCaptions,
} from "./src/utils/internallinks.ts";
import remarkCallouts from "./src/utils/remark-callouts.ts";
import remarkImageGrids from "./src/utils/remark-image-grids.ts";
import remarkMermaid from "./src/utils/remark-mermaid.ts";
import { remarkObsidianEmbeds } from "./src/utils/remark-obsidian-embeds.ts";
import remarkBases from "./src/utils/remark-bases.ts";
import { remarkObsidianComments } from "./src/utils/remark-obsidian-comments.ts";
import remarkMath from "remark-math";
import remarkReadingTime from "remark-reading-time";
import remarkToc from "remark-toc";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeMark from "./src/utils/rehype-mark.ts";
import rehypeImageAttributes from "./src/utils/rehype-image-attributes.ts";
import { rehypeNormalizeAnchors } from "./src/utils/rehype-normalize-anchors.ts";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { siteConfig } from "./src/config.ts";
import { fileURLToPath } from "url";

// Deployment platform configuration
const DEPLOYMENT_PLATFORM =
  process.env.DEPLOYMENT_PLATFORM || "cloudflare-workers";

export default defineConfig({
  site: siteConfig.site,
  deployment: {
    platform: DEPLOYMENT_PLATFORM,
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      subsets: ["latin", "latin-ext"],
      fallbacks: ["monospace"],
    },
  ],
  security: { csp: true },
  devToolbar: {
    enabled: true,
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        limitInputPixels: false,
      },
    },
    remotePatterns: [
      {
        protocol: "https",
      },
    ],
  },
  integrations: [tailwind(), sitemap(), mdx()],
  markdown: {
    remarkPlugins: [
      remarkInternalLinks,
      remarkObsidianComments, // Remove Obsidian comments (%%...%%) early in processing
      remarkFolderImages,
      remarkObsidianEmbeds,
      // Bases directive (table-only v1)
      remarkBases,
      remarkImageCaptions,
      remarkMath,
      remarkCallouts,
      remarkBreaks,
      remarkImageGrids,
      remarkMermaid,
      [remarkReadingTime, {}],
      [
        remarkToc,
        {
          tight: true,
          ordered: false,
          maxDepth: 3,
          heading: "contents|table[ -]of[ -]contents?|toc",
        },
      ],
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeMark,
      rehypeImageAttributes,
      [
        rehypeSlug,
        {
          test: (node) => node.tagName !== "h1",
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          test: (node) => node.tagName !== "h1",
          properties: {
            className: ["anchor-link"],
            ariaLabel: "Link to this section",
          },
        },
      ],
      rehypeNormalizeAnchors, // Run LAST to ensure className and href fixes aren't overridden
    ],
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@/components": fileURLToPath(
          new URL("./src/components", import.meta.url),
        ),
        "@/layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@/utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
        "@/types": fileURLToPath(new URL("./src/types.ts", import.meta.url)),
        "@/config": fileURLToPath(new URL("./src/config.ts", import.meta.url)),
      },
    },
    server: {
      host: "localhost",
      port: 5000,
      strictPort: false, // Allow fallback to 5001 if 5000 is occupied (e.g., AirPlay on macOS)
      allowedHosts: [],
      middlewareMode: false,
      hmr: true,
      watch: {
        ignored: ["**/.obsidian/**", "**/_bases/**", "**/bases/**"],
        usePolling: process.platform === "win32", // Use polling on Windows for better file watching
        interval: 1000,
      },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        // CSP headers are handled by src/middleware.ts for all routes
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
      "process.env.ASTRO_CONTENT_COLLECTION_CACHE": "false",
    },
    optimizeDeps: {
      exclude: ["astro:content"],
    },
    exclude: ["**/_redirects"],
  },
  build: {
    assets: "_assets",
  },
});
