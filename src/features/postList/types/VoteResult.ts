export interface VoteResult {
  success: boolean;
  action?: string;
  reactionType?: string | null;
  error?: string;
}