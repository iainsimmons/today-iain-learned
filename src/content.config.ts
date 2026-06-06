import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { XMLParser } from "fast-xml-parser";
import { getFileLastModifiedDate } from "./utils/file-date";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

async function fetchRssImageUrl(xmlUrl: string): Promise<string | null> {
  try {
    const response = await fetch(xmlUrl);
    if (!response.ok) {
      console.error(`Failed to fetch ${xmlUrl}: ${response.statusText}`);
      return null;
    }

    const rssContent = await response.text();
    const parsed = parser.parse(rssContent);

    const imageUrl =
      parsed.rss?.channel?.image?.url || parsed.rss?.channel?.["itunes:image"]?.["@_href"];
    return imageUrl || null;
  } catch (error) {
    console.error(`Error fetching ${xmlUrl}:`, error);
    return null;
  }
}

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
    atUri: z.string().optional(),
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
        const htmlUrl = feed["@_htmlUrl"];
        const imageUrl = feed["@_feeder:imageUrl"] || "";

        let siteUrl = xmlUrl;
        try {
          siteUrl = htmlUrl ? htmlUrl : new URL(xmlUrl).origin;
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
    const lastUpdated = getFileLastModifiedDate("./data/blogroll.opml", import.meta.url);

    store.clear();

    const data = await parseData({
      id: "blogroll",
      data: { groups, lastUpdated },
    });

    store.set({
      id: "blogroll",
      data,
    });
  },
};

const podrollLoader = {
  name: "podroll-loader",
  load: async ({ store, parseData }: any) => {
    const opmlPath = new URL("./data/podroll.opml", import.meta.url);
    const content = readFileSync(opmlPath, "utf-8");
    const opml = parser.parse(content);
    const lastUpdated = getFileLastModifiedDate("./data/podroll.opml", import.meta.url);

    const bodyOutlines = Array.isArray(opml.opml.body.outline)
      ? opml.opml.body.outline
      : [opml.opml.body.outline];

    const groups = await Promise.all(
      bodyOutlines
        .filter((outline: any) => outline.outline)
        .map(async (groupOutline: any) => {
          const groupTitle = groupOutline["@_title"];

          const feedOutlines = Array.isArray(groupOutline.outline)
            ? groupOutline.outline
            : [groupOutline.outline];

          const feeds = await Promise.all(
            feedOutlines.map(async (feed: any) => {
              const title = feed["@_title"];
              const xmlUrl = feed["@_xmlUrl"];
              const htmlUrl = feed["@_htmlUrl"];

              let siteUrl = xmlUrl;
              try {
                siteUrl = htmlUrl ? htmlUrl : new URL(xmlUrl).origin;
              } catch {
                // Use xmlUrl as fallback
              }

              const imageUrl = await fetchRssImageUrl(xmlUrl);

              return { title, xmlUrl, siteUrl, imageUrl };
            }),
          );

          return { title: groupTitle, feeds };
        }),
    );

    store.clear();

    const data = await parseData({
      id: "podroll",
      data: { groups, lastUpdated },
    });

    store.set({
      id: "podroll",
      data,
    });
  },
};

const opmlSchema = z.object({
  lastUpdated: z
    .object({
      datetime: z.string(),
      formatted: z.string(),
    })
    .nullable(),
  groups: z.array(
    z.object({
      title: z.string(),
      feeds: z.array(
        z.object({
          title: z.string(),
          xmlUrl: z.string(),
          siteUrl: z.string(),
          imageUrl: z.string().nullable(),
        }),
      ),
    }),
  ),
});

const blogrollCollection = defineCollection({
  loader: blogrollLoader,
  schema: opmlSchema,
});

const podrollCollection = defineCollection({
  loader: podrollLoader,
  schema: opmlSchema,
});

export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
  special: specialCollection,
  blogroll: blogrollCollection,
  podroll: podrollCollection,
};
