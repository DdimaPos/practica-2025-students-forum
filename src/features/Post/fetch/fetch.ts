import {Post_type} from '@/features/Post/types/Post_type';

export default async function fetchPost(id: string): Promise<Post_type> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/posts/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Post not found');
  return res.json();
}
