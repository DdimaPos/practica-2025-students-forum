'use server';

import db from '@/db';
import { channels } from '@/db/schema';
import { getUser } from '@/utils/getUser';
import type { FormState } from '../types';
import { revalidatePath } from 'next/cache';

export async function createChannel(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const user = await getUser().catch(() => undefined);
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to create a channel',
      };
    }

    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const channelType = formData.get('channelType')?.toString();
    const facultyId = formData.get('facultyId')?.toString() || null;
    const specialityId = formData.get('specialityId')?.toString() || null;

    const errors: FormState['errors'] = {};

    if (!name || name.length < 3) {
      errors.name = ['Channel name must be at least 3 characters'];
    }

    if (name && name.length > 100) {
      errors.name = ['Channel name must be less than 100 characters'];
    }

    if (!description || description.length < 10) {
      errors.description = ['Description must be at least 10 characters'];
    }

    if (
      !channelType ||
      !['general', 'academic', 'social', 'announcements', 'local'].includes(
        channelType
      )
    ) {
      errors.channelType = ['Please select a valid channel type'];
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Please fix the errors below',
        errors,
      };
    }

    await db.insert(channels).values({
      name: name!,
      description: description!,
      channelType: channelType as
        | 'general'
        | 'academic'
        | 'social'
        | 'announcements'
        | 'local',
      facultyId: facultyId || undefined,
      specialityId: specialityId || undefined,
      createdBy: user.id,
      isApproved: true, // auto approve for now
    });

    revalidatePath('/');

    return {
      success: true,
      message: 'Channel created successfully!',
    };
  } catch (error) {
    console.error('Error creating channel:', error);

    return {
      success: false,
      message: 'Failed to create channel. Please try again.',
    };
  }
}
