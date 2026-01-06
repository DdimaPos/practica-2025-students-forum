'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { createPollAction } from '../actions/createPoll';
import { useFormStateToast } from '@/features/Authentication/hooks/useToast';
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
import { Send, BarChart3, Plus, X } from 'lucide-react';
import ChannelSelectionDropdown from './ChannelSelectionDropdown';

interface PollFormData {
  title: string;
  content: string;
  channelId: string | null;
  isAnonymous: boolean;
  pollOptions: { value: string }[];
}

export default function CreatePollForm() {
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>({
    message: '',
    success: false,
  });

  useFormStateToast(formState, 'Poll created successfully!');

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<PollFormData>({
    defaultValues: {
      title: '',
      content: '',
      channelId: null,
      isAnonymous: false,
      pollOptions: [{ value: '' }, { value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pollOptions',
  });

  const content = watch('content');

  const onSubmit = (data: PollFormData) => {
    setFormState({ message: '', success: false });

    startTransition(async () => {
      const result = await createPollAction({
        title: data.title,
        content: data.content,
        channel_id: data.channelId,
        is_anonymous: data.isAnonymous,
        is_active: true,
        poll_options: data.pollOptions.map(opt => opt.value),
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
            <BarChart3 className='text-primary h-5 w-5' />
            <CardTitle className='from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-2xl text-transparent'>
              Create a Poll
            </CardTitle>
          </div>
          <CardDescription className='text-base'>
            Ask the community a question and gather their opinions
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label
              htmlFor='poll-title'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='poll-title'
              {...register('title', {
                required: 'Title is required',
                validate: v => v.trim().length > 0 || 'Title cannot be empty',
              })}
              placeholder='Ask an engaging question...'
              disabled={isPending}
              className='focus:ring-primary/20 h-12 bg-white text-base transition-all focus:ring-2'
            />
            {errors.title && (
              <p className='text-destructive text-sm'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='poll-content'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              Description <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='poll-content'
              {...register('content', {
                required: 'Description is required',
                validate: v =>
                  v.trim().length > 0 || 'Description cannot be empty',
              })}
              disabled={isPending}
              placeholder='Provide more context for your poll...'
              className='focus:ring-primary/20 min-h-[120px] w-full resize-none overflow-y-auto bg-white text-base transition-all focus:ring-2'
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
            <Label className='text-sm font-semibold'>
              Poll Options <span className='text-destructive'>*</span>
            </Label>
            <div className='space-y-3'>
              {fields.map((field, index) => (
                <div key={field.id} className='flex items-start gap-2'>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground bg-muted flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold'>
                        {index + 1}
                      </span>
                      <Input
                        {...register(`pollOptions.${index}.value`, {
                          required: 'Option cannot be empty',
                          validate: v =>
                            v.trim().length > 0 || 'Option cannot be empty',
                        })}
                        placeholder={`Option ${index + 1}`}
                        disabled={isPending}
                        className='focus:ring-primary/20 h-10 bg-white transition-all focus:ring-2'
                      />
                      {fields.length > 2 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => remove(index)}
                          disabled={isPending}
                          className='hover:bg-destructive/10 hover:text-destructive h-10 w-10 shrink-0'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    {errors.pollOptions?.[index]?.value && (
                      <p className='text-destructive ml-10 text-sm'>
                        {errors.pollOptions[index]?.value?.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {fields.length < 10 && (
              <Button
                type='button'
                variant='outline'
                onClick={() => append({ value: '' })}
                disabled={isPending}
                className='w-full gap-2 border-dashed'
              >
                <Plus className='h-4 w-4' /> Add Option
              </Button>
            )}
            <p className='text-muted-foreground text-xs'>
              Add between 2 and 10 options for your poll
            </p>
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
                    id='toggle-anonymous-poll'
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
                  Your identity will be hidden. Poll votes are always anonymous.
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
                <span className='animate-spin'>⏳</span> Creating Poll...
              </>
            ) : (
              <>
                <Send className='h-4 w-4' /> Publish Poll
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
