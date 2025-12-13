export interface PostSearchResult {
  id: string;
  title: string;
  content: string;
  author: {
    id: string | null;
    firstName: string | null;
    lastName: string | null;
    userType: 'student' | 'verified' | 'admin' | null;
    profilePictureUrl: string | null;
  };
  createdAt: string;
}

export interface PostSearchResponse {
  results: PostSearchResult[];
  total: number;
}
