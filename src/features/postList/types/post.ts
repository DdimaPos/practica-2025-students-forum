// Canonical type for post list items (used by PostCard)
export type PostListItem = {
  id: string;
  title: string;
  content: string;
  created_at: string; // ISO string
  rating: number;
  postType: 'basic' | 'poll' | 'event' | null;
  isAnonymous: boolean | null;
  authorId: string | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorUserType: 'student' | 'verified' | 'admin' | null;
  authorProfilePictureUrl: string | null;
  userReaction?: 'upvote' | 'downvote' | null;
};

// Backward compatibility alias
export type PostProp = PostListItem;
