// ...existing code...
export async function fetchAppUser(baseUrl?: string) {
  if (!baseUrl) {
    // Если BASE_URL не задан, возвращаем null — UI должен это обработать
    return null;
  }

  const res = await fetch(`${baseUrl}/api/user`, { cache: 'no-store' });

  if (!res.ok) {
    // If unauthorized or not found, return null so the UI can handle it
    return null;
  }

  // This endpoint returns just the application user row
  return (await res.json()) as {
    id: number;
    auth_id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    user_type: string | null;
    profile_picture_url: string | null;
    bio: string | null;
    year_of_study: number | null;
    is_verified: boolean;
  } | null;
}
// ...existing code...
