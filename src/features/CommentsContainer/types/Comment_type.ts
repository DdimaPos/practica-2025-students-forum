export type CommentType = {
  id: string;
  postId: string | null;
  authorId: string | null;
  parentComment: string | null;
  content: string;
  isAnonymous: boolean | null;
  createdAt: Date | null;
  authorName: string;
};
