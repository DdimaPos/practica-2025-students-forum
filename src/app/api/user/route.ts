import { NextResponse } from 'next/server';
import { getUser } from '@/utils/getUser';

export async function GET() {

  const user = await getUser();

  if (!user) {

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(user);
}
