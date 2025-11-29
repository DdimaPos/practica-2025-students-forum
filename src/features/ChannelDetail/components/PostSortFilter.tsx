'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SortOption } from '../actions/getChannelPosts';

type PostSortFilterProps = {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
};

export default function PostSortFilter({
  sortBy,
  onSortChange,
}: PostSortFilterProps) {
  return (
    <div className='flex items-center gap-3'>
      <Label htmlFor='sort'>Sort by:</Label>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger id='sort' className='w-[180px]'>
          <SelectValue placeholder='Sort posts' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='newest'>Newest First</SelectItem>
          <SelectItem value='oldest'>Oldest First</SelectItem>
          <SelectItem value='popular'>Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
