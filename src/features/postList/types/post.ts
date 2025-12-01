export type PostProp = {
  id: string;
  author: string;
  title: string;
  content: string;
  created_at: string;
  rating: number;
  photo: string;
  postType?: 'basic' | 'poll' | 'event' | null;
  userReaction?: 'upvote' | 'downvote' | null;
};
