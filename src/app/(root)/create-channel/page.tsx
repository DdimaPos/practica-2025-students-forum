import { CreateChannelForm } from '@/features/Channels/components/CreateChannelForm';
import { createChannel } from '@/features/Channels/actions/createChannel';
import {
  getFaculties,
  getSpecialities,
} from '@/features/Channels/actions/getFormData';
import { getUser } from '@/utils/getUser';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Channel',
  description: 'Create a new channel for discussions',
};

export default async function CreateChannelPage() {
  const user = await getUser().catch(() => undefined);

  if (!user) {
    redirect('/login');
  }

  const [faculties, specialities] = await Promise.all([
    getFaculties(),
    getSpecialities(),
  ]);

  return (
    <div className='container py-10'>
      <CreateChannelForm
        onSubmit={createChannel}
        faculties={faculties}
        specialities={specialities}
      />
    </div>
  );
}
