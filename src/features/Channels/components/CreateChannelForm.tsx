'use client';

import { FC, useActionState, useTransition, useEffect, useState } from 'react';
import type { FormState } from '../types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Faculty, Speciality } from '../actions/getFormData';

interface Props {
  onSubmit: (prevState: FormState, formData: FormData) => Promise<FormState>;
  faculties: Faculty[];
  specialities: Speciality[];
}

export const CreateChannelForm: FC<Props> = ({
  onSubmit,
  faculties,
  specialities,
}) => {
  const router = useRouter();
  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(onSubmit, initialState);
  const [isPending, startTransition] = useTransition();

  const [selectedChannelType, setSelectedChannelType] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<string>('');

  const filteredSpecialities = selectedFacultyId
    ? specialities.filter(s => s.facultyId === selectedFacultyId)
    : specialities;

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  const formActionWithTransition = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <Toaster richColors position='top-center' />
      <CardHeader>
        <CardTitle>Create a New Channel</CardTitle>
        <CardDescription>
          Fill in the details below to create a new channel for discussions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formActionWithTransition}>
          <div className='grid gap-6'>
            {/* Channel Name */}
            <div className='grid gap-2'>
              <Label htmlFor='name'>
                Channel Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                name='name'
                type='text'
                placeholder='e.g., CS Study Group'
                required
                disabled={isPending}
              />
              {state.errors?.name && (
                <p className='text-sm text-red-500'>{state.errors.name[0]}</p>
              )}
            </div>

            {/* Description */}
            <div className='grid gap-2'>
              <Label htmlFor='description'>
                Description <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                id='description'
                name='description'
                placeholder='Describe the purpose of this channel...'
                rows={4}
                required
                disabled={isPending}
              />
              {state.errors?.description && (
                <p className='text-sm text-red-500'>
                  {state.errors.description[0]}
                </p>
              )}
            </div>

            {/* Channel Type */}
            <div className='grid gap-2'>
              <Label htmlFor='channelType'>
                Channel Type <span className='text-red-500'>*</span>
              </Label>
              <Select
                name='channelType'
                value={selectedChannelType}
                onValueChange={setSelectedChannelType}
                required
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a channel type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='general'>General</SelectItem>
                  <SelectItem value='academic'>Academic</SelectItem>
                  <SelectItem value='social'>Social</SelectItem>
                  <SelectItem value='announcements'>Announcements</SelectItem>
                  <SelectItem value='local'>Local</SelectItem>
                </SelectContent>
              </Select>
              <input
                type='hidden'
                name='channelType'
                value={selectedChannelType}
              />
              {state.errors?.channelType && (
                <p className='text-sm text-red-500'>
                  {state.errors.channelType[0]}
                </p>
              )}
            </div>

            {/* Faculty (Optional) */}
            <div className='grid gap-2'>
              <Label htmlFor='facultyId'>Faculty (Optional)</Label>
              <Select
                name='facultyId'
                value={selectedFacultyId}
                onValueChange={value => {
                  setSelectedFacultyId(value);
                  setSelectedSpecialityId(''); 
                }}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a faculty' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type='hidden'
                name='facultyId'
                value={selectedFacultyId === 'none' ? '' : selectedFacultyId}
              />
            </div>

            {/* Speciality (Optional) */}
            <div className='grid gap-2'>
              <Label htmlFor='specialityId'>Speciality (Optional)</Label>
              <Select
                name='specialityId'
                value={selectedSpecialityId}
                onValueChange={setSelectedSpecialityId}
                disabled={isPending || !selectedFacultyId || selectedFacultyId === 'none'}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a speciality' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {filteredSpecialities.map(speciality => (
                    <SelectItem key={speciality.id} value={speciality.id}>
                      {speciality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type='hidden'
                name='specialityId'
                value={
                  selectedSpecialityId === 'none' ? '' : selectedSpecialityId
                }
              />
            </div>

            {/* Submit Button */}
            <div className='flex gap-4'>
              <Button
                type='submit'
                className='flex-1'
                disabled={isPending}
              >
                {isPending ? 'Creating...' : 'Create Channel'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/')}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
