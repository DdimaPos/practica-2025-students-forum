import { createClient } from "@/utils/supabase/server";

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    return <p>Post have not found.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{post.title}</h1>
      <p className="mt-2">{post.content}</p>
      <p className="text-gray-500 text-sm mt-4">
        Автор ID: {post.author_id}, создано:{" "}
        {new Date(post.created_at).toLocaleString()}
      </p>
    </div>
  );
}
