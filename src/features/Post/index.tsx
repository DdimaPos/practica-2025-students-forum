import {Post_type} from '@/features/Post/types/Post_type';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import Footer from './components/FooterMechanicComponent'; 
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

export default function Post({...post}: Post_type) { 

  return (
    <div>
      <Card className='rounded-lg bg-white shadow-md pb-0'>
        <CardHeader className='flex items-center justify-between gap-4 pb-4'>
          <div className='flex gap-4'>
            <Avatar>
              <AvatarImage src='https://tribuna.md/wp-content/uploads/2021/01/utm.jpg' />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {post.title && (
              <CardTitle className='text-xl font-bold'>{post.title}</CardTitle>
            )}
          </div>

          {post.authorName && (
            <span className='text-sm text-gray-500'>by {post.authorName}</span>
          )}
        </CardHeader>

        <CardDescription className='px-4 py-2'>{post.content}</CardDescription>

        <CardFooter className='px-0'>  
          <Footer post={post} />
        </CardFooter>
      </Card>

    </div>
  );
}
