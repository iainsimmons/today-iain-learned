import { defineConfig, fontProviders } from "astro/config";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import {
  satteriCalloutPlugin,
  satteriEmbedVideo,
  satteriHeadingAnchors,
  satteriImageCaptions,
} from "./src/utils/satteri/index.ts";
import { siteConfig } from "./src/config.ts";
import { fileURLToPath } from "url";

import cloudflare from "@astrojs/cloudflare";

// Deployment platform configuration
const DEPLOYMENT_PLATFORM = process.env.DEPLOYMENT_PLATFORM || "cloudflare-workers";

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

  markdown: {
    processor: satteri({
      features: { wikilinks: true, directive: true },
      mdastPlugins: [satteriCalloutPlugin, satteriEmbedVideo],
      hastPlugins: [satteriHeadingAnchors, satteriImageCaptions],
    }),
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },

  integrations: [
    sitemap(),
    expressiveCode({
      themes: ["tokyo-night"],
      styleOverrides: {
        codeBackground: "#1a1b26",
        codeFontFamily: "var(--font-jetbrains-mono)",
        uiFontFamily: "var(--font-jetbrains-mono)",
      },
    }),
  ],

  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@/components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@/layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@/utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
        "@/types": fileURLToPath(new URL("./src/types.ts", import.meta.url)),
        "@/config": fileURLToPath(new URL("./src/config.ts", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5000,
      strictPort: false,
      allowedHosts: [],
      middlewareMode: false,
      hmr: true,
      watch: {
        ignored: ["**/.obsidian/**", "**/_bases/**", "**/bases/**"],
        usePolling: process.platform === "win32",
        interval: 1000,
      },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
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

  server: {
    host: true,
    port: 5000,
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  adapter: cloudflare({
    imageService: "passthrough",
    prerenderEnvironment: "node",
  }),

  compressHTML: true,
});
