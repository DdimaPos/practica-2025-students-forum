import { ilike, and, desc, eq, or } from 'drizzle-orm';
import db from '@/db';
import { posts, users } from '@/db/schema';
import type { PostSearchResult } from './types';

function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .trim()
    .replace(/[%_\\]/g, '\\$&') 
    .replace(/['";`-]/g, ''); 
}

export async function searchPosts(
  query: string,
  limit?: number,
): Promise<{ results: PostSearchResult[]; total: number}> {

  const searchConditions = [];
  
  searchConditions.push(eq(posts.isActive, true));
  
  const sanitizedQuery = sanitizeSearchQuery(query);
  
  if (sanitizedQuery) {
    searchConditions.push(
      or(
        ilike(posts.title, `%${sanitizedQuery}%`),
        ilike(posts.content, `%${sanitizedQuery}%`)
      )
    );
  }

  const queryBuilder = db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorFirstName: users.firstName,
      authorLastName: users.lastName,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .where(and(...searchConditions))
    .orderBy(desc(posts.createdAt));

  const results = limit && limit > 0 
    ? await queryBuilder.limit(limit)
    : await queryBuilder;

  const finalResults = results;

  const transformedResults: PostSearchResult[] = finalResults.map(result => ({
    id: result.id,
    title: result.title,
    content: result.content,
    author: {
      id: result.authorId!,
      firstName: result.authorFirstName,
      lastName: result.authorLastName,
    },
    createdAt: result.createdAt!.toISOString(),
  }));

  return {
    results: transformedResults,
    total: finalResults.length,
  };
}
