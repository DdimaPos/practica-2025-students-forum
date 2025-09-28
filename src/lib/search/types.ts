export interface PostSearchResult {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface PostSearchResponse {
  results: PostSearchResult[];
  total: number;
}
