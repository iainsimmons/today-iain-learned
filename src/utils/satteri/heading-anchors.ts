import { defineHastPlugin } from "satteri";

export const satteriHeadingAnchors = defineHastPlugin({
  name: "heading-anchors",
  element: {
    filter: ["h2", "h3", "h4", "h5", "h6"],
    visit(node, ctx) {
      const id = node.properties?.id as string;
      if (!id) return;

      ctx.prependChild(node, {
        type: "element",
        tagName: "a",
        properties: {
          href: `#${id}`,
          className: ["anchor-link"],
          ariaLabel: "Link to this section",
        },
        children: [{ type: "text", value: "#" }],
      });
    },
  },
});
