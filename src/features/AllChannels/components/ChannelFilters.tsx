'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

type ChannelFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
};

export default function ChannelFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
}: ChannelFiltersProps) {
  return (
    <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-end'>
      {/* Search */}
      <div className='flex flex-col w-full gap-2'>
        <Label htmlFor='search'>Search Channels</Label>
        <div className='flex flex-row items-center'>
          <Input
            id='search'
            type='text'
            placeholder='search "study"'
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className='pl-4 bg-white border border-gray-300 rounded-md'
          />
          <Search className='h-5 w-5 text-gray-400 mr-3 right-8 relative' />
        </div>
      </div>

      {/* Filter by Type */}
      <div className='w-fit md:w-[200px] flex flex-col gap-2'>
        <Label htmlFor='type'>Filter by Type</Label>
        <div className='bg-white border border-gray-300 rounded-md'>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger id='type' className='w-full border-0 focus:ring-0'>
              <SelectValue placeholder='All Types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='general'>General</SelectItem>
              <SelectItem value='academic'>Academic</SelectItem>
              <SelectItem value='social'>Social</SelectItem>
              <SelectItem value='announcements'>Announcements</SelectItem>
              <SelectItem value='local'>Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
