import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.getUser();

    if (error || !data.user || data.user.deleted_at) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: error?.message || 'No user data' },
        { status: 401 }
      );
    }

    const uRes = await db
      .select()
      .from(users)
      .where(eq(users.authId, data.user.id))
      .limit(1);

    if (uRes.length === 0 || !uRes[0].isVerified) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const user = uRes[0];

    return NextResponse.json({
      ...data.user,
      ...user,
    });
  } catch (err: unknown) {
    console.error('Unexpected error in /api/user:', err);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
