import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { XMLParser } from "fast-xml-parser";

const postsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string().default("Untitled Post"),
    description: z.string().nullable().optional().default("No description provided"),
    date: z.coerce.date().default(() => new Date()),
    tags: z.array(z.string()).nullable().optional(),
    draft: z.boolean().optional(),
    image: z
      .any()
      .nullable()
      .optional()
      .transform((val: unknown) => {
        if (Array.isArray(val)) return val[0] || null;
        if (typeof val === "string") return val;
        return null;
      }),
    imageOG: z.boolean().optional(),
    imageAlt: z.string().nullable().optional(),
    hideCoverImage: z.boolean().optional(),
    hideTOC: z.boolean().optional(),
    targetKeyword: z.string().nullable().optional(),
    author: z.string().nullable().optional(),
    noIndex: z.boolean().optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string().default("Untitled Page"),
    description: z.string().nullable().optional().default("No description provided"),
    draft: z.boolean().optional(),
    lastModified: z.coerce.date().optional(),
    image: z
      .any()
      .nullable()
      .optional()
      .transform((val: unknown) => {
        if (Array.isArray(val)) return val[0] || null;
        if (typeof val === "string") return val;
        return null;
      }),
    imageAlt: z.string().nullable().optional(),
    hideCoverImage: z.boolean().optional(),
    hideTOC: z.boolean().optional(),
    noIndex: z.boolean().optional(),
  }),
});

const specialCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/special" }),
  schema: z.object({
    title: z.string().default("Untitled Page"),
    description: z.string().nullable().optional().default("No description provided"),
    hideTOC: z.boolean().optional(),
  }),
});

function parseOpmlContent(content: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const opml = parser.parse(content);

  const bodyOutlines = Array.isArray(opml.opml.body.outline)
    ? opml.opml.body.outline
    : [opml.opml.body.outline];

  return bodyOutlines
    .filter((outline: any) => outline.outline)
    .map((groupOutline: any) => {
      const groupTitle = groupOutline["@_title"];

      const feedOutlines = Array.isArray(groupOutline.outline)
        ? groupOutline.outline
        : [groupOutline.outline];

      const feeds = feedOutlines.map((feed: any) => {
        const title = feed["@_title"];
        const xmlUrl = feed["@_xmlUrl"];
        const imageUrl = feed["@_feeder:imageUrl"] || "";

        let siteUrl = xmlUrl;
        try {
          siteUrl = new URL(xmlUrl).origin;
        } catch {
          // Use xmlUrl as fallback
        }

        return { title, xmlUrl, siteUrl, imageUrl };
      });

      return { title: groupTitle, feeds };
    });
}

const blogrollLoader = {
  name: "blogroll-loader",
  load: async ({ store, parseData }: any) => {
    const opmlPath = new URL("./data/blogroll.opml", import.meta.url);
    const content = readFileSync(opmlPath, "utf-8");
    const groups = parseOpmlContent(content);

    store.clear();

    const data = await parseData({
      id: "blogroll",
      data: { groups },
    });

    store.set({
      id: "blogroll",
      data,
    });
  },
};

const blogrollCollection = defineCollection({
  loader: blogrollLoader,
  schema: z.object({
    groups: z.array(
      z.object({
        title: z.string(),
        feeds: z.array(
          z.object({
            title: z.string(),
            xmlUrl: z.string(),
            siteUrl: z.string(),
            imageUrl: z.string(),
          }),
        ),
      }),
    ),
  }),
});

export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
  special: specialCollection,
  blogroll: blogrollCollection,
};
