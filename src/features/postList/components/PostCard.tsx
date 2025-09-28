import Link from "next/link";
import { Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { PostProp } from "../types/post";

export default function PostCard({
  id,
  author,
  title,
  content,
  created_at,
  rating,
  photo,
}: PostProp) {
  return (
    <Link href={`/posts/${id}`}>
      <Card className="mb-2 shadow-sm cursor-pointer hover:shadow-md transition">
        <CardHeader className="flex flex-row items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={photo} alt={author} />
            <AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="text-sm font-semibold">@{author}</p>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm text-gray-700">
              {content}
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(created_at).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 cursor-pointer hover:text-black" />
            <span>{rating}</span>
            <ArrowDown className="h-4 w-4 cursor-pointer hover:text-black" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
