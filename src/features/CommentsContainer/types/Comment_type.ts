export type CommentType = {
  id: number;
  postId: number | null;
  authorId: number | null;
  parentComment: number | null;
  content: string;
  isAnonymous: boolean | null;
  createdAt: Date | null;
  authorName: string;
};
