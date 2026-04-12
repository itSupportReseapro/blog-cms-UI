import CreateBlog from "@/components/create-blog/create-blog";

export default async function EditBlogPage({ params }) {
  const resolvedParams = await params;

  return <CreateBlog blogId={resolvedParams?.id || null} />;
}
