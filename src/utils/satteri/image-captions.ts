import { defineHastPlugin } from "satteri";

export const satteriImageCaptions = defineHastPlugin({
  name: "image-captions",
  element: {
    filter: ["img"],
    visit(node, ctx) {
      const captionText = node.properties?.alt as string;

      if (!captionText || captionText.trim() === "") return;

      return ctx.wrapNode(node, {
        type: "element",
        tagName: "figure",
        properties: { className: ["video-embed"] },
        children: [
          {
            type: "element",
            tagName: "figcaption",
            properties: { className: ["image-caption-container"] },
            children: [
              {
                type: "element",
                tagName: "em",
                children: [{ type: "text", value: captionText }],
              },
            ],
          },
        ],
      });
    },
  },
});
