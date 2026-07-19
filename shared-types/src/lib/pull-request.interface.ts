export type PRStatus = 'OPEN' | 'MERGED' | 'CLOSED' | 'DRAFT';

export interface PullRequest {
  id: number;
  githubPrNumber: number;
  author: string;
  status: PRStatus;
  leadTime: number;
  mergedAt: Date | null;
  openedAt: Date | null;
}

// Ezt várjuk a GitHub API-tól. Csak azokat a mezőket írjuk le, amiket tényleg használunk is!
export interface GithubApiPullRequest {
  number: number;
  state: string; // 'open' vagy 'closed'
  user: {
    login: string;
  };
  created_at: string; // ISO Dátum string
  merged_at: string | null; // ISO Dátum string vagy null
}