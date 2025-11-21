'use server';

import db from '@/db';
import { faculties, specialities } from '@/db/schema';
import { asc } from 'drizzle-orm';

export type Faculty = {
  id: string;
  name: string;
};

export type Speciality = {
  id: string;
  name: string;
  facultyId: string | null;
};

export async function getFaculties(): Promise<Faculty[]> {
  const rows = await db
    .select({
      id: faculties.id,
      name: faculties.name,
    })
    .from(faculties)
    .orderBy(asc(faculties.name));

  return rows;
}

export async function getSpecialities(): Promise<Speciality[]> {
  const rows = await db
    .select({
      id: specialities.id,
      name: specialities.name,
      facultyId: specialities.facultyId,
    })
    .from(specialities)
    .orderBy(asc(specialities.name));

  return rows;
}
