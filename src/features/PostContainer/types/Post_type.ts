export type Post_type = {
  id: string;
  title: string;
  content: string;
  postType: 'basic' | 'poll' | 'event' | null;
  authorId: string | null;
  channelId: string | null;
  channelName: string | null;
  isAnonymous: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  rating: number;
  authorName: string;
};

