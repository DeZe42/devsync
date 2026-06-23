export type PRStatus = 'OPEN' | 'MERGED' | 'CLOSED' | 'DRAFT';

export interface PullRequest {
  id: number;
  author: string;
  status: PRStatus;
  leadTime: number;
}