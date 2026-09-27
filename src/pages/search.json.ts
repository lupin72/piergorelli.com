import type { APIRoute } from "astro";
import { getPosts, pillarOf, postUrl } from "../lib/blog";

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const index = posts.map((p) => ({ title: p.data.title, url: postUrl(p), pillar: pillarOf(p) }));
  return new Response(JSON.stringify(index), { headers: { "Content-Type": "application/json" } });
};
