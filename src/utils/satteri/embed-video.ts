import { defineMdastPlugin } from "satteri";

export const satteriEmbedVideo = defineMdastPlugin({
  name: "embed-video",
  leafDirective(node, ctx) {
    if (node.name !== "video" || !node.attributes?.src) return;

    const title = node.attributes?.title;
    const wrapperTag = title ? "figure" : "div";

    ctx.replaceNode(node, {
      rawHtml: `<${wrapperTag} class="video-embed"><video class="video-player" controls src="${node.attributes.src}" ${title ? `title="${title}"` : ""}></video>${title ? `<figcaption class="image-caption-container"><em>${title}</em></figcaption>` : ""}</${wrapperTag}>`,
    });
  },
});
