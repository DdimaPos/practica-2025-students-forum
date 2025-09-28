import { NextResponse } from 'next/server';
import { getUser } from '@/utils/getUser';

export async function GET() {
  try {
    const user = await getUser();

    return NextResponse.json(user);
  } catch (err: unknown) {
    let message = 'Unexpected error';

    if (err instanceof Error) {
      message = err.message;
      console.error('Error in /api/user:', message);
    } else {
      console.error('Unknown error in /api/user:', err);
    }

    if (message.includes('No user data')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (message.includes('User not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
