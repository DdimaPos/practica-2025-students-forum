import {
  Select,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ChannelSelectLoading() {
  return (
    <Select disabled>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='Loading channels...' />
      </SelectTrigger>
    </Select>
  );
}