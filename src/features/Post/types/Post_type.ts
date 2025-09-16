export type Post_type = {
  id: number;
  title: string;
  content: string;
  postType: 'basic' | 'poll' | 'event' | null;
  authorId: number | null;
  channelId: number | null;
  isAnonymous: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  rating: number;
  authorName: string;
};
