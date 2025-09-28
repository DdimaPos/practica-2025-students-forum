export interface PostSearchResult {
  id: number;
  title: string;
  content: string;
  author: {
    id: number | null;
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: string;
}

export interface PostSearchResponse {
  results: PostSearchResult[];
  total: number;
}
