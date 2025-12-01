'use server';

import db from '@/db';
import { users, studentRatings } from '@/db/schema';
import { sql, eq, desc } from 'drizzle-orm';

export async function getUsersLeaderboard(): Promise<{
  users: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePictureUrl: string | null;
    avgRating: number;
    ratingsCount: number;
  }[];
  total: number;
}> {
  const avg = sql<number>`COALESCE(AVG(${studentRatings.rating}), 0)`;
  const count = sql<number>`COALESCE(COUNT(${studentRatings.id}), 0)`;

  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profilePictureUrl: users.profilePictureUrl,
      avgRating: avg.as('avgRating'),
      ratingsCount: count.as('ratingsCount'),
      total: sql<number>`COUNT(*) OVER()`.as('total'),
    })
    .from(users)
    .leftJoin(studentRatings, eq(studentRatings.ratedStudentId, users.id))
    .groupBy(users.id, users.firstName, users.lastName, users.profilePictureUrl)
    .orderBy(desc(avg), desc(count))
    .limit(4);

  if (rows.length === 0) {
    return { users: [], total: 0 };
  }

  const usersList = rows.map(row => ({
    id: row.id,
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    profilePictureUrl: row.profilePictureUrl,
    avgRating: Number(row.avgRating ?? 0),
    ratingsCount: row.ratingsCount ?? 0,
  }));

  return { users: usersList, total: rows[0].total ?? 0 };
}
