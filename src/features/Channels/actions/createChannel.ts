'use server';

import * as Sentry from '@sentry/nextjs';
import db from '@/db';
import { channels } from '@/db/schema';
import { getUser } from '@/utils/getUser';
import type { FormState } from '../types';
import { revalidatePath } from 'next/cache';
import { sanitize, isValidUuid } from '@/lib/security';
import { getFirstIP } from '@/utils/getFirstIp';
import { headers } from 'next/headers';
import { rateLimits } from '@/lib/ratelimits';

export async function createChannel(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.createChannel.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'createChannel',
      ip_address: ip,
      rate_limit_type: 'createChannel',
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many requests' };
  }

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

    const [newChannel] = await db
      .insert(channels)
      .values({
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
      })
      .returning();

    revalidatePath('/');

    Sentry.logger.info('Channel created', {
      action: 'createChannel',
      channel_id: newChannel.id,
      channel_type: channelType,
      user_id: user.id,
      has_faculty: !!facultyId,
      has_speciality: !!specialityId,
      name_length: name.length,
      description_length: description.length,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      message: 'Channel created successfully!',
    };
  } catch (err) {
    const isErrorObject = err instanceof Error;
    const error = isErrorObject ? err : new Error(String(err));

    Sentry.logger.error('Channel creation failed', {
      action: 'createChannel',
      error_message: error.message,
      error_stack: error.stack,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'createChannel' },
      extra: { ip_address: ip },
    });

    return {
      success: false,
      message: 'Failed to create channel. Please try again.',
    };
  }
}
