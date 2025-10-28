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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Send, Sparkles } from 'lucide-react';

export default function CreatePostForm({ userId }: UserIdProp) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');

      return;
    }

    if (!content.trim()) {
      setError('Content is required');

      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        post_type: 'basic',
        author_id: userId,
        channel_id: channelId,
        is_anonymous: isAnonymous,
        is_active: true,
      };

      const response = await fetch('/api/posts', {
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

      setTitle('');
      setContent('');
      setIsAnonymous(false);
      setChannelId(null);
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
    <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Create a Post
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Share your thoughts with the community
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label 
              htmlFor="post-title" 
              className="text-sm font-semibold flex items-center gap-2"
            >
              Title
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="post-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your post an engaging title..."
              className="h-12 text-base transition-all focus:ring-2 focus:ring-primary/20"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="post-content" 
              className="text-sm font-semibold flex items-center gap-2"
            >
              Content
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[160px] text-base resize-none w-full flex-1 overflow-y-auto transition-all focus:ring-2 focus:ring-primary/20"
              placeholder="What's on your mind? Share your story..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length} characters
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Channel</Label>
            <div className="relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center transition-colors hover:border-muted-foreground/40 hover:bg-muted/40">
              <p className="text-sm text-muted-foreground font-medium">
                Channel selector coming soon
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Posts will be visible to all users by default
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Label className="group cursor-pointer flex items-start gap-4 rounded-xl border-2 p-4 transition-all hover:bg-accent/50 hover:border-primary/30 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5 has-[[aria-checked=true]]:shadow-sm">
              <Checkbox
                id="toggle-anonymous"
                checked={isAnonymous}
                onCheckedChange={checked => setIsAnonymous(checked === true)}
                disabled={isSubmitting}
                className="mt-0.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold leading-none">
                  Post anonymously
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your identity will be hidden. Note: You will not see who responds to your post.
                </p>
              </div>
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-6">
          {error && (
            <div className="w-full flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="w-full flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-green-600 dark:text-green-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">Post created successfully!</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Creating Post...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Publish Post
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}