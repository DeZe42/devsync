import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PullRequestEntity } from '../entities/pull-request.enity'; // vagy .entity ha elírás volt
import { Repository } from 'typeorm';
import { GithubApiPullRequest } from '@devsync/shared-types';

@Injectable()
export class GithubSyncService {
  private readonly logger = new Logger(GithubSyncService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(PullRequestEntity)
    private readonly prRepository: Repository<PullRequestEntity>,
  ) {}

  /**
   * Lekéri egy adott repó Pull Requestjeit a GitHub API-ról, lapozással.
   */
  async fetchPullRequests(owner: string, repo: string, page = 1, perPage = 100): Promise<GithubApiPullRequest[]> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    
    // URL kiegészítése a page és per_page paraméterekkel
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=${perPage}&page=${page}`;

    try {
      this.logger.log(`Fetching PRs from: ${owner}/${repo} (Page: ${page})...`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(`Successfully fetched ${data.length} PR(s) on page ${page}.`);
      
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch data from GitHub', error);
      throw error;
    }
  }

  async syncPullRequestsToDb(owner: string, repo: string): Promise<void> {
    let page = 1;
    const perPage = 100; // 100 a maximum amit a GitHub enged
    let hasMore = true;
    let totalSaved = 0;

    this.logger.log(`Szinkronizáció indítása: ${owner}/${repo}`);

    // Ciklus, ami addig fut, amíg a GitHub ad vissza PR-eket
    while (hasMore) {
      const rawPrs = await this.fetchPullRequests(owner, repo, page, perPage);

      // Ha az aktuális oldalon már nincs PR, megszakítjuk a ciklust
      if (rawPrs.length === 0) {
        hasMore = false;
        break;
      }

      for (const rawPr of rawPrs) {
        const openedAtDate = new Date(rawPr.created_at);
        const mergedAtDate = rawPr.merged_at ? new Date(rawPr.merged_at) : null;

        let leadTimeInHours = 0;
        if (mergedAtDate) {
          const diffInMs = mergedAtDate.getTime() - openedAtDate.getTime();
          leadTimeInHours = Math.round(diffInMs / (1000 * 60 * 60)); // ms -> hours
        }

        await this.prRepository.upsert(
          {
            githubPrNumber: rawPr.number,
            author: rawPr.user.login,
            status: rawPr.state === 'open' ? 'OPEN' : (rawPr.merged_at ? 'MERGED' : 'CLOSED'),
            openedAt: openedAtDate,
            mergedAt: mergedAtDate,
            leadTime: leadTimeInHours,
          },
          ['githubPrNumber']
        );
      }

      totalSaved += rawPrs.length;
      page++; // Lépünk a következő oldalra
    }

    this.logger.log(`Kész! Összesen ${totalSaved} db PR lett szinkronizálva az adatbázisba!`);
  }
}