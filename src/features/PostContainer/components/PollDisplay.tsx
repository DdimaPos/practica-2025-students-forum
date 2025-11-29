'use client';

import { useEffect, useState, useTransition } from 'react';
import { getPollOptions, votePoll, PollOption } from '../actions/pollActions';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PollDisplayProps {
  postId: string;
  userId?: string | null;
}

export default function PollDisplay({ postId, userId }: PollDisplayProps) {
  const [options, setOptions] = useState<PollOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadPollOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, userId]);

  const loadPollOptions = async () => {
    const pollOptions = await getPollOptions(postId, userId);
    setOptions(pollOptions);
    setHasVoted(pollOptions.some(opt => opt.hasVoted));
  };

  const handleVote = (optionId: string) => {
    if (!userId) {
      toast.error('Please login to vote');

      return;
    }

    if (hasVoted) {
      toast.error('You have already voted on this poll');

      return;
    }

    startTransition(async () => {
      const result = await votePoll(optionId, userId);

      if (result.success) {
        toast.success(result.message);
        await loadPollOptions();
      } else {
        toast.error(result.message);
      }
    });
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0);

  return (
    <div className='space-y-3 px-4 py-3'>
      <div className='text-sm font-semibold text-gray-700'>
        Poll Options {totalVotes > 0 && `(${totalVotes} votes)`}
      </div>

      <div className='space-y-2'>
        {options.map(option => {
          const percentage =
            totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;

          return (
            <div key={option.id} className='relative'>
              <Button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isPending}
                variant={option.hasVoted ? 'default' : 'outline'}
                className='relative h-auto w-full justify-start overflow-hidden p-3 text-left transition-all'
              >
                {/* Progress bar background */}
                <div
                  className='bg-primary/10 absolute inset-0 transition-all duration-500'
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className='relative z-10 flex w-full items-center justify-between gap-3'>
                  <div className='flex flex-1 items-center gap-2'>
                    {option.hasVoted && (
                      <CheckCircle2 className='text-primary h-4 w-4 shrink-0' />
                    )}
                    <span className='break-words'>{option.optionText}</span>
                  </div>

                  {hasVoted && (
                    <div className='flex shrink-0 items-center gap-2'>
                      <span className='text-sm font-semibold'>
                        {percentage.toFixed(1)}%
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        ({option.voteCount})
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      {!hasVoted && userId && (
        <p className='text-muted-foreground text-xs'>
          Click on an option to vote
        </p>
      )}

      {!userId && (
        <p className='text-muted-foreground text-xs'>
          Please login to vote on this poll
        </p>
      )}
    </div>
  );
}
