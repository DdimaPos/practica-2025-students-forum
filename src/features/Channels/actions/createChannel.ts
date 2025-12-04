'use server';

import db from '@/db';
import { channels } from '@/db/schema';
import { getUser } from '@/utils/getUser';
import type { FormState } from '../types';
import { revalidatePath } from 'next/cache';
import { sanitize, isValidUuid } from '@/lib/security';

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

    const name = sanitize(formData.get('name')?.toString() || '');
    const description = sanitize(formData.get('description')?.toString() || '');
    const channelType = formData.get('channelType')?.toString();
    const facultyId = formData.get('facultyId')?.toString() || null;
    const specialityId = formData.get('specialityId')?.toString() || null;

    const errors: FormState['errors'] = {};

    // Validate UUID formats for optional IDs
    if (facultyId && !isValidUuid(facultyId)) {
      errors.facultyId = ['Invalid faculty ID format'];
    }

    if (specialityId && !isValidUuid(specialityId)) {
      errors.specialityId = ['Invalid speciality ID format'];
    }

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
