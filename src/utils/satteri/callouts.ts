import { defineMdastPlugin } from "satteri";

export const satteriCalloutPlugin = defineMdastPlugin({
  name: "callouts",
  blockquote(node, ctx) {
    const firstPara = node.children?.[0];
    if (firstPara?.type !== "paragraph") return;

    const firstText = firstPara.children?.[0];
    if (firstText?.type !== "text") return;

    const match = firstText.value.match(/^\[!(\w+)\]\s*/i);
    if (!match) return;

    const type = match[1].toLowerCase();

    firstText.value = firstText.value.slice(match[0].length);

    ctx.setProperty(node, "data", {
      hProperties: {
        className: `callout callout-${type}`,
      },
    });
  },
});
