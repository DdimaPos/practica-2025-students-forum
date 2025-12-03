export type PostProp = {
  id: string;
  author: string;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorUserType: 'student' | 'verified' | 'admin' | null;
  authorProfilePictureUrl: string | null;
  authorId: string | null;
  isAnonymous: boolean | null;
  title: string;
  content: string;
  created_at: string;
  rating: number;
  photo: string;
  postType?: 'basic' | 'poll' | 'event' | null;
  userReaction?: 'upvote' | 'downvote' | null;
};
