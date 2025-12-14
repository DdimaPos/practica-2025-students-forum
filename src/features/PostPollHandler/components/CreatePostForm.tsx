'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createPostAction } from '../actions/createPost';
import { useFormStateToast } from '@/features/Authentication/hooks/useToast';
import { UserIdProp } from '../types/UserIdProp';
import { FormState } from '../types/FormState';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Send, Sparkles } from 'lucide-react';
import ChannelSelectionDropdown from './ChannelSelectionDropdown';

interface PostFormData {
  title: string;
  content: string;
  channelId: string | null;
  isAnonymous: boolean;
}

export default function CreatePostForm({ userId }: UserIdProp) {
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>({
    message: '',
    success: false,
  });

  useFormStateToast(formState, 'Post created successfully!');

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

  const onSubmit = (data: PostFormData) => {
    setFormState({ message: '', success: false });

    startTransition(async () => {
      const result = await createPostAction({
        title: data.title,
        content: data.content,
        post_type: 'basic',
        author_id: userId,
        channel_id: data.channelId,
        is_anonymous: data.isAnonymous,
        is_active: true,
      });

      if (result.success) {
        reset();
        setFormState({ message: result.message, success: true });
      } else {
        setFormState({ message: result.message, success: false });
      }

      setTimeout(() => setFormState({ message: '', success: false }), 2000);
    });
  };

  return (
    <Card className='rounded-lg shadow-sm'>
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
              Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='post-title'
              {...register('title', {
                required: 'Title is required',
                validate: v => v.trim().length > 0 || 'Title cannot be empty',
              })}
              placeholder='Give your post an engaging title...'
              disabled={isPending}
              className='focus:ring-primary/20 h-12 bg-white text-base transition-all focus:ring-2'
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
              Content <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='post-content'
              {...register('content', {
                required: 'Content is required',
                validate: v => v.trim().length > 0 || 'Content cannot be empty',
              })}
              disabled={isPending}
              placeholder="What's on your mind? Share your story..."
              className='focus:ring-primary/20 min-h-[160px] w-full resize-none overflow-y-auto bg-white text-base transition-all focus:ring-2'
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
            <Controller
              name='channelId'
              control={control}
              render={({ field }) => (
                <ChannelSelectionDropdown
                  onSelectChannel={field.onChange}
                  disabled={isPending}
                />
              )}
            />
          </div>

          <div className='pt-2'>
            <Label className='group hover:bg-accent/50 hover:border-primary/30 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5 flex cursor-pointer items-start gap-4 rounded-xl border-2 bg-white p-4 transition-all has-[[aria-checked=true]]:shadow-sm'>
              <Controller
                name='isAnonymous'
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id='toggle-anonymous'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
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

        <CardFooter className='pt-6'>
          <Button
            type='submit'
            disabled={isPending}
            className='h-12 w-full gap-2 text-base font-semibold shadow-lg transition-all hover:shadow-xl'
          >
            {isPending ? (
              <>
                <span className='animate-spin'>⏳</span> Creating Post...
              </>
            ) : (
              <>
                <Send className='h-4 w-4' /> Publish Post
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
