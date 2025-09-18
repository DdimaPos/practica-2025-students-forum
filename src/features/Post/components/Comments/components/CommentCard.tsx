'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommentType } from "@/features/Post/types/Comment_type";

export default function CommentCard({ comment }: { comment: CommentType }) {
  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">
          {comment.authorName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{comment.content}</p>
        <p className="mt-1 text-xs text-gray-400">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
        </p>
      </CardContent>
    </Card>
  );
}
