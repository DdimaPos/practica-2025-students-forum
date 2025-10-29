'use client';

import { UserIdProp } from '../types/UserIdProp';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Send, Sparkles } from 'lucide-react';
import ChannelSelectionDropdown from './ChannelSelectionDropdown';

interface PostFormData {
  title: string;
  content: string;
  channelId: string | null;
  isAnonymous: boolean;
}

export default function CreatePostForm({ userId }: UserIdProp) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      channelId: null,
      isAnonymous: false,
    },
  });

  const content = watch('content');

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const postData = {
        title: data.title.trim(),
        content: data.content.trim(),
        post_type: 'basic',
        author_id: userId,
        channel_id: data.channelId,
        is_anonymous: data.isAnonymous,
        is_active: true,
      };

      console.log('Submitting post data:', postData);

      const response = await fetch('/api/posts/addPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const result = await response.json();
      console.log('Post created successfully:', result);

      reset();
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='from-background to-muted/20 border-0 bg-gradient-to-br shadow-lg'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className='space-y-3 pb-6'>
          <div className='flex items-center gap-2'>
            <Sparkles className='text-primary h-5 w-5' />
            <CardTitle className='from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-2xl text-transparent'>
              Create a Post
            </CardTitle>
          </div>
          <CardDescription className='text-base'>
            Share your thoughts with the community
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label
              htmlFor='post-title'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              Title
              <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='post-title'
              {...register('title', {
                required: 'Title is required',
                validate: value =>
                  value.trim().length > 0 || 'Title cannot be empty',
              })}
              placeholder='Give your post an engaging title...'
              className='focus:ring-primary/20 h-12 text-base transition-all focus:ring-2'
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className='text-destructive text-sm'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='post-content'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              Content
              <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='post-content'
              {...register('content', {
                required: 'Content is required',
                validate: value =>
                  value.trim().length > 0 || 'Content cannot be empty',
              })}
              className='focus:ring-primary/20 min-h-[160px] w-full flex-1 resize-none overflow-y-auto text-base transition-all focus:ring-2'
              placeholder="What's on your mind? Share your story..."
              disabled={isSubmitting}
            />
            <div className='flex items-center justify-between'>
              {errors.content && (
                <p className='text-destructive text-sm'>
                  {errors.content.message}
                </p>
              )}
              <p className='text-muted-foreground ml-auto text-xs'>
                {content?.length || 0} characters
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <Label className='text-sm font-semibold'>Channel</Label>
            <div className='border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/40 flex items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors'>
              <Controller
                name='channelId'
                control={control}
                render={({ field }) => (
                  <ChannelSelectionDropdown
                    onSelectChannel={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          <div className='pt-2'>
            <Label className='group hover:bg-accent/50 hover:border-primary/30 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5 flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all has-[[aria-checked=true]]:shadow-sm'>
              <Controller
                name='isAnonymous'
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id='toggle-anonymous'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className='data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-0.5'
                  />
                )}
              />
              <div className='flex-1 space-y-1'>
                <p className='text-sm leading-none font-semibold'>
                  Post anonymously
                </p>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  Your identity will be hidden. Note: You will not see who
                  responds to your post.
                </p>
              </div>
            </Label>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-3 pt-6'>
          {error && (
            <div className='bg-destructive/10 border-destructive/20 text-destructive flex w-full items-center gap-2 rounded-lg border p-3'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              <p className='text-sm font-medium'>{error}</p>
            </div>
          )}

          {success && (
            <div className='flex w-full items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-green-600 dark:text-green-400'>
              <Sparkles className='h-4 w-4 shrink-0' />
              <p className='text-sm font-medium'>Post created successfully!</p>
            </div>
          )}

          <Button
            type='submit'
            disabled={isSubmitting}
            className='h-12 w-full gap-2 text-base font-semibold shadow-lg transition-all hover:shadow-xl'
          >
            {isSubmitting ? (
              <>
                <span className='animate-spin'>⏳</span>
                Creating Post...
              </>
            ) : (
              <>
                <Send className='h-4 w-4' />
                Publish Post
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
