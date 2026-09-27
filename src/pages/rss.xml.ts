import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts, pillarOf, postUrl } from "../lib/blog";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: "Pier Gorelli — Blog",
    description: "Web development, AI in practice and AI for creative agencies.",
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: postUrl(p),
      categories: [pillarOf(p), ...(p.data.tags ?? [])],
    })),
  });
}
