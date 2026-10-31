import { postsVisibles } from "@/lib/blog";
import { orgPostsPublies } from "@/lib/posts";
import { fusionnerBlog, type EntreeBlog } from "@/lib/articles";

/** Tous les articles visibles : fichiers de La Rotative + articles publiés des organismes. */
export async function entreesBlog(): Promise<EntreeBlog[]> {
  const organismes = await orgPostsPublies();
  return fusionnerBlog(postsVisibles(), organismes);
}
